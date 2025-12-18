import { z } from "zod";
import { idSchema, userIdSchema, verificationStatusSchema } from "../shared/schemas";

export const updateProfileRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(1000).optional(),
  phoneNumber: z.string().max(20).optional(),
  addressLine1: z.string().max(200).optional(),
  addressLine2: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  postcode: z.string().max(20).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  defaultStudioFeePence: z.number().int().nonnegative().optional(),
  defaultMobileFeePence: z.number().int().nonnegative().optional(),
});

export const updateProfileResponseSchema = z.object({
  message: z.string(),
});

export const profileSchema = z.object({
  userId: userIdSchema,
  name: z.string(),
  email: z.string(),
  role: z.string(),
  bio: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  profilePhotoUrl: z.string().nullable(),
  addressLine1: z.string().nullable(),
  addressLine2: z.string().nullable(),
  city: z.string().nullable(),
  postcode: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  defaultStudioFeePence: z.number().int().nonnegative().nullable(),
  defaultMobileFeePence: z.number().int().nonnegative().nullable(),
  verificationStatus: verificationStatusSchema,
  createdAt: z.string(),
});

export const getProfileResponseSchema = profileSchema;

export const uploadProfilePhotoResponseSchema = z.object({
  photoUrl: z.string(),
});

export const portfolioItemSchema = z.object({
  id: idSchema,
  freelancerId: userIdSchema,
  title: z.string(),
  description: z.string().nullable(),
  imageUrl: z.string(),
  displayOrder: z.number().int().nonnegative(),
  createdAt: z.string(),
});

export const listPortfolioResponseSchema = z.object({
  items: z.array(portfolioItemSchema),
});

export const savePortfolioItemRequestSchema = z.object({
  id: idSchema.optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  imageUrl: z.string().url(),
  displayOrder: z.number().int().nonnegative().optional(),
});

export const savePortfolioItemResponseSchema = z.object({
  id: idSchema,
  message: z.string(),
});

export const uploadPortfolioImageResponseSchema = z.object({
  imageUrl: z.string(),
});

export const deletePortfolioItemResponseSchema = z.object({
  message: z.string(),
});
