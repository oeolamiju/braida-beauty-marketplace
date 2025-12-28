import { z } from "zod";
import { idSchema, userIdSchema, nonNegativeIntSchema, paginationSchema } from "../shared/schemas";

export const createReviewRequestSchema = z.object({
  bookingId: idSchema,
  rating: z.number().int().min(1).max(5),
  reviewText: z.string().min(1).max(1000).optional(),
});

export const createReviewResponseSchema = z.object({
  id: idSchema,
  message: z.string(),
});

export const reviewSchema = z.object({
  id: idSchema,
  bookingId: idSchema,
  clientId: userIdSchema,
  freelancerId: userIdSchema,
  rating: z.number().int().min(1).max(5),
  reviewText: z.string().optional(),
  photoUrl: z.string().optional(),
  isRemoved: z.boolean(),
  removedAt: z.string().nullable(),
  removedBy: userIdSchema.nullable(),
  removalReason: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const getBookingReviewResponseSchema = reviewSchema.nullable();

export const listReviewsByFreelancerRequestSchema = z.object({
  freelancerId: userIdSchema,
  page: paginationSchema.page,
  limit: paginationSchema.limit,
});

export const listReviewsByFreelancerResponseSchema = z.object({
  reviews: z.array(reviewSchema),
  total: nonNegativeIntSchema,
  averageRating: z.number().min(0).max(5),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});

export const uploadPhotoResponseSchema = z.object({
  photoUrl: z.string(),
});

export const adminListAllReviewsRequestSchema = z.object({
  page: paginationSchema.page,
  limit: paginationSchema.limit,
  includeRemoved: z.boolean().optional(),
});

export const adminListAllReviewsResponseSchema = z.object({
  reviews: z.array(reviewSchema.extend({
    serviceName: z.string(),
    freelancerName: z.string(),
  })),
  total: nonNegativeIntSchema,
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});

export const adminRemoveReviewRequestSchema = z.object({
  reason: z.string().min(1).max(500),
});

export const adminRemoveReviewResponseSchema = z.object({
  message: z.string(),
});

export const adminRestoreReviewResponseSchema = z.object({
  message: z.string(),
});

export const reviewActionLogSchema = z.object({
  id: idSchema,
  reviewId: idSchema,
  adminId: userIdSchema,
  adminName: z.string(),
  action: z.enum(["removed", "restored"]),
  reason: z.string().nullable(),
  createdAt: z.string(),
});

export const adminGetReviewLogsResponseSchema = z.object({
  logs: z.array(reviewActionLogSchema),
});
