import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { APIError } from "encore.dev/api";
import { DisputeStatus } from "./types";

export interface AdminUpdateStatusRequest {
  dispute_id: string;
  status: DisputeStatus;
}

export interface AdminUpdateStatusResponse {
  success: boolean;
}

async function logAudit(
  dispute_id: string,
  action: string,
  performed_by: string,
  details: Record<string, any>
) {
  await db.rawExec(
    `INSERT INTO dispute_audit_logs (dispute_id, action, performed_by, details)
     VALUES ($1, $2, $3, $4)`,
    dispute_id, action, performed_by, JSON.stringify(details)
  );
}

export const adminUpdateStatus = api(
  { method: "POST", path: "/admin/disputes/:dispute_id/status", auth: true, expose: true },
  async (req: AdminUpdateStatusRequest): Promise<AdminUpdateStatusResponse> => {
    const auth = getAuthData()!;

    const userRole = await db.rawQueryRow<{ role: string }>(
      `SELECT role FROM users WHERE id = $1`,
      auth.userID
    );

    if (userRole?.role !== "admin") {
      throw APIError.permissionDenied("Admin access required");
    }

    const dispute = await db.rawQueryRow<{ id: string; status: string }>(
      `SELECT id, status FROM disputes WHERE id = $1`,
      req.dispute_id
    );

    if (!dispute) {
      throw APIError.notFound("Dispute not found");
    }

    await db.rawExec(
      `UPDATE disputes SET status = $1, updated_at = NOW() WHERE id = $2`,
      req.status, req.dispute_id
    );

    await logAudit(req.dispute_id, "status_updated", auth.userID, {
      old_status: dispute.status,
      new_status: req.status,
    });

    return { success: true };
  }
);
