import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import { requireVerifiedFreelancer } from "../auth/middleware";
import db from "../db";
import { sendNotification } from "../notifications/send";
import { getBookingDeclinedEmail } from "../notifications/email_service";
import { refundPayment } from "../payments/stripe_service";

export interface DeclineBookingRequest {
  id: number;
  reason?: string;
}

export interface DeclineBookingResponse {
  message: string;
}

export const decline = api<DeclineBookingRequest, DeclineBookingResponse>(
  { auth: true, expose: true, method: "POST", path: "/bookings/:id/decline" },
  async (req) => {
    requireVerifiedFreelancer();

    const auth = getAuthData()! as AuthData;

    const booking = await db.queryRow<{
      id: number;
      freelancer_id: string;
      client_id: string;
      status: string;
      payment_status: string;
      start_datetime: Date;
    }>`
      SELECT id, freelancer_id, client_id, status, payment_status, start_datetime
      FROM bookings
      WHERE id = ${req.id}
    `;

    if (!booking) {
      throw APIError.notFound("booking not found");
    }

    if (booking.freelancer_id !== auth.userID) {
      throw APIError.permissionDenied("you can only decline your own bookings");
    }

    if (booking.status !== "pending") {
      throw APIError.invalidArgument("booking is not in pending status");
    }

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
        const { refundId, amountPence } = await refundPayment({
          paymentIntentId: payment.stripe_payment_intent_id,
          reason: 'requested_by_customer',
          metadata: {
            bookingId: req.id.toString(),
            reason: 'freelancer_declined',
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

        await db.exec`
          UPDATE bookings
          SET payment_status = 'refunded', updated_at = NOW()
          WHERE id = ${req.id}
        `;
      }
    }

    await db.exec`
      UPDATE bookings
      SET status = 'cancelled', declined_reason = ${req.reason || null}, 
          declined_at = NOW(), updated_at = NOW(), expires_at = NULL
      WHERE id = ${req.id}
    `;

    await db.exec`
      INSERT INTO booking_audit_logs (booking_id, user_id, action, previous_status, new_status, metadata)
      VALUES (
        ${req.id}, ${auth.userID}, 'declined', 'pending', 'cancelled',
        ${JSON.stringify({ reason: req.reason || null })}
      )
    `;

    const serviceDetails = await db.queryRow<{ name: string }>`
      SELECT s.name
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.id = ${req.id}
    `;

    const freelancerUser = await db.queryRow<{ name: string }>`
      SELECT CONCAT(first_name, ' ', last_name) as name FROM users WHERE id = ${booking.freelancer_id}
    `;

    const clientUser = await db.queryRow<{ name: string; email: string }>`
      SELECT CONCAT(first_name, ' ', last_name) as name, email FROM users WHERE id = ${booking.client_id}
    `;

    if (freelancerUser && clientUser && serviceDetails) {
      await sendNotification({
        userId: booking.client_id,
        type: "booking_declined",
        title: "Booking Declined",
        message: `Your booking request for ${booking.start_datetime.toLocaleDateString()} was declined${booking.payment_status === 'paid' ? '. A refund has been initiated.' : ''}`,
        data: { bookingId: req.id, reason: req.reason },
        emailHtml: getBookingDeclinedEmail(
          clientUser.name,
          freelancerUser.name,
          serviceDetails.name,
          booking.start_datetime
        ),
      });
    }

    return {
      message: "Booking declined successfully" + (booking.payment_status === 'paid' ? ". Refund initiated." : ""),
    };
  }
);
