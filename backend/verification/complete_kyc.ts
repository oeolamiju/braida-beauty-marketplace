import { api } from "encore.dev/api";
import { requireFreelancer } from "../auth/middleware";
import db from "../db";
import { APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import { createOnfidoCheck } from "./onfido";

export interface CompleteKycRequest {
  applicantId: string;
}

export interface CompleteKycResponse {
  checkId: string;
  status: string;
  message: string;
}

export const completeKyc = api<CompleteKycRequest, CompleteKycResponse>(
  { method: "POST", path: "/verification/complete-kyc", expose: false, auth: true },
  async (req): Promise<CompleteKycResponse> => {
    requireFreelancer();
    const auth = getAuthData() as AuthData;

    // Verify applicant ID matches
    const profile = await db.queryRow<{
      onfido_applicant_id: string | null;
      verification_status: string;
    }>`
      SELECT onfido_applicant_id, verification_status
      FROM freelancer_profiles
      WHERE user_id = ${auth.userID}
    `;

    if (!profile) {
      throw APIError.notFound("Freelancer profile not found");
    }

    if (profile.onfido_applicant_id !== req.applicantId) {
      throw APIError.permissionDenied("Invalid applicant ID");
    }

    if (profile.verification_status === "verified") {
      throw APIError.failedPrecondition("Account is already verified");
    }

    // Create verification check
    const check = await createOnfidoCheck(req.applicantId);

    // Update profile with check ID and pending status
    await db.exec`
      UPDATE freelancer_profiles
      SET 
        onfido_check_id = ${check.id},
        verification_status = 'pending',
        verification_submitted_at = NOW(),
        updated_at = NOW()
      WHERE user_id = ${auth.userID}
    `;

    // Log the action
    await db.exec`
      INSERT INTO verification_action_logs (freelancer_id, action, previous_status, new_status, notes)
      VALUES (
        ${auth.userID},
        'kyc_submitted',
        ${profile.verification_status},
        'pending',
        'KYC verification submitted via Onfido'
      )
    `;

    return {
      checkId: check.id,
      status: check.status,
      message: "Verification submitted. We will notify you once the check is complete.",
    };
  }
);

