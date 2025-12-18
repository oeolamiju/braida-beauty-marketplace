import { api } from "encore.dev/api";
import { requireAdmin } from "./middleware";
import db from "../db";

export interface PlatformSettings {
  commissionPercentage: number;
  bookingFeeAmount: number;
  autoConfirmHours: number;
  cancellationFreeHours: number;
  cancellationPartialRefundHours: number;
  cancellationPartialRefundPercentage: number;
  disputeWindowDays: number;
  acceptanceTimeoutHours: number;
}

export const getSettings = api(
  { method: "GET", path: "/admin/settings", expose: true },
  async (): Promise<PlatformSettings> => {
    await requireAdmin();

    const settings = await db.queryAll<any>`
      SELECT key, value
      FROM platform_settings
    `;

    const settingsMap: Record<string, any> = {};
    settings.forEach((row: any) => {
      settingsMap[row.key] = row.value.value;
    });

    return {
      commissionPercentage: settingsMap.commission_percentage || 15,
      bookingFeeAmount: settingsMap.booking_fee_amount || 2.0,
      autoConfirmHours: settingsMap.auto_confirm_hours || 72,
      cancellationFreeHours: settingsMap.cancellation_free_hours || 48,
      cancellationPartialRefundHours: settingsMap.cancellation_partial_refund_hours || 24,
      cancellationPartialRefundPercentage: settingsMap.cancellation_partial_refund_percentage || 50,
      disputeWindowDays: settingsMap.dispute_window_days || 7,
      acceptanceTimeoutHours: settingsMap.acceptance_timeout_hours || 48,
    };
  }
);
