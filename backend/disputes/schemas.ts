import { z } from "zod";
import { idSchema, userIdSchema, disputeStatusSchema, nonNegativeIntSchema, paginationSchema } from "../shared/schemas";

export const createDisputeRequestSchema = z.object({
  bookingId: idSchema,
  reason: z.string().min(10).max(2000),
  desiredResolution: z.string().min(10).max(1000),
});

export const createDisputeResponseSchema = z.object({
  id: idSchema,
  message: z.string(),
});

export const disputeSchema = z.object({
  id: idSchema,
  bookingId: idSchema,
  raisedBy: z.enum(["client", "freelancer"]),
  raisedById: userIdSchema,
  reason: z.string(),
  desiredResolution: z.string(),
  status: disputeStatusSchema,
  resolutionNotes: z.string().nullable(),
  resolvedBy: userIdSchema.nullable(),
  resolvedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const getDisputeResponseSchema = disputeSchema;

export const listDisputesByBookingResponseSchema = z.object({
  disputes: z.array(disputeSchema),
});

export const uploadAttachmentResponseSchema = z.object({
  attachmentUrl: z.string(),
});

export const adminListDisputesRequestSchema = z.object({
  status: disputeStatusSchema.optional(),
  page: paginationSchema.page,
  limit: paginationSchema.limit,
});

export const adminListDisputesResponseSchema = z.object({
  disputes: z.array(disputeSchema.extend({
    clientName: z.string(),
    freelancerName: z.string(),
    serviceName: z.string(),
  })),
  total: nonNegativeIntSchema,
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});

export const adminGetDisputeResponseSchema = disputeSchema.extend({
  clientName: z.string(),
  freelancerName: z.string(),
  serviceName: z.string(),
  bookingStartDatetime: z.string(),
  bookingTotalPricePence: nonNegativeIntSchema,
  notes: z.array(z.object({
    id: idSchema,
    adminId: userIdSchema,
    adminName: z.string(),
    note: z.string(),
    createdAt: z.string(),
  })),
});

export const adminUpdateStatusRequestSchema = z.object({
  status: disputeStatusSchema,
});

export const adminUpdateStatusResponseSchema = z.object({
  message: z.string(),
});

export const adminResolveRequestSchema = z.object({
  resolutionNotes: z.string().min(10).max(2000),
  refundAmountPence: nonNegativeIntSchema.optional(),
});

export const adminResolveResponseSchema = z.object({
  message: z.string(),
});

export const adminAddNoteRequestSchema = z.object({
  note: z.string().min(1).max(2000),
});

export const adminAddNoteResponseSchema = z.object({
  message: z.string(),
  noteId: idSchema,
});
