import { z } from "zod";
import { idSchema, nonNegativeIntSchema } from "../shared/schemas";

export const createCheckoutRequestSchema = z.object({
  bookingId: idSchema,
});

export const createCheckoutResponseSchema = z.object({
  clientSecret: z.string(),
  paymentIntentId: z.string(),
  totalPricePence: nonNegativeIntSchema,
});

export const paymentStatusSchema = z.enum([
  "initiated",
  "processing",
  "succeeded",
  "failed",
  "cancelled",
  "refunded",
  "partially_refunded"
]);

export const escrowStatusSchema = z.enum([
  "held",
  "released",
  "refunded"
]);

export const getPaymentStatusResponseSchema = z.object({
  bookingId: idSchema,
  status: paymentStatusSchema,
  escrowStatus: escrowStatusSchema,
  amountPence: nonNegativeIntSchema,
  platformFeePence: nonNegativeIntSchema,
  freelancerPayoutPence: nonNegativeIntSchema,
  refundedAmountPence: nonNegativeIntSchema.nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const confirmServiceCompletionResponseSchema = z.object({
  message: z.string(),
  releasedAmountPence: nonNegativeIntSchema,
});

export const refundRequestSchema = z.object({
  bookingId: idSchema,
  amountPence: nonNegativeIntSchema.optional(),
  reason: z.string().min(1).max(500),
});

export const refundResponseSchema = z.object({
  message: z.string(),
  refundedAmountPence: nonNegativeIntSchema,
});

export const stripeWebhookResponseSchema = z.object({
  received: z.boolean(),
});
