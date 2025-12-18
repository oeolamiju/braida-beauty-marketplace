import { z } from "zod";
import { idSchema, userIdSchema, nonNegativeIntSchema, paginationSchema } from "../shared/schemas";

export const createAccountResponseSchema = z.object({
  accountId: z.string(),
  onboardingUrl: z.string(),
});

export const accountStatusSchema = z.enum([
  "not_created",
  "pending",
  "active",
  "restricted",
  "rejected"
]);

export const getAccountResponseSchema = z.object({
  accountId: z.string().nullable(),
  status: accountStatusSchema,
  chargesEnabled: z.boolean(),
  payoutsEnabled: z.boolean(),
  requiresOnboarding: z.boolean(),
  pendingRequirements: z.array(z.string()),
});

export const refreshAccountStatusResponseSchema = z.object({
  status: accountStatusSchema,
  chargesEnabled: z.boolean(),
  payoutsEnabled: z.boolean(),
});

export const earningsSchema = z.object({
  totalEarnedPence: nonNegativeIntSchema,
  availableForPayoutPence: nonNegativeIntSchema,
  pendingPence: nonNegativeIntSchema,
  paidOutPence: nonNegativeIntSchema,
});

export const getEarningsResponseSchema = earningsSchema;

export const payoutScheduleSchema = z.enum(["daily", "weekly", "monthly", "manual"]);

export const setScheduleRequestSchema = z.object({
  schedule: payoutScheduleSchema,
  minimumPayoutPence: nonNegativeIntSchema.optional(),
});

export const setScheduleResponseSchema = z.object({
  message: z.string(),
});

export const payoutStatusSchema = z.enum([
  "pending",
  "processing",
  "paid",
  "failed",
  "cancelled"
]);

export const payoutSchema = z.object({
  id: idSchema,
  freelancerId: userIdSchema,
  amountPence: nonNegativeIntSchema,
  status: payoutStatusSchema,
  stripePayoutId: z.string().nullable(),
  scheduledFor: z.string(),
  processedAt: z.string().nullable(),
  failureReason: z.string().nullable(),
  createdAt: z.string(),
});

export const getPayoutHistoryRequestSchema = z.object({
  page: paginationSchema.page,
  limit: paginationSchema.limit,
  status: payoutStatusSchema.optional(),
});

export const getPayoutHistoryResponseSchema = z.object({
  payouts: z.array(payoutSchema),
  total: nonNegativeIntSchema,
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});

export const adminListPayoutsRequestSchema = z.object({
  freelancerId: userIdSchema.optional(),
  status: payoutStatusSchema.optional(),
  page: paginationSchema.page,
  limit: paginationSchema.limit,
});

export const adminListPayoutsResponseSchema = z.object({
  payouts: z.array(payoutSchema.extend({
    freelancerName: z.string(),
    freelancerEmail: z.string(),
  })),
  total: nonNegativeIntSchema,
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});

export const adminGetPayoutResponseSchema = payoutSchema.extend({
  freelancerName: z.string(),
  freelancerEmail: z.string(),
  stripeAccountId: z.string().nullable(),
});

export const adminOverridePayoutRequestSchema = z.object({
  status: payoutStatusSchema,
  failureReason: z.string().optional(),
});

export const adminOverridePayoutResponseSchema = z.object({
  message: z.string(),
});

export const payoutSettingsSchema = z.object({
  platformFeePercentage: z.number().min(0).max(100),
  minimumPayoutPence: nonNegativeIntSchema,
  dailyPayoutEnabled: z.boolean(),
  weeklyPayoutEnabled: z.boolean(),
  monthlyPayoutEnabled: z.boolean(),
});

export const adminGetPayoutSettingsResponseSchema = payoutSettingsSchema;

export const adminUpdatePayoutSettingsRequestSchema = payoutSettingsSchema.partial();

export const adminUpdatePayoutSettingsResponseSchema = z.object({
  message: z.string(),
});
