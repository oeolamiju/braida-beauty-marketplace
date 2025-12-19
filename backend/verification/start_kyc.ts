import { api } from "encore.dev/api";
import { requireFreelancer } from "../auth/middleware";
import db from "../db";
import { APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import { createOnfidoApplicant, generateOnfidoSdkToken } from "./onfido";

export interface StartKycRequest {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  addressLine1?: string;
  postcode?: string;
  city?: string;
}

export interface StartKycResponse {
  sdkToken: string;
  applicantId: string;
}

export const startKyc = api<StartKycRequest, StartKycResponse>(
  { method: "POST", path: "/verification/start-kyc", expose: false, auth: true },
  async (req): Promise<StartKycResponse> => {
    requireFreelancer();
    const auth = getAuthData() as AuthData;

    // Check if already verified or has pending verification
    const existing = await db.queryRow<{
      verification_status: string;
      onfido_applicant_id: string | null;
    }>`
      SELECT verification_status, onfido_applicant_id
      FROM freelancer_profiles
      WHERE user_id = ${auth.userID}
    `;

    if (!existing) {
      throw APIError.notFound("Freelancer profile not found");
    }

    if (existing.verification_status === "verified") {
      throw APIError.failedPrecondition("Account is already verified");
    }

    // Get user email
    const user = await db.queryRow<{ email: string }>`
      SELECT email FROM users WHERE id = ${auth.userID}
    `;

    if (!user?.email) {
      throw APIError.invalidArgument("User email not found");
    }

    let applicantId = existing.onfido_applicant_id;

    // Create Onfido applicant if not exists
    if (!applicantId) {
      const applicant = await createOnfidoApplicant(
        req.firstName,
        req.lastName,
        user.email,
        req.dateOfBirth,
        req.addressLine1 ? {
          line1: req.addressLine1,
          postcode: req.postcode,
          town: req.city,
        } : undefined
      );

      applicantId = applicant.id;

      // Store applicant ID
      await db.exec`
        UPDATE freelancer_profiles
        SET 
          onfido_applicant_id = ${applicantId},
          verification_legal_name = ${req.firstName + ' ' + req.lastName},
          verification_date_of_birth = ${req.dateOfBirth || null},
          verification_address_line1 = ${req.addressLine1 || null},
          verification_postcode = ${req.postcode || null},
          verification_city = ${req.city || null},
          updated_at = NOW()
        WHERE user_id = ${auth.userID}
      `;
    }

    // Generate SDK token for frontend
    const sdkToken = await generateOnfidoSdkToken(applicantId);

    return {
      sdkToken: sdkToken.token,
      applicantId,
    };
  }
);

