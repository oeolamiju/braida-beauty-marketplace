import { api } from "encore.dev/api";
import { requireAdmin } from "../auth/middleware";
import db from "../db";
import { APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import { logVerificationEvent } from "../shared/logger";
import { sendNotification } from "../notifications/send";

export interface AdminApproveRequest {
  freelancerId: string;
  notes?: string;
}

export interface AdminApproveResponse {
  status: string;
}

export const adminApprove = api<AdminApproveRequest, AdminApproveResponse>(
  { method: "POST", path: "/verification/admin/approve", expose: true, auth: true },
  async (req): Promise<AdminApproveResponse> => {
    requireAdmin();
    const auth = getAuthData() as AuthData;

    const previousStatus = await db.queryRow<{ verification_status: string }>`
      SELECT verification_status FROM freelancer_profiles WHERE user_id = ${req.freelancerId}
    `;

    if (!previousStatus) {
      throw APIError.notFound("freelancer not found");
    }

    if (previousStatus.verification_status !== 'pending') {
      throw APIError.invalidArgument("can only approve pending verifications");
    }

    await db.exec`
      UPDATE freelancer_profiles
      SET
        verification_status = 'verified',
        verification_reviewed_at = NOW(),
        verification_reviewed_by = ${auth.userID},
        verification_rejection_note = NULL,
        updated_at = NOW()
      WHERE user_id = ${req.freelancerId}
    `;

    await db.exec`
      INSERT INTO verification_action_logs (freelancer_id, admin_id, action, previous_status, new_status, notes)
      VALUES (${req.freelancerId}, ${auth.userID}, 'approved', 'pending', 'verified', ${req.notes || null})
    `;

    await db.exec`
      INSERT INTO admin_action_logs (admin_id, entity_type, entity_id, action_type, details_json)
      VALUES (${auth.userID}, 'verification', ${req.freelancerId}, 'approve', ${JSON.stringify({ notes: req.notes })})
    `;

    logVerificationEvent("approved", req.freelancerId, {
      adminId: auth.userID,
      previousStatus: 'pending',
      newStatus: 'verified',
    });

    await sendNotification({
      userId: req.freelancerId,
      type: "verification_approved",
      title: "Profile Verified! 🎉",
      message: "Your freelancer profile has been verified! You can now switch to freelancer mode and start accepting bookings.",
      data: {
        verifiedAt: new Date().toISOString(),
        notes: req.notes,
      },
    });

    return { status: 'verified' };
  }
);
