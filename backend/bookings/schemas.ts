import { z } from "zod";
import {
  idSchema,
  userIdSchema,
  bookingStatusSchema,
  paymentStatusSchema,
  locationTypeSchema,
  dateStringSchema,
  paginationSchema,
  nonNegativeIntSchema,
} from "../shared/schemas";

export const priceBreakdownSchema = z.object({
  basePricePence: nonNegativeIntSchema,
  materialsPricePence: nonNegativeIntSchema,
  travelPricePence: nonNegativeIntSchema,
  platformFeePence: nonNegativeIntSchema,
  totalPence: nonNegativeIntSchema,
});

export const createBookingRequestSchema = z.object({
  serviceId: idSchema,
  startDatetime: dateStringSchema,
  locationType: locationTypeSchema,
  clientAddressLine1: z.string().optional(),
  clientPostcode: z.string().optional(),
  clientCity: z.string().optional(),
  clientProvidesOwnMaterials: z.boolean().optional(),
  notes: z.string().optional(),
});

export const createBookingResponseSchema = z.object({
  id: idSchema,
  message: z.string(),
  requiresPayment: z.boolean(),
  paymentIntentId: z.string().optional(),
  clientSecret: z.string().optional(),
  priceBreakdown: priceBreakdownSchema.optional(),
});

export const getBookingResponseSchema = z.object({
  id: idSchema,
  clientId: userIdSchema,
  freelancerId: userIdSchema,
  serviceId: idSchema,
  serviceName: z.string(),
  clientName: z.string(),
  freelancerName: z.string(),
  startDatetime: z.string(),
  endDatetime: z.string(),
  status: bookingStatusSchema,
  paymentStatus: paymentStatusSchema,
  locationType: locationTypeSchema,
  clientAddressLine1: z.string().nullable(),
  clientPostcode: z.string().nullable(),
  clientCity: z.string().nullable(),
  notes: z.string().nullable(),
  priceBasePence: nonNegativeIntSchema,
  priceMaterialsPence: nonNegativeIntSchema,
  priceTravelPence: nonNegativeIntSchema,
  totalPricePence: nonNegativeIntSchema,
  createdAt: z.string(),
  expiresAt: z.string().nullable(),
  cancellationReason: z.string().nullable(),
  declineReason: z.string().nullable(),
});

export const listBookingsRequestSchema = z.object({
  status: bookingStatusSchema.optional(),
  role: z.enum(["client", "freelancer"]).optional(),
  page: paginationSchema.page,
  limit: paginationSchema.limit,
});

export const bookingSummarySchema = z.object({
  id: idSchema,
  serviceName: z.string(),
  clientName: z.string(),
  freelancerName: z.string(),
  startDatetime: z.string(),
  status: bookingStatusSchema,
  paymentStatus: paymentStatusSchema,
  totalPricePence: nonNegativeIntSchema,
});

export const listBookingsResponseSchema = z.object({
  bookings: z.array(bookingSummarySchema),
  total: nonNegativeIntSchema,
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});

export const acceptBookingResponseSchema = z.object({
  message: z.string(),
});

export const declineBookingRequestSchema = z.object({
  reason: z.string().min(1).max(500),
});

export const declineBookingResponseSchema = z.object({
  message: z.string(),
});

export const cancelBookingRequestSchema = z.object({
  reason: z.string().min(1).max(500),
});

export const cancelBookingResponseSchema = z.object({
  message: z.string(),
  refundAmount: nonNegativeIntSchema.optional(),
});

export const requestRescheduleRequestSchema = z.object({
  bookingId: idSchema,
  newStartDatetime: dateStringSchema,
  reason: z.string().min(1).max(500),
});

export const requestRescheduleResponseSchema = z.object({
  message: z.string(),
  requestId: idSchema,
});

export const respondRescheduleRequestSchema = z.object({
  requestId: idSchema,
  accept: z.boolean(),
  reason: z.string().optional(),
});

export const respondRescheduleResponseSchema = z.object({
  message: z.string(),
});

export const rescheduleRequestSchema = z.object({
  id: idSchema,
  bookingId: idSchema,
  requestedBy: z.enum(["client", "freelancer"]),
  newStartDatetime: z.string(),
  reason: z.string(),
  status: z.enum(["pending", "accepted", "declined"]),
  createdAt: z.string(),
});

export const listRescheduleRequestsResponseSchema = z.object({
  requests: z.array(rescheduleRequestSchema),
});

export const getAvailableSlotsRequestSchema = z.object({
  serviceId: idSchema,
  date: z.string(),
});

export const getAvailableSlotsResponseSchema = z.object({
  slots: z.array(z.string()),
});

export const dashboardStatsSchema = z.object({
  totalBookings: nonNegativeIntSchema,
  pendingBookings: nonNegativeIntSchema,
  confirmedBookings: nonNegativeIntSchema,
  completedBookings: nonNegativeIntSchema,
  totalEarnings: nonNegativeIntSchema,
  upcomingBookings: z.array(bookingSummarySchema),
});

export const getDashboardStatsResponseSchema = dashboardStatsSchema;
