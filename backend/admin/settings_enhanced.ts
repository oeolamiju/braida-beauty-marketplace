import { api } from "encore.dev/api";
import db from "../db";
import { requireAdminPermission } from "./rbac";
import { APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";

export interface PlatformSettings {
  // Cancellation policy
  cancellationWindows: {
    fullRefundHours: number;      // Hours before booking for full refund
    partialRefundHours: number;   // Hours before booking for partial refund
    partialRefundPercent: number; // Percentage refunded for partial
  };
  
  // Timeouts
  acceptanceTimeoutHours: number;      // Hours before booking auto-declines
  autoConfirmTimeoutHours: number;     // Hours after service for auto-confirmation
  disputeWindowDays: number;           // Days after service to raise dispute
  
  // Fees
  commissionPercent: number;           // Platform commission
  bookingFeePence: number;             // Fixed booking fee
  
  // Payouts
  defaultPayoutSchedule: "weekly" | "biweekly" | "per_transaction";
  minimumPayoutPence: number;
}

export const getSettings = api(
  { method: "GET", path: "/admin/settings/platform", expose: true, auth: true },
  async (): Promise<PlatformSettings> => {
    await requireAdminPermission("settings", "view");

    const settings = await db.queryRow<{
      full_refund_hours: number;
      partial_refund_hours: number;
      partial_refund_percent: number;
      acceptance_timeout_hours: number;
      auto_confirm_timeout_hours: number;
      dispute_window_days: number;
      commission_percent: number;
      booking_fee_pence: number;
      default_payout_schedule: string;
      minimum_payout_pence: number;
    }>`
      SELECT 
        full_refund_hours,
        partial_refund_hours,
        partial_refund_percent,
        acceptance_timeout_hours,
        auto_confirm_timeout_hours,
        dispute_window_days,
        commission_percent,
        booking_fee_pence,
        default_payout_schedule,
        minimum_payout_pence
      FROM platform_settings
      LIMIT 1
    `;

    if (!settings) {
      // Return defaults
      return {
        cancellationWindows: {
          fullRefundHours: 48,
          partialRefundHours: 24,
          partialRefundPercent: 50,
        },
        acceptanceTimeoutHours: 24,
        autoConfirmTimeoutHours: 72,
        disputeWindowDays: 14,
        commissionPercent: 10,
        bookingFeePence: 200,
        defaultPayoutSchedule: "weekly",
        minimumPayoutPence: 1000,
      };
    }

    return {
      cancellationWindows: {
        fullRefundHours: settings.full_refund_hours,
        partialRefundHours: settings.partial_refund_hours,
        partialRefundPercent: settings.partial_refund_percent,
      },
      acceptanceTimeoutHours: settings.acceptance_timeout_hours,
      autoConfirmTimeoutHours: settings.auto_confirm_timeout_hours,
      disputeWindowDays: settings.dispute_window_days,
      commissionPercent: settings.commission_percent,
      bookingFeePence: settings.booking_fee_pence,
      defaultPayoutSchedule: settings.default_payout_schedule as any,
      minimumPayoutPence: settings.minimum_payout_pence,
    };
  }
);

export const updateSettings = api(
  { method: "PUT", path: "/admin/settings/platform", expose: true, auth: true },
  async (req: Partial<PlatformSettings>): Promise<{ success: boolean }> => {
    await requireAdminPermission("settings", "edit");
    const auth = getAuthData()!;

    // Build update query dynamically
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (req.cancellationWindows) {
      if (req.cancellationWindows.fullRefundHours !== undefined) {
        updates.push(`full_refund_hours = $${paramIndex++}`);
        params.push(req.cancellationWindows.fullRefundHours);
      }
      if (req.cancellationWindows.partialRefundHours !== undefined) {
        updates.push(`partial_refund_hours = $${paramIndex++}`);
        params.push(req.cancellationWindows.partialRefundHours);
      }
      if (req.cancellationWindows.partialRefundPercent !== undefined) {
        updates.push(`partial_refund_percent = $${paramIndex++}`);
        params.push(req.cancellationWindows.partialRefundPercent);
      }
    }

    if (req.acceptanceTimeoutHours !== undefined) {
      updates.push(`acceptance_timeout_hours = $${paramIndex++}`);
      params.push(req.acceptanceTimeoutHours);
    }

    if (req.autoConfirmTimeoutHours !== undefined) {
      updates.push(`auto_confirm_timeout_hours = $${paramIndex++}`);
      params.push(req.autoConfirmTimeoutHours);
    }

    if (req.disputeWindowDays !== undefined) {
      updates.push(`dispute_window_days = $${paramIndex++}`);
      params.push(req.disputeWindowDays);
    }

    if (req.commissionPercent !== undefined) {
      updates.push(`commission_percent = $${paramIndex++}`);
      params.push(req.commissionPercent);
    }

    if (req.bookingFeePence !== undefined) {
      updates.push(`booking_fee_pence = $${paramIndex++}`);
      params.push(req.bookingFeePence);
    }

    if (req.defaultPayoutSchedule !== undefined) {
      updates.push(`default_payout_schedule = $${paramIndex++}`);
      params.push(req.defaultPayoutSchedule);
    }

    if (req.minimumPayoutPence !== undefined) {
      updates.push(`minimum_payout_pence = $${paramIndex++}`);
      params.push(req.minimumPayoutPence);
    }

    if (updates.length > 0) {
      updates.push("updated_at = NOW()");
      
      await db.rawQuery(
        `UPDATE platform_settings SET ${updates.join(", ")} WHERE id = 1`,
        ...params
      );

      // Log the change
      await db.exec`
        INSERT INTO admin_audit_log (admin_id, action, target_type, target_id, details)
        VALUES (
          ${auth.userID}, 
          'update_settings', 
          'platform_settings', 
          '1', 
          ${JSON.stringify(req)}
        )
      `;
    }

    return { success: true };
  }
);

