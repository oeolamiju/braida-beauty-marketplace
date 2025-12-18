import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { APIError } from "encore.dev/api";
import { ResolutionType } from "./types";
import { refundPayment } from "../payments/stripe_service";
import { sendNotification } from "../notifications/send";
import { createPayoutRecord, calculatePayoutAmounts } from "../payouts/payout_service";

export interface AdminResolveDisputeRequest {
  dispute_id: string;
  resolution_type: ResolutionType;
  resolution_amount?: number;
  resolution_notes?: string;
  suspend_user_id?: string;
}

export interface AdminResolveDisputeResponse {
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

export const adminResolve = api(
  { method: "POST", path: "/admin/disputes/:dispute_id/resolve", auth: true, expose: true },
  async (req: AdminResolveDisputeRequest): Promise<AdminResolveDisputeResponse> => {
    const auth = getAuthData()!;

    const userRole = await db.rawQueryRow<{ role: string }>(
      `SELECT role FROM users WHERE id = $1`,
      auth.userID
    );

    if (userRole?.role !== "admin") {
      throw APIError.permissionDenied("Admin access required");
    }

    const dispute = await db.rawQueryRow<{ id: string; booking_id: string; raised_by: string }>(
      `SELECT id, booking_id, raised_by FROM disputes WHERE id = $1`,
      req.dispute_id
    );

    if (!dispute) {
      throw APIError.notFound("Dispute not found");
    }

    const booking = await db.rawQueryRow<{
      id: string;
      client_id: string;
      freelancer_id: string;
      total_amount: number;
    }>(
      `SELECT id, client_id, freelancer_id, total_amount FROM bookings WHERE id = $1`,
      dispute.booking_id
    );

    if (!booking) {
      throw APIError.notFound("Booking not found");
    }

    const payment = await db.rawQueryRow<{
      id: string;
      stripe_payment_intent_id: string;
      amount_pence: number;
      platform_fee_pence: number;
      escrow_status: string;
    }>(
      `SELECT id, stripe_payment_intent_id, amount_pence, platform_fee_pence, escrow_status
       FROM payments
       WHERE booking_id = $1 AND status = 'succeeded'
       ORDER BY created_at DESC
       LIMIT 1`,
      dispute.booking_id
    );

    if (!payment) {
      throw APIError.notFound("Payment not found");
    }

    let refundAmount = 0;
    let releaseToFreelancer = false;

    switch (req.resolution_type) {
      case "full_refund":
        refundAmount = payment.amount_pence;
        break;
      case "partial_refund":
        if (!req.resolution_amount || req.resolution_amount <= 0) {
          throw APIError.invalidArgument("Resolution amount required for partial refund");
        }
        refundAmount = Math.min(req.resolution_amount, payment.amount_pence);
        releaseToFreelancer = refundAmount < payment.amount_pence;
        break;
      case "release_to_freelancer":
        releaseToFreelancer = true;
        break;
      case "no_action":
        break;
    }

    if (refundAmount > 0) {
      try {
        await refundPayment({
          paymentIntentId: payment.stripe_payment_intent_id,
          amountPence: refundAmount,
          reason: "requested_by_customer"
        });

        await db.rawExec(
          `UPDATE payments
           SET escrow_status = 'refunded',
               updated_at = NOW()
           WHERE id = $1`,
          payment.id
        );
      } catch (error: any) {
        throw APIError.internal(`Failed to process refund: ${error.message}`);
      }
    }

    if (releaseToFreelancer && payment.escrow_status === "held") {
      const serviceAmount = (payment.amount_pence - refundAmount - payment.platform_fee_pence) / 100;
      
      if (serviceAmount > 0) {
        const amounts = await calculatePayoutAmounts(serviceAmount);
        
        try {
          await createPayoutRecord(
            booking.freelancer_id,
            parseInt(booking.id),
            amounts
          );
        } catch (error: any) {
          console.error("Failed to create payout record:", error.message);
        }
      }

      await db.rawExec(
        `UPDATE payments
         SET escrow_status = 'released',
             escrow_released_at = NOW(),
             updated_at = NOW()
         WHERE id = $1`,
        payment.id
      );
    }

    await db.rawExec(
      `UPDATE disputes
       SET status = 'resolved',
           resolution_type = $1,
           resolution_amount = $2,
           resolution_notes = $3,
           resolved_by = $4,
           resolved_at = NOW(),
           updated_at = NOW()
       WHERE id = $5`,
      req.resolution_type,
      req.resolution_amount || null,
      req.resolution_notes || null,
      auth.userID,
      req.dispute_id
    );

    if (req.suspend_user_id) {
      await db.rawExec(
        `UPDATE users SET status = 'suspended', updated_at = NOW() WHERE id = $1`,
        req.suspend_user_id
      );

      await logAudit(req.dispute_id, "user_suspended", auth.userID, {
        user_id: req.suspend_user_id,
      });
    }

    await logAudit(req.dispute_id, "dispute_resolved", auth.userID, {
      resolution_type: req.resolution_type,
      resolution_amount: req.resolution_amount,
      refund_amount: refundAmount,
      released_to_freelancer: releaseToFreelancer,
    });

    await sendNotification({
      userId: booking.client_id,
      type: "dispute_resolved",
      title: "Dispute Resolved",
      message: `Your dispute has been resolved: ${req.resolution_type.replace(/_/g, " ")}`,
      data: {
        booking_id: dispute.booking_id,
        dispute_id: req.dispute_id,
        resolution_type: req.resolution_type,
      },
    });

    await sendNotification({
      userId: booking.freelancer_id,
      type: "dispute_resolved",
      title: "Dispute Resolved",
      message: `A dispute on your booking has been resolved: ${req.resolution_type.replace(/_/g, " ")}`,
      data: {
        booking_id: dispute.booking_id,
        dispute_id: req.dispute_id,
        resolution_type: req.resolution_type,
      },
    });

    return { success: true };
  }
);
