import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import db from "../db";
import { createPaymentIntent } from "./stripe_service";

export interface CreateCheckoutRequest {
  bookingId: number;
}

export interface CreateCheckoutResponse {
  paymentIntentId: string;
  clientSecret: string;
  priceBreakdown: {
    basePricePence: number;
    materialsPricePence: number;
    travelPricePence: number;
    platformFeePence: number;
    totalPence: number;
  };
}

export const createCheckout = api<CreateCheckoutRequest, CreateCheckoutResponse>(
  { auth: true, expose: true, method: "POST", path: "/payments/checkout" },
  async (req) => {
    const auth = getAuthData()! as AuthData;

    const booking = await db.queryRow<{
      id: number;
      client_id: string;
      freelancer_id: string;
      status: string;
      payment_status: string;
      total_price_pence: number;
      price_base_pence: number;
      price_materials_pence: number;
      price_travel_pence: number;
    }>`
      SELECT id, client_id, freelancer_id, status, payment_status,
             total_price_pence, price_base_pence, price_materials_pence, price_travel_pence
      FROM bookings
      WHERE id = ${req.bookingId}
    `;

    if (!booking) {
      throw APIError.notFound("Booking not found");
    }

    if (booking.client_id !== auth.userID) {
      throw APIError.permissionDenied("You can only create checkout for your own bookings");
    }

    if (booking.payment_status === 'paid') {
      throw APIError.invalidArgument("Booking already paid");
    }

    if (booking.status === 'cancelled') {
      throw APIError.invalidArgument("Cannot pay for cancelled booking");
    }

    const existingPayment = await db.queryRow<{ id: number; stripe_payment_intent_id: string; status: string }>`
      SELECT id, stripe_payment_intent_id, status
      FROM payments
      WHERE booking_id = ${req.bookingId} 
        AND status IN ('initiated', 'pending')
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (existingPayment && existingPayment.stripe_payment_intent_id) {
      const breakdown = {
        basePricePence: booking.price_base_pence,
        materialsPricePence: booking.price_materials_pence,
        travelPricePence: booking.price_travel_pence,
        platformFeePence: Math.round(booking.total_price_pence * 0.1),
        totalPence: booking.total_price_pence,
      };

      const paymentIntent = await getStripePaymentIntent(existingPayment.stripe_payment_intent_id);
      
      return {
        paymentIntentId: existingPayment.stripe_payment_intent_id,
        clientSecret: paymentIntent.client_secret,
        priceBreakdown: breakdown,
      };
    }

    const { paymentIntentId, clientSecret, platformFeePence } = await createPaymentIntent({
      bookingId: booking.id,
      totalPricePence: booking.total_price_pence,
      basePricePence: booking.price_base_pence,
      materialsPricePence: booking.price_materials_pence,
      travelPricePence: booking.price_travel_pence,
      currency: 'gbp',
      metadata: {
        freelancerId: booking.freelancer_id,
        clientId: booking.client_id,
      },
    });

    await db.exec`
      INSERT INTO payments (
        booking_id, provider, stripe_payment_intent_id,
        status, escrow_status, amount_pence, currency,
        platform_fee_pence, freelancer_payout_pence, metadata
      )
      VALUES (
        ${booking.id}, 'stripe', ${paymentIntentId},
        'initiated', 'held', ${booking.total_price_pence}, 'GBP',
        ${platformFeePence}, ${booking.total_price_pence - platformFeePence},
        ${JSON.stringify({ clientId: booking.client_id, freelancerId: booking.freelancer_id })}
      )
    `;

    await db.exec`
      UPDATE bookings
      SET payment_status = 'payment_pending', updated_at = NOW()
      WHERE id = ${booking.id}
    `;

    return {
      paymentIntentId,
      clientSecret,
      priceBreakdown: {
        basePricePence: booking.price_base_pence,
        materialsPricePence: booking.price_materials_pence,
        travelPricePence: booking.price_travel_pence,
        platformFeePence,
        totalPence: booking.total_price_pence,
      },
    };
  }
);

async function getStripePaymentIntent(paymentIntentId: string): Promise<any> {
  const { secret } = await import("encore.dev/config");
  const stripeSecretKey = secret("StripeSecretKey");
  
  const response = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
    headers: {
      "Authorization": `Bearer ${stripeSecretKey()}`,
    },
  });

  if (!response.ok) {
    throw APIError.internal("Failed to retrieve payment intent");
  }

  return await response.json();
}
