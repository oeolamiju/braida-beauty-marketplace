import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { ReportStatus } from "./types";

export interface AdminUpdateStatusRequest {
  reportId: string;
  status: ReportStatus;
  notes?: string;
}

export interface AdminUpdateStatusResponse {
  success: boolean;
}

export const adminUpdateStatus = api(
  { method: "POST", path: "/admin/reports/update-status", expose: true, auth: true },
  async (req: AdminUpdateStatusRequest): Promise<AdminUpdateStatusResponse> => {
    const auth = getAuthData()!;

    const user = await db.queryRow<{ role: string }>`
      SELECT role FROM users WHERE id = ${auth.userID}
    `;

    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }

    const report = await db.queryRow<{ id: string }>`
      SELECT id FROM reports WHERE id = ${req.reportId}
    `;

    if (!report) {
      throw new Error("Report not found");
    }

    await db.exec`
      UPDATE reports 
      SET status = ${req.status}, updated_at = NOW()
      WHERE id = ${req.reportId}
    `;

    await db.exec`
      INSERT INTO report_admin_actions (
        report_id,
        admin_id,
        action_type,
        notes
      )
      VALUES (
        ${req.reportId},
        ${auth.userID},
        ${"status_update"},
        ${req.notes || null}
      )
    `;

    return { success: true };
  }
);
