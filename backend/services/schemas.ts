import { z } from "zod";
import {
  idSchema,
  userIdSchema,
  locationTypeSchema,
  materialsPolicySchema,
  paginationSchema,
  nonNegativeIntSchema,
  positiveIntSchema,
} from "../shared/schemas";

export const createServiceRequestSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  styleId: idSchema,
  basePricePence: positiveIntSchema.optional(),
  studioPricePence: positiveIntSchema.optional(),
  mobilePricePence: positiveIntSchema.optional(),
  materialsFee: nonNegativeIntSchema.optional(),
  materialsPolicy: materialsPolicySchema,
  materialsDescription: z.string().max(500).optional(),
  travelFee: nonNegativeIntSchema.optional(),
  durationMinutes: positiveIntSchema,
  locationTypes: z.array(locationTypeSchema).min(1),
}).refine(
  (data: {
    locationTypes: string[];
    studioPricePence?: number;
    mobilePricePence?: number;
  }) => {
    const hasStudio = data.locationTypes.includes('client_travels_to_freelancer');
    const hasMobile = data.locationTypes.includes('freelancer_travels_to_client');
    if (hasStudio && !data.studioPricePence) return false;
    if (hasMobile && !data.mobilePricePence) return false;
    return true;
  },
  { message: 'Must provide studioPricePence for studio services and mobilePricePence for mobile services' }
);

export const createServiceResponseSchema = z.object({
  id: idSchema,
  message: z.string(),
});

export const serviceSchema = z.object({
  id: idSchema,
  freelancerId: userIdSchema,
  freelancerName: z.string(),
  name: z.string(),
  description: z.string(),
  styleId: idSchema,
  styleName: z.string(),
  basePricePence: nonNegativeIntSchema.nullable(),
  studioPricePence: nonNegativeIntSchema.nullable(),
  mobilePricePence: nonNegativeIntSchema.nullable(),
  materialsFee: nonNegativeIntSchema,
  materialsPolicy: materialsPolicySchema,
  materialsDescription: z.string().nullable(),
  travelFee: nonNegativeIntSchema,
  durationMinutes: positiveIntSchema,
  locationTypes: z.array(locationTypeSchema),
  isActive: z.boolean(),
  averageRating: z.number().min(0).max(5).nullable(),
  totalReviews: nonNegativeIntSchema,
  createdAt: z.string(),
});

export const getServiceResponseSchema = serviceSchema;

export const listServicesRequestSchema = z.object({
  freelancerId: userIdSchema.optional(),
  styleId: idSchema.optional(),
  isActive: z.boolean().optional(),
  page: paginationSchema.page,
  limit: paginationSchema.limit,
});

export const serviceSummarySchema = z.object({
  id: idSchema,
  name: z.string(),
  styleName: z.string(),
  basePricePence: nonNegativeIntSchema.nullable(),
  studioPricePence: nonNegativeIntSchema.nullable(),
  mobilePricePence: nonNegativeIntSchema.nullable(),
  durationMinutes: positiveIntSchema,
  isActive: z.boolean(),
  averageRating: z.number().min(0).max(5).nullable(),
  totalReviews: nonNegativeIntSchema,
});

export const listServicesResponseSchema = z.object({
  services: z.array(serviceSummarySchema),
  total: nonNegativeIntSchema,
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});

export const updateServiceRequestSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  basePricePence: positiveIntSchema.optional(),
  studioPricePence: positiveIntSchema.optional(),
  mobilePricePence: positiveIntSchema.optional(),
  materialsFee: nonNegativeIntSchema.optional(),
  materialsPolicy: materialsPolicySchema.optional(),
  materialsDescription: z.string().max(500).optional(),
  travelFee: nonNegativeIntSchema.optional(),
  durationMinutes: positiveIntSchema.optional(),
  locationTypes: z.array(locationTypeSchema).min(1).optional(),
});

export const updateServiceResponseSchema = z.object({
  message: z.string(),
});

export const activateServiceResponseSchema = z.object({
  message: z.string(),
});

export const deactivateServiceResponseSchema = z.object({
  message: z.string(),
});

export const uploadImageResponseSchema = z.object({
  imageUrl: z.string(),
  imageId: idSchema,
});

export const serviceImageSchema = z.object({
  id: idSchema,
  serviceId: idSchema,
  imageUrl: z.string(),
  isPrimary: z.boolean(),
  displayOrder: z.number().int().nonnegative(),
  createdAt: z.string(),
});

export const listImagesResponseSchema = z.object({
  images: z.array(serviceImageSchema),
});

export const deleteImageResponseSchema = z.object({
  message: z.string(),
});
