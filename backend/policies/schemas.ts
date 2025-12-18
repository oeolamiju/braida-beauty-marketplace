import { z } from "zod";
import { idSchema, userIdSchema, nonNegativeIntSchema } from "../shared/schemas";

export const cancellationPolicySchema = z.object({
  id: idSchema,
  serviceId: idSchema,
  cancellationWindowHours: z.number().int().nonnegative(),
  fullRefundWindowHours: z.number().int().nonnegative(),
  partialRefundPercentage: z.number().int().min(0).max(100),
  noRefundAfterWindowHours: z.number().int().nonnegative(),
});

export const getPoliciesResponseSchema = z.object({
  policies: z.array(cancellationPolicySchema),
});

export const updatePoliciesRequestSchema = z.object({
  serviceId: idSchema,
  cancellationWindowHours: z.number().int().nonnegative().optional(),
  fullRefundWindowHours: z.number().int().nonnegative().optional(),
  partialRefundPercentage: z.number().int().min(0).max(100).optional(),
  noRefundAfterWindowHours: z.number().int().nonnegative().optional(),
});

export const updatePoliciesResponseSchema = z.object({
  message: z.string(),
});

export const reliabilityMetricsSchema = z.object({
  totalBookings: nonNegativeIntSchema,
  completedBookings: nonNegativeIntSchema,
  cancelledByFreelancer: nonNegativeIntSchema,
  lateCancellations: nonNegativeIntSchema,
  noShows: nonNegativeIntSchema,
  reliabilityScore: z.number().min(0).max(100),
  tier: z.enum(["excellent", "good", "fair", "poor"]),
});

export const getFreelancerReliabilityResponseSchema = reliabilityMetricsSchema;

export const reliabilityConfigSchema = z.object({
  excellentThreshold: z.number().min(0).max(100),
  goodThreshold: z.number().min(0).max(100),
  fairThreshold: z.number().min(0).max(100),
  lateCancellationPenalty: z.number().min(0).max(100),
  noShowPenalty: z.number().min(0).max(100),
  completionBonus: z.number().min(0).max(100),
});

export const getReliabilityConfigResponseSchema = reliabilityConfigSchema;

export const updateReliabilityConfigRequestSchema = reliabilityConfigSchema.partial();

export const updateReliabilityConfigResponseSchema = z.object({
  message: z.string(),
});
