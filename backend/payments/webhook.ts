import { api, APIError, Header } from "encore.dev/api";
import db from "../db";
import { verifyWebhookSignature } from "./stripe_service";
import { sendNotification } from "../notifications/send";
import { getPaymentReceiptEmail, getRefundEmail, getBookingRequestEmail } from "../notifications/email_service";
import { logPaymentEvent } from "../shared/logger";

interface WebhookRequest {
  body: string;
  signature: Header<"stripe-signature">;
}

export const webhook = api.raw(
  { expose: true, method: "POST", path: "/payments/webhook" },
  async (req, res) => {
    let body = "";
    
    for await (const chunk of req) {
      body += chunk;
    }

    const signature = req.headers["stripe-signature"];
    if (!signature || Array.isArray(signature)) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: "Missing signature" }));
      return;
    }

    let event;
    try {
      event = await verifyWebhookSignature({
        payload: body,
        signature,
      });
    } catch (err) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: "Invalid signature" }));
      return;
    }

    const eventId = event.id;
    const eventType = event.type;

    const existing = await db.queryRow<{ id: number }>`
      SELECT id FROM payment_webhooks WHERE event_id = ${eventId}
    `;

    if (existing) {
      res.writeHead(200);
      res.end(JSON.stringify({ received: true, duplicate: true }));
      return;
    }

    await db.exec`
      INSERT INTO payment_webhooks (provider, event_id, event_type, payload)
      VALUES ('stripe', ${eventId}, ${eventType}, ${JSON.stringify(event)})
    `;

    try {
      await processWebhookEvent(event);

      await db.exec`
        UPDATE payment_webhooks
        SET processed = true, processed_at = NOW()
        WHERE event_id = ${eventId}
      `;

      res.writeHead(200);
      res.end(JSON.stringify({ received: true }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      
      await db.exec`
        UPDATE payment_webhooks
        SET error = ${errorMessage}
        WHERE event_id = ${eventId}
      `;

      res.writeHead(500);
      res.end(JSON.stringify({ error: errorMessage }));
    }
  }
);

async function processWebhookEvent(event: any): Promise<void> {
  const eventType = event.type;
  const paymentIntent = event.data.object;

  switch (eventType) {
    case "payment_intent.succeeded":
      await handlePaymentSucceeded(paymentIntent);
      break;

    case "payment_intent.payment_failed":
      await handlePaymentFailed(paymentIntent);
      break;

    case "charge.refunded":
      await handleChargeRefunded(event.data.object);
      break;

    default:
      console.log(`Unhandled event type: ${eventType}`);
  }
}

async function handlePaymentSucceeded(paymentIntent: any): Promise<void> {
  const paymentIntentId = paymentIntent.id;
  const chargeId = paymentIntent.latest_charge;

  const payment = await db.queryRow<{ id: number; booking_id: number }>`
    SELECT id, booking_id
    FROM payments
    WHERE stripe_payment_intent_id = ${paymentIntentId}
  `;

  if (!payment) {
    throw new Error(`Payment not found for payment intent: ${paymentIntentId}`);
  }

  await db.exec`
    UPDATE payments
    SET status = 'succeeded',
        stripe_charge_id = ${chargeId},
        provider_payment_id = ${paymentIntentId},
        updated_at = NOW()
    WHERE id = ${payment.id}
  `;

  const booking = await db.queryRow<{
    id: number;
    client_id: string;
    freelancer_id: string;
    start_datetime: string;
    end_datetime: string;
    service_id: number;
  }>`
    SELECT id, client_id, freelancer_id, start_datetime, end_datetime, service_id
    FROM bookings
    WHERE id = ${payment.booking_id}
  `;

  if (!booking) {
    throw new Error(`Booking not found: ${payment.booking_id}`);
  }

  const endDatetime = new Date(booking.end_datetime);
  const autoConfirmAt = new Date(endDatetime.getTime() + 24 * 60 * 60 * 1000);

  await db.exec`
    UPDATE bookings
    SET payment_status = 'paid',
        auto_confirm_at = ${autoConfirmAt.toISOString()},
        updated_at = NOW()
    WHERE id = ${payment.booking_id}
  `;

  await db.exec`
    INSERT INTO booking_audit_logs (booking_id, user_id, action, new_status, metadata)
    VALUES (
      ${payment.booking_id}, ${booking.client_id}, 'payment_succeeded', 'pending',
      ${JSON.stringify({ paymentIntentId, chargeId })}
    )
  `;

  logPaymentEvent("succeeded", payment.id, {
    bookingId: payment.booking_id,
    paymentIntentId,
    chargeId,
  });

  // Get service and user details for notifications
  const serviceDetails = await db.queryRow<{ title: string; total_price_pence: number }>`
    SELECT s.title, b.total_price_pence
    FROM bookings b
    JOIN services s ON b.service_id = s.id
    WHERE b.id = ${payment.booking_id}
  `;

  const clientUser = await db.queryRow<{ first_name: string; last_name: string; email: string }>`
    SELECT first_name, last_name, email FROM users WHERE id = ${booking.client_id}
  `;

  const freelancerUser = await db.queryRow<{ first_name: string; last_name: string; email: string }>`
    SELECT first_name, last_name, email FROM users WHERE id = ${booking.freelancer_id}
  `;

  const startDatetime = new Date(booking.start_datetime);
  const clientName = clientUser ? `${clientUser.first_name} ${clientUser.last_name}` : 'Client';
  const freelancerName = freelancerUser ? `${freelancerUser.first_name} ${freelancerUser.last_name}` : 'Freelancer';
  const serviceName = serviceDetails?.title || 'Service';

  // Notify freelancer about the new PAID booking request
  // This is when the booking is "finalized" - after payment succeeds
  if (freelancerUser && serviceDetails) {
    await sendNotification({
      userId: booking.freelancer_id,
      type: "new_booking_request",
      title: "New Paid Booking Request",
      message: `${clientName} has booked and paid for ${serviceName} on ${startDatetime.toLocaleDateString()}. Please review and accept.`,
      data: { bookingId: payment.booking_id },
      emailHtml: getBookingRequestEmail(
        freelancerName,
        clientName,
        serviceName,
        startDatetime,
        payment.booking_id
      ),
    });
  }

  // Notify client that payment was successful
  if (clientUser && serviceDetails) {
    await sendNotification({
      userId: booking.client_id,
      type: "payment_confirmed",
      title: "Payment Confirmed",
      message: `Your payment of £${(serviceDetails.total_price_pence / 100).toFixed(2)} has been processed successfully. Your funds are held securely until the service is completed.`,
      data: { bookingId: payment.booking_id },
      emailHtml: getPaymentReceiptEmail(
        clientName,
        serviceName,
        serviceDetails.total_price_pence,
        payment.booking_id
      ),
    });
  }
}

async function handlePaymentFailed(paymentIntent: any): Promise<void> {
  const paymentIntentId = paymentIntent.id;

  const payment = await db.queryRow<{ id: number; booking_id: number }>`
    SELECT id, booking_id
    FROM payments
    WHERE stripe_payment_intent_id = ${paymentIntentId}
  `;

  if (!payment) {
    return;
  }

  await db.exec`
    UPDATE payments
    SET status = 'failed', updated_at = NOW()
    WHERE id = ${payment.id}
  `;

  logPaymentEvent("failed", payment.id, {
    bookingId: payment.booking_id,
    paymentIntentId,
  });

  const booking = await db.queryRow<{ client_id: string }>`
    SELECT client_id FROM bookings WHERE id = ${payment.booking_id}
  `;

  if (booking) {
    await db.exec`
      UPDATE bookings
      SET payment_status = 'payment_failed', updated_at = NOW()
      WHERE id = ${payment.booking_id}
    `;

    await sendNotification({
      userId: booking.client_id,
      type: "payment_failed",
      title: "Payment Failed",
      message: "Your payment could not be processed. Please try again.",
      data: { bookingId: payment.booking_id },
    });
  }
}

async function handleChargeRefunded(charge: any): Promise<void> {
  const chargeId = charge.id;
  const refunds = charge.refunds?.data || [];

  if (refunds.length === 0) return;

  const latestRefund = refunds[0];

  const payment = await db.queryRow<{ id: number; booking_id: number; amount_pence: number }>`
    SELECT id, booking_id, amount_pence
    FROM payments
    WHERE stripe_charge_id = ${chargeId}
  `;

  if (!payment) {
    return;
  }

  const refundAmountPence = latestRefund.amount;
  const isFullRefund = refundAmountPence >= payment.amount_pence;

  await db.exec`
    UPDATE payments
    SET refund_id = ${latestRefund.id},
        refund_status = ${latestRefund.status},
        refund_amount_pence = ${refundAmountPence},
        refunded_at = NOW(),
        escrow_status = 'refunded',
        updated_at = NOW()
    WHERE id = ${payment.id}
  `;

  logPaymentEvent("refund", payment.id, {
    bookingId: payment.booking_id,
    refundId: latestRefund.id,
    refundAmountPence,
    isFullRefund,
  });

  const booking = await db.queryRow<{ client_id: string; freelancer_id: string }>`
    SELECT client_id, freelancer_id FROM bookings WHERE id = ${payment.booking_id}
  `;

  if (booking) {
    await db.exec`
      UPDATE bookings
      SET payment_status = ${isFullRefund ? 'refunded' : 'partially_refunded'},
          updated_at = NOW()
      WHERE id = ${payment.booking_id}
    `;

    const serviceDetails = await db.queryRow<{ name: string }>`
      SELECT s.name
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.id = ${payment.booking_id}
    `;

    const clientUser = await db.queryRow<{ name: string; email: string }>`
      SELECT name, email FROM users WHERE id = ${booking.client_id}
    `;

    if (clientUser && serviceDetails) {
      await sendNotification({
        userId: booking.client_id,
        type: "booking_refunded",
        title: "Refund Processed",
        message: `Your ${isFullRefund ? 'full' : 'partial'} refund has been processed.`,
        data: { bookingId: payment.booking_id, refundAmountPence },
        emailHtml: getRefundEmail(
          clientUser.name,
          serviceDetails.name,
          refundAmountPence,
          isFullRefund ? 'Booking cancelled' : 'Partial refund due to cancellation policy'
        ),
      });
    }
  }
}
