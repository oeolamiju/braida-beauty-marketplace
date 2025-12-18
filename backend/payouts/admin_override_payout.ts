import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { PayoutStatus } from "./types";
import { createAuditLog } from "./payout_service";

export interface AdminOverridePayoutRequest {
  status: PayoutStatus;
  adminNotes: string;
}

export interface AdminOverridePayoutResponse {
  success: boolean;
}

export const adminOverridePayout = api(
  { method: "POST", path: "/admin/payouts/:id/override", expose: true, auth: true },
  async ({ id, status, adminNotes }: { id: number } & AdminOverridePayoutRequest): Promise<AdminOverridePayoutResponse> => {
    const auth = getAuthData()!;
    
    const user = await db.queryRow`
      SELECT user_type FROM users WHERE id = ${auth.userID}
    `;
    
    if (!user || user.user_type !== "admin") {
      throw APIError.permissionDenied("Admin access required");
    }
    
    const payout = await db.queryRow`
      SELECT id, status FROM payouts WHERE id = ${id}
    `;
    
    if (!payout) {
      throw APIError.notFound("Payout not found");
    }
    
    const oldStatus = payout.status;
    
    await db.exec`
      UPDATE payouts 
      SET 
        status = ${status},
        admin_notes = ${adminNotes},
        updated_at = NOW()
      WHERE id = ${id}
    `;
    
    await createAuditLog(
      id,
      auth.userID,
      "admin_override",
      oldStatus,
      status,
      { adminNotes }
    );
    
    return { success: true };
  }
);
