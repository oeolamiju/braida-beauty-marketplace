import { secret } from "encore.dev/config";
import { APIError } from "encore.dev/api";
import type { PriceBreakdown } from "./types";
import { calculateBookingPrice } from "../shared/pricing";

const stripeSecretKey = secret("StripeSecretKey");
const stripeWebhookSecret = secret("StripeWebhookSecret");

const STRIPE_API_VERSION = "2023-10-16";
const PLATFORM_FEE_PERCENTAGE = 10;

export interface CreatePaymentIntentRequest {
  bookingId: number;
  totalPricePence: number;
  basePricePence: number;
  materialsPricePence: number;
  travelPricePence: number;
  currency?: string;
  metadata?: Record<string, string>;
}

export interface CreatePaymentIntentResponse {
  paymentIntentId: string;
  clientSecret: string;
  platformFeePence: number;
}

export async function createPaymentIntent(
  req: CreatePaymentIntentRequest
): Promise<CreatePaymentIntentResponse> {
  const platformFeePence = Math.round(req.totalPricePence * (PLATFORM_FEE_PERCENTAGE / 100));
  
  const response = await fetch("https://api.stripe.com/v1/payment_intents", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${stripeSecretKey()}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Stripe-Version": STRIPE_API_VERSION,
    },
    body: new URLSearchParams({
      amount: req.totalPricePence.toString(),
      currency: req.currency || "gbp",
      "metadata[bookingId]": req.bookingId.toString(),
      "metadata[basePricePence]": req.basePricePence.toString(),
      "metadata[materialsPricePence]": req.materialsPricePence.toString(),
      "metadata[travelPricePence]": req.travelPricePence.toString(),
      "metadata[platformFeePence]": platformFeePence.toString(),
      ...(req.metadata ? Object.entries(req.metadata).reduce((acc, [key, value]) => ({
        ...acc,
        [`metadata[${key}]`]: value
      }), {}) : {}),
      capture_method: "automatic",
      payment_method_types: "card",
    }),
  });

  if (!response.ok) {
    const error: any = await response.json();
    throw APIError.internal(`Stripe error: ${error.error?.message || 'Unknown error'}`);
  }

  const paymentIntent: any = await response.json();

  return {
    paymentIntentId: paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
    platformFeePence,
  };
}

export interface RefundPaymentRequest {
  paymentIntentId: string;
  amountPence?: number;
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
  metadata?: Record<string, string>;
}

export interface RefundPaymentResponse {
  refundId: string;
  status: string;
  amountPence: number;
}

export async function refundPayment(
  req: RefundPaymentRequest
): Promise<RefundPaymentResponse> {
  const params: Record<string, string> = {
    payment_intent: req.paymentIntentId,
  };

  if (req.amountPence) {
    params.amount = req.amountPence.toString();
  }

  if (req.reason) {
    params.reason = req.reason;
  }

  if (req.metadata) {
    Object.entries(req.metadata).forEach(([key, value]) => {
      params[`metadata[${key}]`] = value;
    });
  }

  const response = await fetch("https://api.stripe.com/v1/refunds", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${stripeSecretKey()}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Stripe-Version": STRIPE_API_VERSION,
    },
    body: new URLSearchParams(params),
  });

  if (!response.ok) {
    const error: any = await response.json();
    throw APIError.internal(`Stripe refund error: ${error.error?.message || 'Unknown error'}`);
  }

  const refund: any = await response.json();

  return {
    refundId: refund.id,
    status: refund.status,
    amountPence: refund.amount,
  };
}

export interface VerifyWebhookSignatureRequest {
  payload: string;
  signature: string;
}

export function verifyWebhookSignature(req: VerifyWebhookSignatureRequest): any {
  const secret = stripeWebhookSecret();
  const signatureHeader = req.signature;
  
  const elements = signatureHeader.split(',');
  const timestamp = elements.find(e => e.startsWith('t='))?.substring(2);
  const signatures = elements.filter(e => e.startsWith('v1='));
  
  if (!timestamp || signatures.length === 0) {
    throw APIError.invalidArgument("Invalid signature header");
  }

  const signedPayload = `${timestamp}.${req.payload}`;
  
  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  const data = encoder.encode(signedPayload);
  
  return crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  ).then(cryptoKey =>
    crypto.subtle.sign('HMAC', cryptoKey, data)
  ).then(signature => {
    const hex = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const expectedSignature = `v1=${hex}`;
    const isValid = signatures.some(sig => sig === expectedSignature);
    
    if (!isValid) {
      throw APIError.permissionDenied("Invalid webhook signature");
    }
    
    return JSON.parse(req.payload);
  });
}

export function calculatePriceBreakdown(
  basePricePence: number,
  materialsPricePence: number,
  travelPricePence: number
): PriceBreakdown {
  return calculateBookingPrice({
    basePricePence,
    materialsPricePence,
    travelPricePence,
  });
}
