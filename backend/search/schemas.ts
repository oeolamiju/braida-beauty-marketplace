import { z } from "zod";
import { idSchema, userIdSchema, paginationSchema, nonNegativeIntSchema } from "../shared/schemas";

export const timePreferenceSchema = z.object({
  dayPattern: z.enum(['weekday', 'weekend', 'any']).optional(),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'any']).optional(),
  specificDays: z.array(z.number().min(0).max(6)).optional(),
});

export const searchRequestSchema = z.object({
  query: z.string().optional(),
  styleId: idSchema.optional(),
  minPrice: nonNegativeIntSchema.optional(),
  maxPrice: nonNegativeIntSchema.optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  radiusKm: z.number().positive().max(100).optional(),
  minRating: z.number().min(0).max(5).optional(),
  availableOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  timePreference: timePreferenceSchema.optional(),
  page: paginationSchema.page,
  limit: paginationSchema.limit,
});

export const searchResultSchema = z.object({
  id: idSchema,
  freelancerId: userIdSchema,
  freelancerName: z.string(),
  name: z.string(),
  description: z.string(),
  styleId: idSchema,
  styleName: z.string(),
  basePricePence: nonNegativeIntSchema,
  durationMinutes: z.number().int().positive(),
  locationTypes: z.array(z.string()),
  averageRating: z.number().min(0).max(5).nullable(),
  totalReviews: nonNegativeIntSchema,
  distanceKm: z.number().nonnegative().nullable(),
  city: z.string().nullable(),
  profilePhotoUrl: z.string().nullable(),
  availabilityMatch: z.object({
    matched: z.boolean(),
    matchedPatterns: z.array(z.string()),
  }).optional(),
});

export const searchResponseSchema = z.object({
  results: z.array(searchResultSchema),
  total: nonNegativeIntSchema,
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});

export const geocodingRequestSchema = z.object({
  postcode: z.string().min(1),
});

export const geocodingResponseSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  city: z.string().nullable(),
});
