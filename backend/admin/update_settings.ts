import { api, Header } from "encore.dev/api";
import { requireAdmin, logAdminAction } from "./middleware";
import { PlatformSettings } from "./get_settings";
import db from "../db";
import { getAuthData } from "~encore/auth";

export const updateSettings = api(
  { method: "POST", path: "/admin/settings", expose: true },
  async (req: PlatformSettings, ip?: Header<"x-forwarded-for">): Promise<void> => {
    await requireAdmin();

    const auth = getAuthData();

    const settingsMap: Record<string, number> = {
      commission_percentage: req.commissionPercentage,
      booking_fee_amount: req.bookingFeeAmount,
      auto_confirm_hours: req.autoConfirmHours,
      cancellation_free_hours: req.cancellationFreeHours,
      cancellation_partial_refund_hours: req.cancellationPartialRefundHours,
      cancellation_partial_refund_percentage: req.cancellationPartialRefundPercentage,
      dispute_window_days: req.disputeWindowDays,
      acceptance_timeout_hours: req.acceptanceTimeoutHours,
    };

    for (const [key, value] of Object.entries(settingsMap)) {
      await db.exec`
        UPDATE platform_settings
        SET value = ${JSON.stringify({ value })},
            updated_at = NOW(),
            updated_by = ${auth!.userID}
        WHERE key = ${key}
      `;
    }

    await logAdminAction("SETTINGS_UPDATED", "PLATFORM", "settings", req, ip);
  }
);
