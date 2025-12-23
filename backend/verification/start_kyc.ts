import { api } from "encore.dev/api";
import { requireFreelancer } from "../auth/middleware";
import db from "../db";
import { APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import { createVerificationSession } from "./veriff_service";

export interface StartKycRequest {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  addressLine1?: string;
  postcode?: string;
  city?: string;
}

export interface StartKycResponse {
  sessionUrl: string;
  sessionToken: string;
  verificationId: string;
}

export const startKyc = api<StartKycRequest, StartKycResponse>(
  { method: "POST", path: "/verification/start-kyc", expose: true, auth: true },
  async (req): Promise<StartKycResponse> => {
    requireFreelancer();
    const auth = getAuthData() as AuthData;

    const existing = await db.queryRow<{
      verification_status: string;
    }>`
      SELECT verification_status
      FROM freelancer_profiles
      WHERE user_id = ${auth.userID}
    `;

    if (!existing) {
      throw APIError.notFound("Freelancer profile not found");
    }

    if (existing.verification_status === "verified") {
      throw APIError.failedPrecondition("Account is already verified");
    }

    const user = await db.queryRow<{ email: string }>`
      SELECT email FROM users WHERE id = ${auth.userID}
    `;

    if (!user?.email) {
      throw APIError.invalidArgument("User email not found");
    }

    const session = await createVerificationSession(
      req.firstName,
      req.lastName,
      auth.userID,
      req.dateOfBirth,
      req.addressLine1,
      req.city,
      req.postcode
    );

    await db.exec`
      UPDATE freelancer_profiles
      SET 
        verification_legal_name = ${req.firstName + ' ' + req.lastName},
        verification_date_of_birth = ${req.dateOfBirth || null},
        verification_address_line1 = ${req.addressLine1 || null},
        verification_postcode = ${req.postcode || null},
        verification_city = ${req.city || null},
        verification_applicant_id = ${session.verification.id},
        updated_at = NOW()
      WHERE user_id = ${auth.userID}
    `;

    return {
      sessionUrl: session.verification.url,
      sessionToken: session.verification.sessionToken,
      verificationId: session.verification.id,
    };
  }
);
