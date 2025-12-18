import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import db from "../db";
import type { Payment } from "./types";

export interface GetPaymentStatusRequest {
  bookingId: number;
}

export interface GetPaymentStatusResponse {
  payment: Payment | null;
  canRefund: boolean;
}

export const getStatus = api<GetPaymentStatusRequest, GetPaymentStatusResponse>(
  { auth: true, expose: true, method: "GET", path: "/payments/:bookingId/status" },
  async (req) => {
    const auth = getAuthData()! as AuthData;

    const booking = await db.queryRow<{
      client_id: string;
      freelancer_id: string;
      payment_status: string;
    }>`
      SELECT client_id, freelancer_id, payment_status
      FROM bookings
      WHERE id = ${req.bookingId}
    `;

    if (!booking) {
      throw APIError.notFound("Booking not found");
    }

    if (auth.userID !== booking.client_id && 
        auth.userID !== booking.freelancer_id && 
        auth.role !== 'admin') {
      throw APIError.permissionDenied("You don't have access to this booking's payment status");
    }

    const payment = await db.queryRow<{
      id: number;
      booking_id: number;
      provider: string;
      provider_payment_id: string | null;
      stripe_payment_intent_id: string | null;
      stripe_charge_id: string | null;
      status: string;
      escrow_status: string;
      amount_pence: number;
      currency: string;
      platform_fee_pence: number;
      freelancer_payout_pence: number | null;
      refund_id: string | null;
      refund_status: string | null;
      refund_amount_pence: number | null;
      metadata: string | null;
      created_at: string;
      updated_at: string;
      escrow_released_at: string | null;
      refunded_at: string | null;
    }>`
      SELECT id, booking_id, provider, provider_payment_id, stripe_payment_intent_id,
             stripe_charge_id, status, escrow_status, amount_pence, currency,
             platform_fee_pence, freelancer_payout_pence, refund_id, refund_status,
             refund_amount_pence, metadata::text, created_at, updated_at,
             escrow_released_at, refunded_at
      FROM payments
      WHERE booking_id = ${req.bookingId}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (!payment) {
      return {
        payment: null,
        canRefund: false,
      };
    }

    const canRefund = 
      payment.status === 'succeeded' && 
      payment.escrow_status === 'held' &&
      (auth.userID === booking.client_id || auth.role === 'admin');

    return {
      payment: {
        id: payment.id,
        bookingId: payment.booking_id,
        provider: payment.provider,
        providerPaymentId: payment.provider_payment_id,
        stripePaymentIntentId: payment.stripe_payment_intent_id,
        stripeChargeId: payment.stripe_charge_id,
        status: payment.status as any,
        escrowStatus: payment.escrow_status as any,
        amountPence: payment.amount_pence,
        currency: payment.currency,
        platformFeePence: payment.platform_fee_pence,
        freelancerPayoutPence: payment.freelancer_payout_pence,
        refundId: payment.refund_id,
        refundStatus: payment.refund_status,
        refundAmountPence: payment.refund_amount_pence,
        metadata: payment.metadata ? JSON.parse(payment.metadata) : null,
        createdAt: new Date(payment.created_at),
        updatedAt: new Date(payment.updated_at),
        escrowReleasedAt: payment.escrow_released_at ? new Date(payment.escrow_released_at) : null,
        refundedAt: payment.refunded_at ? new Date(payment.refunded_at) : null,
      },
      canRefund,
    };
  }
);
