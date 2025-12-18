import { z } from "zod";
import {
  idSchema,
  userIdSchema,
  userRoleSchema,
  bookingStatusSchema,
  paymentStatusSchema,
  verificationStatusSchema,
  paginationSchema,
  nonNegativeIntSchema,
} from "../shared/schemas";

export const adminListUsersRequestSchema = z.object({
  role: userRoleSchema.optional(),
  search: z.string().optional(),
  page: paginationSchema.page,
  limit: paginationSchema.limit,
});

export const userSummarySchema = z.object({
  id: userIdSchema,
  email: z.string(),
  name: z.string(),
  role: userRoleSchema,
  isVerified: z.boolean(),
  isSuspended: z.boolean(),
  createdAt: z.string(),
});

export const adminListUsersResponseSchema = z.object({
  users: z.array(userSummarySchema),
  total: nonNegativeIntSchema,
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});

export const adminGetUserResponseSchema = z.object({
  id: userIdSchema,
  email: z.string(),
  name: z.string(),
  role: userRoleSchema,
  isVerified: z.boolean(),
  isSuspended: z.boolean(),
  suspendedAt: z.string().nullable(),
  suspendedBy: userIdSchema.nullable(),
  suspensionReason: z.string().nullable(),
  bio: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  addressLine1: z.string().nullable(),
  city: z.string().nullable(),
  postcode: z.string().nullable(),
  verificationStatus: verificationStatusSchema,
  createdAt: z.string(),
});

export const adminSuspendUserRequestSchema = z.object({
  reason: z.string().min(1).max(500),
});

export const adminSuspendUserResponseSchema = z.object({
  message: z.string(),
});

export const adminUnsuspendUserResponseSchema = z.object({
  message: z.string(),
});

export const adminListBookingsRequestSchema = z.object({
  status: bookingStatusSchema.optional(),
  clientId: userIdSchema.optional(),
  freelancerId: userIdSchema.optional(),
  page: paginationSchema.page,
  limit: paginationSchema.limit,
});

export const bookingAdminSummarySchema = z.object({
  id: idSchema,
  clientName: z.string(),
  freelancerName: z.string(),
  serviceName: z.string(),
  startDatetime: z.string(),
  status: bookingStatusSchema,
  paymentStatus: paymentStatusSchema,
  totalPricePence: nonNegativeIntSchema,
});

export const adminListBookingsResponseSchema = z.object({
  bookings: z.array(bookingAdminSummarySchema),
  total: nonNegativeIntSchema,
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});

export const adminGetBookingResponseSchema = z.object({
  id: idSchema,
  clientId: userIdSchema,
  freelancerId: userIdSchema,
  serviceId: idSchema,
  clientName: z.string(),
  clientEmail: z.string(),
  freelancerName: z.string(),
  freelancerEmail: z.string(),
  serviceName: z.string(),
  startDatetime: z.string(),
  endDatetime: z.string(),
  status: bookingStatusSchema,
  paymentStatus: paymentStatusSchema,
  locationType: z.string(),
  totalPricePence: nonNegativeIntSchema,
  notes: z.string().nullable(),
  cancellationReason: z.string().nullable(),
  createdAt: z.string(),
});

export const adminListServicesRequestSchema = z.object({
  freelancerId: userIdSchema.optional(),
  isActive: z.boolean().optional(),
  page: paginationSchema.page,
  limit: paginationSchema.limit,
});

export const serviceAdminSummarySchema = z.object({
  id: idSchema,
  freelancerName: z.string(),
  name: z.string(),
  styleName: z.string(),
  basePricePence: nonNegativeIntSchema,
  isActive: z.boolean(),
  createdAt: z.string(),
});

export const adminListServicesResponseSchema = z.object({
  services: z.array(serviceAdminSummarySchema),
  total: nonNegativeIntSchema,
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});

export const adminDeactivateServiceResponseSchema = z.object({
  message: z.string(),
});

export const adminReactivateServiceResponseSchema = z.object({
  message: z.string(),
});

export const actionLogSchema = z.object({
  id: idSchema,
  adminId: userIdSchema,
  adminName: z.string(),
  action: z.string(),
  targetType: z.string(),
  targetId: z.string(),
  metadata: z.record(z.unknown()).nullable(),
  createdAt: z.string(),
});

export const adminListLogsRequestSchema = z.object({
  adminId: userIdSchema.optional(),
  targetType: z.string().optional(),
  page: paginationSchema.page,
  limit: paginationSchema.limit,
});

export const adminListLogsResponseSchema = z.object({
  logs: z.array(actionLogSchema),
  total: nonNegativeIntSchema,
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});

export const platformSettingsSchema = z.object({
  maintenanceMode: z.boolean(),
  allowNewRegistrations: z.boolean(),
  platformFeePercentage: z.number().min(0).max(100),
  minimumBookingPrice: nonNegativeIntSchema,
  maximumBookingPrice: nonNegativeIntSchema,
  defaultCancellationWindowHours: z.number().int().positive(),
  autoAcceptBookingsAfterHours: z.number().int().positive().nullable(),
});

export const adminGetSettingsResponseSchema = platformSettingsSchema;

export const adminUpdateSettingsRequestSchema = platformSettingsSchema.partial();

export const adminUpdateSettingsResponseSchema = z.object({
  message: z.string(),
});
