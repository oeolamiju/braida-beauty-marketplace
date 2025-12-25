import { z } from "zod";

export const CreateContentPageSchema = z.object({
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(500),
  content: z.string().min(1),
  metaDescription: z.string().max(1000).optional(),
  category: z.string().min(1).max(100),
  isPublished: z.boolean().optional(),
});

export const UpdateContentPageSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  content: z.string().min(1).optional(),
  metaDescription: z.string().max(1000).optional(),
  category: z.string().min(1).max(100).optional(),
  isPublished: z.boolean().optional(),
});

export const CreateFAQSchema = z.object({
  category: z.string().min(1).max(100),
  question: z.string().min(1),
  answer: z.string().min(1),
  displayOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const UpdateFAQSchema = z.object({
  category: z.string().min(1).max(100).optional(),
  question: z.string().min(1).optional(),
  answer: z.string().min(1).optional(),
  displayOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const CreateSafetyResourceSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().min(1),
  resourceType: z.string().min(1).max(50),
  url: z.string().url().optional(),
  phoneNumber: z.string().max(50).optional(),
  isEmergency: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const UpdateSafetyResourceSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().min(1).optional(),
  resourceType: z.string().min(1).max(50).optional(),
  url: z.string().url().optional(),
  phoneNumber: z.string().max(50).optional(),
  isEmergency: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});
