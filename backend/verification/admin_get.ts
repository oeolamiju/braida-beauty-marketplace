import { api } from "encore.dev/api";
import { requireAdmin } from "../auth/middleware";
import db from "../db";
import { APIError } from "encore.dev/api";

export interface AdminGetRequest {
  freelancerId: string;
}

export interface ActionLog {
  action: string;
  previousStatus?: string;
  newStatus: string;
  notes?: string;
  adminName?: string;
  createdAt: string;
}

export interface AdminGetResponse {
  freelancerId: string;
  freelancerName: string;
  email: string;
  displayName: string;
  legalName: string;
  dateOfBirth: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postcode: string;
  status: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionNote?: string;
  actionLogs: ActionLog[];
}

export const adminGet = api<AdminGetRequest, AdminGetResponse>(
  { method: "GET", path: "/verification/admin/:freelancerId", expose: true, auth: true },
  async (req): Promise<AdminGetResponse> => {
    requireAdmin();

    const result = await db.queryRow<{
      user_id: string;
      first_name: string;
      last_name: string;
      email: string;
      display_name: string;
      verification_legal_name: string;
      verification_date_of_birth: Date;
      verification_address_line1: string;
      verification_address_line2: string | null;
      verification_city: string;
      verification_postcode: string;
      verification_status: string;
      verification_submitted_at: Date;
      verification_reviewed_at: Date | null;
      verification_rejection_note: string | null;
      reviewer_first_name: string | null;
      reviewer_last_name: string | null;
    }>`
      SELECT
        fp.user_id,
        u.first_name,
        u.last_name,
        u.email,
        fp.display_name,
        fp.verification_legal_name,
        fp.verification_date_of_birth,
        fp.verification_address_line1,
        fp.verification_address_line2,
        fp.verification_city,
        fp.verification_postcode,
        fp.verification_status,
        fp.verification_submitted_at,
        fp.verification_reviewed_at,
        fp.verification_rejection_note,
        reviewer.first_name as reviewer_first_name,
        reviewer.last_name as reviewer_last_name
      FROM freelancer_profiles fp
      JOIN users u ON u.id = fp.user_id
      LEFT JOIN users reviewer ON reviewer.id = fp.verification_reviewed_by
      WHERE fp.user_id = ${req.freelancerId}
    `;

    if (!result) {
      throw APIError.notFound("freelancer not found");
    }

    const logsResult = await db.queryAll<{
      action: string;
      previous_status: string | null;
      new_status: string;
      notes: string | null;
      created_at: Date;
      first_name: string | null;
      last_name: string | null;
    }>`
      SELECT
        val.action,
        val.previous_status,
        val.new_status,
        val.notes,
        val.created_at,
        u.first_name,
        u.last_name
      FROM verification_action_logs val
      LEFT JOIN users u ON u.id = val.admin_id
      WHERE val.freelancer_id = ${req.freelancerId}
      ORDER BY val.created_at DESC
    `;

    const actionLogs: ActionLog[] = logsResult.map((log) => ({
      action: log.action,
      previousStatus: log.previous_status || undefined,
      newStatus: log.new_status,
      notes: log.notes || undefined,
      adminName: log.first_name && log.last_name ? `${log.first_name} ${log.last_name}` : undefined,
      createdAt: log.created_at.toISOString(),
    }));

    return {
      freelancerId: result.user_id,
      freelancerName: `${result.first_name} ${result.last_name}`,
      email: result.email,
      displayName: result.display_name,
      legalName: result.verification_legal_name,
      dateOfBirth: result.verification_date_of_birth?.toISOString().split('T')[0] || '',
      addressLine1: result.verification_address_line1,
      addressLine2: result.verification_address_line2 || undefined,
      city: result.verification_city,
      postcode: result.verification_postcode,
      status: result.verification_status,
      submittedAt: result.verification_submitted_at?.toISOString() || '',
      reviewedAt: result.verification_reviewed_at?.toISOString(),
      reviewedBy: result.reviewer_first_name && result.reviewer_last_name
        ? `${result.reviewer_first_name} ${result.reviewer_last_name}`
        : undefined,
      rejectionNote: result.verification_rejection_note || undefined,
      actionLogs,
    };
  }
);
