import { api } from "encore.dev/api";
import { requireFreelancer } from "../auth/middleware";
import db from "../db";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";

export interface VerificationStatusResponse {
  status: string;
  legalName?: string;
  dateOfBirth?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postcode?: string;
  submittedAt?: string;
  reviewedAt?: string;
  rejectionNote?: string;
}

export const getStatus = api<void, VerificationStatusResponse>(
  { method: "GET", path: "/verification/status", expose: true, auth: true },
  async (): Promise<VerificationStatusResponse> => {
    requireFreelancer();
    const auth = getAuthData() as AuthData;

    const result = await db.queryRow<{
      verification_status: string;
      verification_legal_name: string | null;
      verification_date_of_birth: Date | null;
      verification_address_line1: string | null;
      verification_address_line2: string | null;
      verification_city: string | null;
      verification_postcode: string | null;
      verification_submitted_at: Date | null;
      verification_reviewed_at: Date | null;
      verification_rejection_note: string | null;
    }>`
      SELECT
        verification_status,
        verification_legal_name,
        verification_date_of_birth,
        verification_address_line1,
        verification_address_line2,
        verification_city,
        verification_postcode,
        verification_submitted_at,
        verification_reviewed_at,
        verification_rejection_note
      FROM freelancer_profiles
      WHERE user_id = ${auth.userID}
    `;

    if (!result) {
      return { status: 'unverified' };
    }

    return {
      status: result.verification_status,
      legalName: result.verification_legal_name || undefined,
      dateOfBirth: result.verification_date_of_birth?.toISOString().split('T')[0],
      addressLine1: result.verification_address_line1 || undefined,
      addressLine2: result.verification_address_line2 || undefined,
      city: result.verification_city || undefined,
      postcode: result.verification_postcode || undefined,
      submittedAt: result.verification_submitted_at?.toISOString(),
      reviewedAt: result.verification_reviewed_at?.toISOString(),
      rejectionNote: result.verification_rejection_note || undefined,
    };
  }
);
