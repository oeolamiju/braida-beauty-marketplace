import { z } from "zod";
import { idSchema, paginationSchema, nonNegativeIntSchema } from "../shared/schemas";

export const createStyleRequestSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  imageUrl: z.string().url().optional(),
});

export const createStyleResponseSchema = z.object({
  id: idSchema,
  message: z.string(),
});

export const styleSchema = z.object({
  id: idSchema,
  name: z.string(),
  description: z.string(),
  imageUrl: z.string().nullable(),
  serviceCount: nonNegativeIntSchema,
  createdAt: z.string(),
});

export const getStyleResponseSchema = styleSchema;

export const listStylesRequestSchema = z.object({
  page: paginationSchema.page,
  limit: paginationSchema.limit,
});

export const listStylesResponseSchema = z.object({
  styles: z.array(styleSchema),
  total: nonNegativeIntSchema,
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});

export const listAllStylesResponseSchema = z.object({
  styles: z.array(styleSchema),
});

export const updateStyleRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(500).optional(),
  imageUrl: z.string().url().optional(),
});

export const updateStyleResponseSchema = z.object({
  message: z.string(),
});

export const deleteStyleResponseSchema = z.object({
  message: z.string(),
});

export const uploadImageResponseSchema = z.object({
  imageUrl: z.string(),
});

export const searchByStyleRequestSchema = z.object({
  styleId: idSchema,
  page: paginationSchema.page,
  limit: paginationSchema.limit,
});

export const serviceByStyleSchema = z.object({
  id: idSchema,
  name: z.string(),
  freelancerName: z.string(),
  basePricePence: nonNegativeIntSchema,
  averageRating: z.number().min(0).max(5).nullable(),
  totalReviews: nonNegativeIntSchema,
});

export const searchByStyleResponseSchema = z.object({
  services: z.array(serviceByStyleSchema),
  total: nonNegativeIntSchema,
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});
