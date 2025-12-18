import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { AccountStatus } from "./types";

export interface AdminAccountActionRequest {
  reportId: string;
  userId: string;
  action: "warn" | "suspend" | "ban" | "reactivate";
  notes?: string;
  suspendUntil?: Date;
  suspensionReason?: string;
}

export interface AdminAccountActionResponse {
  success: boolean;
  newStatus: AccountStatus;
}

export const adminAccountAction = api(
  { method: "POST", path: "/admin/reports/account-action", expose: true, auth: true },
  async (req: AdminAccountActionRequest): Promise<AdminAccountActionResponse> => {
    const auth = getAuthData()!;

    const admin = await db.queryRow<{ role: string }>`
      SELECT role FROM users WHERE id = ${auth.userID}
    `;

    if (!admin || admin.role !== "admin") {
      throw new Error("Admin access required");
    }

    const report = await db.queryRow<{ id: string }>`
      SELECT id FROM reports WHERE id = ${req.reportId}
    `;

    if (!report) {
      throw new Error("Report not found");
    }

    const user = await db.queryRow<{ 
      id: string; 
      account_status: AccountStatus;
    }>`
      SELECT id, account_status FROM users WHERE id = ${req.userId}
    `;

    if (!user) {
      throw new Error("User not found");
    }

    const previousStatus = user.account_status;
    let newStatus: AccountStatus;

    switch (req.action) {
      case "warn":
        newStatus = "warned";
        break;
      case "suspend":
        newStatus = "suspended";
        break;
      case "ban":
        newStatus = "banned";
        break;
      case "reactivate":
        newStatus = "active";
        break;
      default:
        throw new Error("Invalid action");
    }

    await db.exec`
      UPDATE users 
      SET 
        account_status = ${newStatus},
        suspension_reason = ${req.suspensionReason || null},
        suspended_until = ${req.suspendUntil || null}
      WHERE id = ${req.userId}
    `;

    await db.exec`
      INSERT INTO report_admin_actions (
        report_id,
        admin_id,
        action_type,
        notes,
        previous_account_status,
        new_account_status
      )
      VALUES (
        ${req.reportId},
        ${auth.userID},
        ${req.action},
        ${req.notes || null},
        ${previousStatus},
        ${newStatus}
      )
    `;

    return { success: true, newStatus };
  }
);
