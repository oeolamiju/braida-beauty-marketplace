import { secret } from "encore.dev/config";
import { APIError } from "encore.dev/api";

const onfidoApiKey = secret("OnfidoAPIKey");
const ONFIDO_BASE_URL = "https://api.eu.onfido.com/v3.6";

interface OnfidoApplicant {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email?: string;
  dob?: string;
  address?: {
    postcode?: string;
    country?: string;
    line1?: string;
    town?: string;
  };
}

interface OnfidoDocument {
  id: string;
  created_at: string;
  file_name: string;
  file_type: string;
  type: string;
  side?: string;
  issuing_country?: string;
}

interface OnfidoCheck {
  id: string;
  created_at: string;
  status: "in_progress" | "awaiting_applicant" | "complete" | "withdrawn" | "paused" | "reopened";
  result?: "clear" | "consider";
  applicant_id: string;
}

interface OnfidoSdkToken {
  token: string;
}

export async function createOnfidoApplicant(
  firstName: string,
  lastName: string,
  email: string,
  dateOfBirth?: string,
  address?: {
    line1?: string;
    postcode?: string;
    town?: string;
  }
): Promise<OnfidoApplicant> {
  const apiKey = onfidoApiKey();
  
  const body: any = {
    first_name: firstName,
    last_name: lastName,
    email,
  };
  
  if (dateOfBirth) {
    body.dob = dateOfBirth;
  }
  
  if (address) {
    body.address = {
      ...address,
      country: "GBR",
    };
  }

  const response = await fetch(`${ONFIDO_BASE_URL}/applicants`, {
    method: "POST",
    headers: {
      "Authorization": `Token token=${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Onfido create applicant error:", error);
    throw APIError.internal("Failed to create verification applicant");
  }

  return response.json();
}

export async function uploadOnfidoDocument(
  applicantId: string,
  documentData: Buffer,
  documentType: "passport" | "driving_licence" | "national_identity_card" | "residence_permit"
): Promise<OnfidoDocument> {
  const apiKey = onfidoApiKey();
  
  const formData = new FormData();
  formData.append("file", new Blob([documentData]), "document.jpg");
  formData.append("type", documentType);
  formData.append("applicant_id", applicantId);

  const response = await fetch(`${ONFIDO_BASE_URL}/documents`, {
    method: "POST",
    headers: {
      "Authorization": `Token token=${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Onfido upload document error:", error);
    throw APIError.internal("Failed to upload document for verification");
  }

  return response.json();
}

export async function createOnfidoCheck(applicantId: string): Promise<OnfidoCheck> {
  const apiKey = onfidoApiKey();

  const response = await fetch(`${ONFIDO_BASE_URL}/checks`, {
    method: "POST",
    headers: {
      "Authorization": `Token token=${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      applicant_id: applicantId,
      report_names: ["document", "identity_enhanced"],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Onfido create check error:", error);
    throw APIError.internal("Failed to create verification check");
  }

  return response.json();
}

export async function getOnfidoCheck(checkId: string): Promise<OnfidoCheck> {
  const apiKey = onfidoApiKey();

  const response = await fetch(`${ONFIDO_BASE_URL}/checks/${checkId}`, {
    method: "GET",
    headers: {
      "Authorization": `Token token=${apiKey}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Onfido get check error:", error);
    throw APIError.internal("Failed to retrieve verification status");
  }

  return response.json();
}

export async function generateOnfidoSdkToken(applicantId: string, referrer: string = "*/*"): Promise<OnfidoSdkToken> {
  const apiKey = onfidoApiKey();

  const response = await fetch(`${ONFIDO_BASE_URL}/sdk_token`, {
    method: "POST",
    headers: {
      "Authorization": `Token token=${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      applicant_id: applicantId,
      referrer,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Onfido generate SDK token error:", error);
    throw APIError.internal("Failed to generate verification token");
  }

  return response.json();
}

// Webhook verification
export function verifyOnfidoWebhookSignature(
  signature: string,
  payload: string,
  webhookSecret: string
): boolean {
  const crypto = require("crypto");
  const computedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(payload)
    .digest("hex");
  return signature === computedSignature;
}

// Map Onfido document types to our internal types
export function mapDocumentType(internalType: "passport" | "brp" | "driving_licence"): "passport" | "driving_licence" | "residence_permit" {
  switch (internalType) {
    case "passport":
      return "passport";
    case "brp":
      return "residence_permit";
    case "driving_licence":
      return "driving_licence";
    default:
      return "passport";
  }
}

