import { z } from "zod";

export const userRoleSchema = z.enum(["client", "freelancer", "admin"]);
export const bookingStatusSchema = z.enum([
  "pending",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled_by_client",
  "cancelled_by_freelancer",
  "declined",
  "expired"
]);
export const paymentStatusSchema = z.enum([
  "unpaid",
  "payment_pending",
  "payment_failed",
  "paid",
  "refunded",
  "partially_refunded"
]);
export const locationTypeSchema = z.enum([
  "client_travels_to_freelancer",
  "freelancer_travels_to_client"
]);
export const materialsPolicySchema = z.enum([
  "client_provides",
  "freelancer_provides",
  "both"
]);
export const verificationStatusSchema = z.enum([
  "not_submitted",
  "pending",
  "verified",
  "rejected"
]);
export const disputeStatusSchema = z.enum([
  "open",
  "in_review",
  "resolved",
  "closed"
]);
export const reportStatusSchema = z.enum([
  "pending",
  "in_review",
  "resolved",
  "dismissed"
]);
export const notificationTypeSchema = z.enum([
  "new_booking_request",
  "booking_accepted",
  "booking_declined",
  "booking_cancelled",
  "booking_reminder",
  "payment_received",
  "payout_processed",
  "review_received",
  "review_response",
  "verification_approved",
  "verification_rejected",
  "message_received",
  "reschedule_requested",
  "reschedule_accepted",
  "reschedule_declined",
  "review_reminder",
  "dispute_created",
  "dispute_updated",
  "dispute_resolved"
]);

export const idSchema = z.number().int().positive();
export const userIdSchema = z.string().min(1);
export const emailSchema = z.string().email();
export const passwordSchema = z.string().min(8);
export const urlSchema = z.string().url();
export const dateStringSchema = z.string().datetime();
export const postcodeSchema = z.string().min(1);
export const positiveIntSchema = z.number().int().positive();
export const nonNegativeIntSchema = z.number().int().nonnegative();
export const paginationSchema = {
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
};

export function validateResponse<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error("Response validation failed:", result.error);
    throw new Error(`Response validation failed: ${result.error.message}`);
  }
  return result.data;
}
