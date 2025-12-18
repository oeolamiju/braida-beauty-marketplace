import { api } from "encore.dev/api";
import { requireAdmin } from "../auth/middleware";
import db from "../db";

export interface VerificationSubmission {
  freelancerId: string;
  freelancerName: string;
  email: string;
  legalName: string;
  dateOfBirth: string;
  city: string;
  postcode: string;
  status: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface AdminListResponse {
  submissions: VerificationSubmission[];
}

export const adminList = api<void, AdminListResponse>(
  { method: "GET", path: "/verification/admin/list", expose: true, auth: true },
  async (): Promise<AdminListResponse> => {
    requireAdmin();

    const result = await db.queryAll<{
      user_id: string;
      first_name: string;
      last_name: string;
      email: string;
      verification_legal_name: string;
      verification_date_of_birth: Date;
      verification_city: string;
      verification_postcode: string;
      verification_status: string;
      verification_submitted_at: Date;
      verification_reviewed_at: Date | null;
    }>`
      SELECT
        fp.user_id,
        u.first_name,
        u.last_name,
        u.email,
        fp.verification_legal_name,
        fp.verification_date_of_birth,
        fp.verification_city,
        fp.verification_postcode,
        fp.verification_status,
        fp.verification_submitted_at,
        fp.verification_reviewed_at
      FROM freelancer_profiles fp
      JOIN users u ON u.id = fp.user_id
      WHERE fp.verification_status IN ('pending', 'verified', 'rejected')
      ORDER BY
        CASE fp.verification_status
          WHEN 'pending' THEN 1
          WHEN 'rejected' THEN 2
          WHEN 'verified' THEN 3
        END,
        fp.verification_submitted_at DESC
    `;

    const submissions: VerificationSubmission[] = result.map(row => ({
      freelancerId: row.user_id,
      freelancerName: `${row.first_name} ${row.last_name}`,
      email: row.email,
      legalName: row.verification_legal_name,
      dateOfBirth: row.verification_date_of_birth?.toISOString().split('T')[0] || '',
      city: row.verification_city,
      postcode: row.verification_postcode,
      status: row.verification_status,
      submittedAt: row.verification_submitted_at?.toISOString() || '',
      reviewedAt: row.verification_reviewed_at?.toISOString(),
    }));

    return { submissions };
  }
);
