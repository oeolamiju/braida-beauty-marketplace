import { secret } from "encore.dev/config";

const veriffApiKey = secret("VeriffApiKey");
const veriffApiSecret = secret("VeriffApiSecret");

const VERIFF_API_BASE = "https://stationapi.veriff.com/v1";

export interface CreateSessionRequest {
  verification: {
    person: {
      firstName: string;
      lastName: string;
      dateOfBirth?: string;
    };
    address?: {
      fullAddress: string;
      city?: string;
      postcode?: string;
    };
    vendorData?: string;
  };
}

export interface CreateSessionResponse {
  status: string;
  verification: {
    id: string;
    url: string;
    sessionToken: string;
    status: string;
  };
}

export interface VeriffDecision {
  status: string;
  verification: {
    id: string;
    status: string;
    code: number;
    reason?: string;
    person?: {
      firstName: string;
      lastName: string;
      dateOfBirth?: string;
    };
  };
}

export async function createVerificationSession(
  firstName: string,
  lastName: string,
  userId: string,
  dateOfBirth?: string,
  address?: string,
  city?: string,
  postcode?: string
): Promise<CreateSessionResponse> {
  const requestBody: CreateSessionRequest = {
    verification: {
      person: {
        firstName,
        lastName,
        dateOfBirth,
      },
      vendorData: userId,
    },
  };

  if (address || city || postcode) {
    requestBody.verification.address = {
      fullAddress: address || "",
      city,
      postcode,
    };
  }

  const response = await fetch(`${VERIFF_API_BASE}/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-AUTH-CLIENT": veriffApiKey(),
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Veriff API error: ${response.status} - ${errorText}`);
  }

  return (await response.json()) as CreateSessionResponse;
}

export async function getVerificationDecision(sessionId: string): Promise<VeriffDecision> {
  const signature = await generateSignature(sessionId);

  const response = await fetch(`${VERIFF_API_BASE}/sessions/${sessionId}/decision`, {
    method: "GET",
    headers: {
      "X-AUTH-CLIENT": veriffApiKey(),
      "X-SIGNATURE": signature,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Veriff API error: ${response.status} - ${errorText}`);
  }

  return (await response.json()) as VeriffDecision;
}

async function generateSignature(payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(veriffApiSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const expectedSignature = generateSignatureSync(payload);
  return signature.toLowerCase() === expectedSignature.toLowerCase();
}

function generateSignatureSync(payload: string): string {
  const crypto = require("crypto");
  return crypto.createHmac("sha256", veriffApiSecret()).update(payload).digest("hex");
}
