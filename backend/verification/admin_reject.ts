import { api } from "encore.dev/api";
import { requireAdmin } from "../auth/middleware";
import db from "../db";
import { APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";

export interface AdminRejectRequest {
  freelancerId: string;
  rejectionNote: string;
}

export interface AdminRejectResponse {
  status: string;
}

export const adminReject = api<AdminRejectRequest, AdminRejectResponse>(
  { method: "POST", path: "/verification/admin/reject", expose: true, auth: true },
  async (req): Promise<AdminRejectResponse> => {
    requireAdmin();
    const auth = getAuthData() as AuthData;

    if (!req.rejectionNote || req.rejectionNote.trim().length === 0) {
      throw APIError.invalidArgument("rejection note is required");
    }

    const previousStatus = await db.queryRow<{ verification_status: string }>`
      SELECT verification_status FROM freelancer_profiles WHERE user_id = ${req.freelancerId}
    `;

    if (!previousStatus) {
      throw APIError.notFound("freelancer not found");
    }

    if (previousStatus.verification_status !== 'pending') {
      throw APIError.invalidArgument("can only reject pending verifications");
    }

    await db.exec`
      UPDATE freelancer_profiles
      SET
        verification_status = 'rejected',
        verification_reviewed_at = NOW(),
        verification_reviewed_by = ${auth.userID},
        verification_rejection_note = ${req.rejectionNote},
        updated_at = NOW()
      WHERE user_id = ${req.freelancerId}
    `;

    await db.exec`
      INSERT INTO verification_action_logs (freelancer_id, admin_id, action, previous_status, new_status, notes)
      VALUES (${req.freelancerId}, ${auth.userID}, 'rejected', 'pending', 'rejected', ${req.rejectionNote})
    `;

    await db.exec`
      INSERT INTO admin_action_logs (admin_id, entity_type, entity_id, action_type, details_json)
      VALUES (${auth.userID}, 'verification', ${req.freelancerId}, 'reject', ${JSON.stringify({ rejectionNote: req.rejectionNote })})
    `;

    return { status: 'rejected' };
  }
);
