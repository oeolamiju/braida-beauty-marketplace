import { api } from "encore.dev/api";
import { requireFreelancer } from "../auth/middleware";
import db from "../db";
import { APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import { getVerificationDecision } from "./veriff_service";

export interface CompleteKycRequest {
  verificationId: string;
}

export interface CompleteKycResponse {
  status: string;
  message: string;
}

export const completeKyc = api<CompleteKycRequest, CompleteKycResponse>(
  { method: "POST", path: "/verification/complete-kyc", expose: false, auth: true },
  async (req): Promise<CompleteKycResponse> => {
    requireFreelancer();
    const auth = getAuthData() as AuthData;

    const profile = await db.queryRow<{
      verification_status: string;
      verification_applicant_id: string | null;
    }>`
      SELECT verification_status, verification_applicant_id
      FROM freelancer_profiles
      WHERE user_id = ${auth.userID}
    `;

    if (!profile) {
      throw APIError.notFound("Freelancer profile not found");
    }

    if (profile.verification_status === "verified") {
      throw APIError.failedPrecondition("Account is already verified");
    }

    if (!profile.verification_applicant_id) {
      throw APIError.failedPrecondition("No verification session found");
    }

    const decision = await getVerificationDecision(req.verificationId);

    let newStatus = "pending";
    if (decision.verification.status === "approved") {
      newStatus = "verified";
    } else if (decision.verification.status === "declined") {
      newStatus = "rejected";
    }

    await db.exec`
      UPDATE freelancer_profiles
      SET 
        verification_status = ${newStatus},
        verification_submitted_at = NOW(),
        verification_reviewed_at = ${newStatus !== "pending" ? "NOW()" : null},
        verification_rejection_note = ${decision.verification.reason || null},
        updated_at = NOW()
      WHERE user_id = ${auth.userID}
    `;

    await db.exec`
      INSERT INTO verification_action_logs (freelancer_id, action, previous_status, new_status, notes)
      VALUES (
        ${auth.userID},
        'kyc_submitted',
        ${profile.verification_status},
        ${newStatus},
        ${decision.verification.reason || 'KYC verification submitted'}
      )
    `;

    return {
      status: newStatus,
      message: newStatus === "verified" 
        ? "Verification complete! Your account is now verified."
        : newStatus === "rejected"
        ? `Verification declined: ${decision.verification.reason || "Please try again"}`
        : "Verification submitted. We will notify you once the check is complete.",
    };
  }
);
