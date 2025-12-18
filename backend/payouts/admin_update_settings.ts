import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { PayoutScheduleType } from "./types";

export interface AdminUpdateSettingsRequest {
  platformCommissionPercent?: number;
  bookingFeeFixed?: number;
  autoConfirmationTimeoutHours?: number;
  defaultPayoutSchedule?: PayoutScheduleType;
}

export interface AdminUpdateSettingsResponse {
  success: boolean;
}

export const adminUpdateSettings = api(
  { method: "PUT", path: "/admin/payouts/settings", expose: true, auth: true },
  async (req: AdminUpdateSettingsRequest): Promise<AdminUpdateSettingsResponse> => {
    const auth = getAuthData()!;
    
    const user = await db.queryRow`
      SELECT user_type FROM users WHERE id = ${auth.userID}
    `;
    
    if (!user || user.user_type !== "admin") {
      throw APIError.permissionDenied("Admin access required");
    }
    
    if (req.platformCommissionPercent !== undefined && 
        (req.platformCommissionPercent < 0 || req.platformCommissionPercent > 100)) {
      throw APIError.invalidArgument("Commission percent must be between 0 and 100");
    }
    
    if (req.bookingFeeFixed !== undefined && req.bookingFeeFixed < 0) {
      throw APIError.invalidArgument("Booking fee must be non-negative");
    }
    
    if (req.autoConfirmationTimeoutHours !== undefined && req.autoConfirmationTimeoutHours < 1) {
      throw APIError.invalidArgument("Timeout must be at least 1 hour");
    }
    
    const updates: string[] = [];
    const values: any[] = [];
    
    if (req.platformCommissionPercent !== undefined) {
      updates.push("platform_commission_percent = $" + (updates.length + 1));
      values.push(req.platformCommissionPercent);
    }
    
    if (req.bookingFeeFixed !== undefined) {
      updates.push("booking_fee_fixed = $" + (updates.length + 1));
      values.push(req.bookingFeeFixed);
    }
    
    if (req.autoConfirmationTimeoutHours !== undefined) {
      updates.push("auto_confirmation_timeout_hours = $" + (updates.length + 1));
      values.push(req.autoConfirmationTimeoutHours);
    }
    
    if (req.defaultPayoutSchedule !== undefined) {
      updates.push("default_payout_schedule = $" + (updates.length + 1));
      values.push(req.defaultPayoutSchedule);
    }
    
    if (updates.length > 0) {
      updates.push("updated_at = NOW()");
      const query = `UPDATE payout_settings SET ${updates.join(", ")} WHERE id = 1`;
      await db.exec(query as any, ...values);
    }
    
    return { success: true };
  }
);
