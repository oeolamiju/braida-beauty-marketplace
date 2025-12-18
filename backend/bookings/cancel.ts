import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import db from "../db";
import { sendNotification } from "../notifications/send";
import { calculateRefund, trackFreelancerCancellation, getFreelancerCancellationStats } from "../policies/policy_service";
import { refundPayment } from "../payments/stripe_service";
import { logBookingEvent } from "../shared/logger";

export interface CancelBookingRequest {
  id: number;
  reason?: string;
}

export interface CancelBookingResponse {
  message: string;
  refundPercentage: number;
  refundAmount: number;
  hoursBeforeService: number;
  reliabilityWarning?: string;
}

export const cancel = api<CancelBookingRequest, CancelBookingResponse>(
  { auth: true, expose: true, method: "POST", path: "/bookings/:id/cancel" },
  async (req) => {
    const auth = getAuthData()! as AuthData;

    const booking = await db.queryRow<{
      id: number;
      freelancer_id: string;
      client_id: string;
      status: string;
      payment_status: string;
      start_datetime: Date;
      total_price_pence: number;
    }>`
      SELECT id, freelancer_id, client_id, status, payment_status, start_datetime, total_price_pence
      FROM bookings
      WHERE id = ${req.id}
    `;

    if (!booking) {
      throw APIError.notFound("booking not found");
    }

    if (booking.freelancer_id !== auth.userID && booking.client_id !== auth.userID) {
      throw APIError.permissionDenied("you can only cancel your own bookings");
    }

    if (booking.status === "cancelled") {
      throw APIError.invalidArgument("booking is already cancelled");
    }

    if (booking.status === "completed") {
      throw APIError.invalidArgument("cannot cancel completed bookings");
    }

    const cancelledBy = booking.client_id === auth.userID ? 'client' : 'freelancer';
    const bookingAmountPounds = booking.total_price_pence / 100;
    const cancellationTime = new Date();

    const refundCalc = await calculateRefund(
      bookingAmountPounds,
      booking.start_datetime,
      cancellationTime,
      cancelledBy
    );

    if (booking.payment_status === 'paid') {
      const payment = await db.queryRow<{
        id: number;
        stripe_payment_intent_id: string;
        amount_pence: number;
      }>`
        SELECT id, stripe_payment_intent_id, amount_pence
        FROM payments
        WHERE booking_id = ${req.id} AND status = 'succeeded'
        ORDER BY created_at DESC
        LIMIT 1
      `;

      if (payment) {
        const refundAmountPence = Math.round((refundCalc.refundPercentage / 100) * payment.amount_pence);
        
        if (refundAmountPence > 0) {
          const { refundId, amountPence } = await refundPayment({
            paymentIntentId: payment.stripe_payment_intent_id,
            amountPence: refundAmountPence,
            reason: 'requested_by_customer',
            metadata: {
              bookingId: req.id.toString(),
              cancelledBy,
              reason: req.reason || 'cancellation',
            },
          });

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

          const isFullRefund = amountPence >= payment.amount_pence;
          await db.exec`
            UPDATE bookings
            SET payment_status = ${isFullRefund ? 'refunded' : 'partially_refunded'}, 
                updated_at = NOW()
            WHERE id = ${req.id}
          `;
        }
      }
    }

    await db.exec`
      UPDATE bookings
      SET status = 'cancelled',
          cancelled_by = ${auth.userID},
          cancelled_at = ${cancellationTime},
          cancellation_reason = ${req.reason || null},
          updated_at = NOW(),
          expires_at = NULL
      WHERE id = ${req.id}
    `;

    await db.exec`
      INSERT INTO booking_audit_logs (booking_id, user_id, action, previous_status, new_status)
      VALUES (${req.id}, ${auth.userID}, 'cancelled', ${booking.status}, 'cancelled')
    `;

    logBookingEvent("cancelled", req.id, {
      userId: auth.userID,
      role: cancelledBy,
      reason: req.reason,
      refundPercentage: refundCalc.refundPercentage,
    });

    let reliabilityWarning: string | undefined;

    if (cancelledBy === 'freelancer') {
      await trackFreelancerCancellation(
        booking.freelancer_id,
        req.id,
        refundCalc.hoursBeforeService
      );

      const stats = await getFreelancerCancellationStats(booking.freelancer_id);
      
      if (stats.shouldSuspend) {
        reliabilityWarning = "WARNING: You have exceeded the maximum number of last-minute cancellations. Your account may be suspended.";
      } else if (stats.shouldWarn) {
        reliabilityWarning = `Warning: You have ${stats.lastMinuteCancellations} last-minute cancellations in the last 30 days. Further cancellations may result in account suspension.`;
      }
    }

    const notifyUserId = booking.client_id === auth.userID 
      ? booking.freelancer_id 
      : booking.client_id;

    const notificationMessage = cancelledBy === 'freelancer'
      ? `The freelancer has cancelled your booking for ${booking.start_datetime.toLocaleDateString()}. You will receive a full refund.`
      : `Your client has cancelled the booking for ${booking.start_datetime.toLocaleDateString()}. Refund: ${refundCalc.refundPercentage}%`;

    await sendNotification({
      userId: notifyUserId,
      type: "booking_cancelled",
      title: "Booking Cancelled",
      message: notificationMessage,
      data: { 
        bookingId: req.id,
        refundPercentage: refundCalc.refundPercentage,
        refundAmount: refundCalc.refundAmount
      },
    });

    return {
      message: "Booking cancelled successfully" + (refundCalc.refundPercentage > 0 ? ". Refund initiated." : ""),
      refundPercentage: refundCalc.refundPercentage,
      refundAmount: refundCalc.refundAmount,
      hoursBeforeService: refundCalc.hoursBeforeService,
      reliabilityWarning
    };
  }
);
