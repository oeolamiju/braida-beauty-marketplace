import { z } from "zod";
import { idSchema, userIdSchema, reportStatusSchema, paginationSchema, nonNegativeIntSchema } from "../shared/schemas";

export const reportTypeSchema = z.enum([
  "inappropriate_content",
  "harassment",
  "fraud",
  "fake_profile",
  "other"
]);

export const reportTargetTypeSchema = z.enum(["user", "service", "review"]);

export const submitReportRequestSchema = z.object({
  targetType: reportTargetTypeSchema,
  targetId: z.string().min(1),
  type: reportTypeSchema,
  description: z.string().min(10).max(2000),
  attachmentUrls: z.array(z.string().url()).max(5).optional(),
});

export const submitReportResponseSchema = z.object({
  id: idSchema,
  message: z.string(),
});

export const uploadAttachmentResponseSchema = z.object({
  attachmentUrl: z.string(),
});

export const adminListReportsRequestSchema = z.object({
  status: reportStatusSchema.optional(),
  targetType: reportTargetTypeSchema.optional(),
  page: paginationSchema.page,
  limit: paginationSchema.limit,
});

export const reportSummarySchema = z.object({
  id: idSchema,
  reportedBy: userIdSchema,
  reporterName: z.string(),
  targetType: reportTargetTypeSchema,
  targetId: z.string(),
  type: reportTypeSchema,
  status: reportStatusSchema,
  createdAt: z.string(),
});

export const adminListReportsResponseSchema = z.object({
  reports: z.array(reportSummarySchema),
  total: nonNegativeIntSchema,
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});

export const adminGetReportResponseSchema = z.object({
  id: idSchema,
  reportedBy: userIdSchema,
  reporterName: z.string(),
  reporterEmail: z.string(),
  targetType: reportTargetTypeSchema,
  targetId: z.string(),
  type: reportTypeSchema,
  description: z.string(),
  attachmentUrls: z.array(z.string()),
  status: reportStatusSchema,
  reviewedBy: userIdSchema.nullable(),
  reviewerName: z.string().nullable(),
  reviewNotes: z.string().nullable(),
  reviewedAt: z.string().nullable(),
  createdAt: z.string(),
});

export const adminUpdateStatusRequestSchema = z.object({
  status: reportStatusSchema,
  reviewNotes: z.string().max(1000).optional(),
});

export const adminUpdateStatusResponseSchema = z.object({
  message: z.string(),
});

export const adminAccountActionRequestSchema = z.object({
  action: z.enum(["warn", "suspend", "ban"]),
  reason: z.string().min(1).max(500),
  durationDays: z.number().int().positive().optional(),
});

export const adminAccountActionResponseSchema = z.object({
  message: z.string(),
});
