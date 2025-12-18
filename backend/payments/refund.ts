import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import db from "../db";
import { refundPayment } from "./stripe_service";

export interface RefundBookingRequest {
  bookingId: number;
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
  amountPence?: number;
}

export interface RefundBookingResponse {
  refundId: string;
  amountPence: number;
  message: string;
}

export const refund = api<RefundBookingRequest, RefundBookingResponse>(
  { auth: true, expose: true, method: "POST", path: "/payments/refund" },
  async (req) => {
    const auth = getAuthData()! as AuthData;

    const booking = await db.queryRow<{
      id: number;
      client_id: string;
      freelancer_id: string;
      status: string;
      payment_status: string;
    }>`
      SELECT id, client_id, freelancer_id, status, payment_status
      FROM bookings
      WHERE id = ${req.bookingId}
    `;

    if (!booking) {
      throw APIError.notFound("Booking not found");
    }

    if (auth.userID !== booking.client_id && auth.role !== 'admin') {
      throw APIError.permissionDenied("Only the client or admin can request a refund");
    }

    if (booking.payment_status !== 'paid') {
      throw APIError.invalidArgument("Booking has not been paid");
    }

    const payment = await db.queryRow<{
      id: number;
      stripe_payment_intent_id: string;
      amount_pence: number;
      status: string;
      escrow_status: string;
    }>`
      SELECT id, stripe_payment_intent_id, amount_pence, status, escrow_status
      FROM payments
      WHERE booking_id = ${req.bookingId} AND status = 'succeeded'
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (!payment) {
      throw APIError.notFound("No successful payment found for this booking");
    }

    if (payment.escrow_status === 'refunded') {
      throw APIError.invalidArgument("Payment already refunded");
    }

    if (payment.escrow_status === 'released') {
      throw APIError.invalidArgument("Payment already released to freelancer");
    }

    const refundAmountPence = req.amountPence || payment.amount_pence;

    if (refundAmountPence > payment.amount_pence) {
      throw APIError.invalidArgument("Refund amount exceeds payment amount");
    }

    const { refundId, amountPence } = await refundPayment({
      paymentIntentId: payment.stripe_payment_intent_id,
      amountPence: refundAmountPence,
      reason: req.reason || 'requested_by_customer',
      metadata: {
        bookingId: req.bookingId.toString(),
        clientId: booking.client_id,
      },
    });

    const isFullRefund = amountPence >= payment.amount_pence;

    await db.exec`
      UPDATE payments
      SET refund_id = ${refundId},
          refund_status = 'pending',
          refund_amount_pence = ${amountPence},
          refunded_at = NOW(),
          escrow_status = 'refunded',
          updated_at = NOW()
      WHERE id = ${payment.id}
    `;

    await db.exec`
      UPDATE bookings
      SET payment_status = ${isFullRefund ? 'refunded' : 'partially_refunded'},
          updated_at = NOW()
      WHERE id = ${req.bookingId}
    `;

    await db.exec`
      INSERT INTO booking_audit_logs (booking_id, user_id, action, new_status, metadata)
      VALUES (
        ${req.bookingId}, ${auth.userID}, 'refund_initiated', ${booking.status},
        ${JSON.stringify({ refundId, amountPence, reason: req.reason })}
      )
    `;

    return {
      refundId,
      amountPence,
      message: `${isFullRefund ? 'Full' : 'Partial'} refund initiated successfully`,
    };
  }
);
