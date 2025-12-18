import { z } from "zod";
import { idSchema, userIdSchema, verificationStatusSchema, paginationSchema, nonNegativeIntSchema } from "../shared/schemas";

export const documentTypeSchema = z.enum(["passport", "drivers_license", "national_id"]);

export const submitVerificationRequestSchema = z.object({
  documentType: documentTypeSchema,
  documentNumber: z.string().min(1).max(50),
  documentFrontUrl: z.string().url(),
  documentBackUrl: z.string().url().optional(),
  selfieUrl: z.string().url(),
});

export const submitVerificationResponseSchema = z.object({
  message: z.string(),
});

export const getStatusResponseSchema = z.object({
  status: verificationStatusSchema,
  submittedAt: z.string().nullable(),
  reviewedAt: z.string().nullable(),
  rejectionReason: z.string().nullable(),
});

export const getDocumentResponseSchema = z.object({
  documentType: documentTypeSchema,
  documentNumber: z.string(),
  documentFrontUrl: z.string(),
  documentBackUrl: z.string().nullable(),
  selfieUrl: z.string(),
  submittedAt: z.string(),
});

export const adminListVerificationsRequestSchema = z.object({
  status: verificationStatusSchema.optional(),
  page: paginationSchema.page,
  limit: paginationSchema.limit,
});

export const verificationSummarySchema = z.object({
  userId: userIdSchema,
  userName: z.string(),
  userEmail: z.string(),
  status: verificationStatusSchema,
  submittedAt: z.string().nullable(),
  reviewedAt: z.string().nullable(),
});

export const adminListVerificationsResponseSchema = z.object({
  verifications: z.array(verificationSummarySchema),
  total: nonNegativeIntSchema,
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});

export const adminGetVerificationResponseSchema = z.object({
  userId: userIdSchema,
  userName: z.string(),
  userEmail: z.string(),
  status: verificationStatusSchema,
  documentType: documentTypeSchema,
  documentNumber: z.string(),
  documentFrontUrl: z.string(),
  documentBackUrl: z.string().nullable(),
  selfieUrl: z.string(),
  submittedAt: z.string(),
  reviewedAt: z.string().nullable(),
  rejectionReason: z.string().nullable(),
});

export const adminApproveRequestSchema = z.object({
  notes: z.string().max(500).optional(),
});

export const adminApproveResponseSchema = z.object({
  message: z.string(),
});

export const adminRejectRequestSchema = z.object({
  reason: z.string().min(1).max(500),
});

export const adminRejectResponseSchema = z.object({
  message: z.string(),
});
