import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { PayoutSettings } from "./types";

export interface AdminGetSettingsResponse {
  settings: PayoutSettings;
}

export const adminGetSettings = api(
  { method: "GET", path: "/admin/payouts/settings", expose: true, auth: true },
  async (): Promise<AdminGetSettingsResponse> => {
    const auth = getAuthData()!;
    
    const user = await db.queryRow`
      SELECT user_type FROM users WHERE id = ${auth.userID}
    `;
    
    if (!user || user.user_type !== "admin") {
      throw APIError.permissionDenied("Admin access required");
    }
    
    const settings = await db.queryRow<{
      id: number;
      platform_commission_percent: number;
      booking_fee_fixed: number;
      auto_confirmation_timeout_hours: number;
      default_payout_schedule: string;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT 
        id,
        platform_commission_percent,
        booking_fee_fixed,
        auto_confirmation_timeout_hours,
        default_payout_schedule,
        created_at,
        updated_at
      FROM payout_settings
      WHERE id = 1
    `;
    
    if (!settings) {
      throw APIError.notFound("Payment settings not found");
    }
    
    return {
      settings: {
        id: settings.id,
        platformCommissionPercent: parseFloat(settings.platform_commission_percent.toString()),
        bookingFeeFixed: parseFloat(settings.booking_fee_fixed.toString()),
        autoConfirmationTimeoutHours: settings.auto_confirmation_timeout_hours,
        defaultPayoutSchedule: settings.default_payout_schedule as any,
        createdAt: new Date(settings.created_at),
        updatedAt: new Date(settings.updated_at),
      },
    };
  }
);
