import { z } from "zod";
import { userIdSchema, verificationStatusSchema, paginationSchema, nonNegativeIntSchema } from "../shared/schemas";

export const freelancerProfileSchema = z.object({
  userId: userIdSchema,
  name: z.string(),
  bio: z.string().nullable(),
  profilePhotoUrl: z.string().nullable(),
  city: z.string().nullable(),
  averageRating: z.number().min(0).max(5).nullable(),
  totalReviews: nonNegativeIntSchema,
  totalServices: nonNegativeIntSchema,
  verificationStatus: verificationStatusSchema,
  joinedAt: z.string(),
});

export const getFreelancerResponseSchema = freelancerProfileSchema;

export const listFreelancersRequestSchema = z.object({
  city: z.string().optional(),
  minRating: z.number().min(0).max(5).optional(),
  verifiedOnly: z.boolean().optional(),
  page: paginationSchema.page,
  limit: paginationSchema.limit,
});

export const freelancerSummarySchema = z.object({
  userId: userIdSchema,
  name: z.string(),
  profilePhotoUrl: z.string().nullable(),
  city: z.string().nullable(),
  averageRating: z.number().min(0).max(5).nullable(),
  totalReviews: nonNegativeIntSchema,
  verificationStatus: verificationStatusSchema,
});

export const listFreelancersResponseSchema = z.object({
  freelancers: z.array(freelancerSummarySchema),
  total: nonNegativeIntSchema,
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});
