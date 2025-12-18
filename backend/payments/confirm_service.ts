import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import db from "../db";
import { sendNotification } from "../notifications/send";
import { calculatePayoutAmounts, createPayoutRecord } from "../payouts/payout_service";
import { logBookingEvent, logPaymentEvent } from "../shared/logger";

export interface ConfirmServiceRequest {
  bookingId: number;
}

export interface ConfirmServiceResponse {
  message: string;
}

export const confirmService = api<ConfirmServiceRequest, ConfirmServiceResponse>(
  { auth: true, expose: true, method: "POST", path: "/payments/:bookingId/confirm" },
  async (req) => {
    const auth = getAuthData()! as AuthData;

    const booking = await db.queryRow<{
      id: number;
      client_id: string;
      freelancer_id: string;
      status: string;
      payment_status: string;
      end_datetime: string;
    }>`
      SELECT id, client_id, freelancer_id, status, payment_status, end_datetime
      FROM bookings
      WHERE id = ${req.bookingId}
    `;

    if (!booking) {
      throw APIError.notFound("Booking not found");
    }

    if (auth.userID !== booking.client_id && auth.role !== 'admin') {
      throw APIError.permissionDenied("Only the client can confirm service completion");
    }

    if (booking.status !== 'confirmed') {
      throw APIError.invalidArgument("Booking must be in confirmed status");
    }

    if (booking.payment_status !== 'paid') {
      throw APIError.invalidArgument("Booking payment must be completed");
    }

    const payment = await db.queryRow<{
      id: number;
      escrow_status: string;
      amount_pence: number;
      platform_fee_pence: number;
    }>`
      SELECT id, escrow_status, amount_pence, platform_fee_pence
      FROM payments
      WHERE booking_id = ${req.bookingId} AND status = 'succeeded'
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (!payment) {
      throw APIError.notFound("Payment not found");
    }

    if (payment.escrow_status !== 'held') {
      throw APIError.invalidArgument("Payment escrow must be in held status");
    }

    await db.exec`
      UPDATE payments
      SET escrow_status = 'released',
          escrow_released_at = NOW(),
          updated_at = NOW()
      WHERE id = ${payment.id}
    `;

    await db.exec`
      UPDATE bookings
      SET completed_at = NOW(),
          auto_confirm_at = NULL,
          updated_at = NOW()
      WHERE id = ${req.bookingId}
    `;

    await db.exec`
      INSERT INTO booking_audit_logs (booking_id, user_id, action, new_status, metadata)
      VALUES (
        ${req.bookingId}, ${auth.userID}, 'service_confirmed', 'confirmed',
        ${JSON.stringify({ escrowReleased: true })}
      )
    `;

    logBookingEvent("completed", req.bookingId, {
      clientId: auth.userID,
      freelancerId: booking.freelancer_id,
    });

    logPaymentEvent("payout", payment.id, {
      bookingId: req.bookingId,
      freelancerId: booking.freelancer_id,
      payoutAmountPence: payment.amount_pence - payment.platform_fee_pence,
    });

    const serviceAmountDollars = (payment.amount_pence - payment.platform_fee_pence) / 100;
    const amounts = await calculatePayoutAmounts(serviceAmountDollars);
    
    try {
      await createPayoutRecord(
        booking.freelancer_id,
        req.bookingId,
        amounts
      );
    } catch (error: any) {
      console.error("Failed to create payout record:", error.message);
    }

    await sendNotification({
      userId: booking.freelancer_id,
      type: "payment_released",
      title: "Payment Released",
      message: "The client has confirmed service completion. Your payment has been released.",
      data: { 
        bookingId: req.bookingId,
        amountPence: payment.amount_pence - payment.platform_fee_pence,
      },
    });

    return {
      message: "Service confirmed. Payment released to freelancer.",
    };
  }
);
