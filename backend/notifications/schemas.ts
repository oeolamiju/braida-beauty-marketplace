import { z } from "zod";
import { idSchema, notificationTypeSchema, paginationSchema, nonNegativeIntSchema } from "../shared/schemas";

export const sendNotificationRequestSchema = z.object({
  userId: z.number().int().positive(),
  type: notificationTypeSchema,
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  data: z.record(z.unknown()).optional(),
  emailHtml: z.string().optional(),
});

export const sendNotificationResponseSchema = z.object({
  id: idSchema,
  message: z.string(),
});

export const notificationSchema = z.object({
  id: idSchema,
  userId: z.number().int().positive(),
  type: notificationTypeSchema,
  title: z.string(),
  message: z.string(),
  data: z.record(z.unknown()).nullable(),
  isRead: z.boolean(),
  createdAt: z.string(),
});

export const listNotificationsRequestSchema = z.object({
  unreadOnly: z.boolean().optional(),
  page: paginationSchema.page,
  limit: paginationSchema.limit,
});

export const listNotificationsResponseSchema = z.object({
  notifications: z.array(notificationSchema),
  total: nonNegativeIntSchema,
  unreadCount: nonNegativeIntSchema,
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});

export const markReadResponseSchema = z.object({
  message: z.string(),
});

export const markAllReadResponseSchema = z.object({
  message: z.string(),
  markedCount: nonNegativeIntSchema,
});

export const notificationPreferencesSchema = z.object({
  emailBookingRequests: z.boolean(),
  emailBookingUpdates: z.boolean(),
  emailPayments: z.boolean(),
  emailReviews: z.boolean(),
  emailMessages: z.boolean(),
  emailMarketing: z.boolean(),
  pushBookingRequests: z.boolean(),
  pushBookingUpdates: z.boolean(),
  pushPayments: z.boolean(),
  pushReviews: z.boolean(),
  pushMessages: z.boolean(),
});

export const getPreferencesResponseSchema = notificationPreferencesSchema;

export const updatePreferencesRequestSchema = notificationPreferencesSchema.partial();

export const updatePreferencesResponseSchema = z.object({
  message: z.string(),
});

export const notificationStreamEventSchema = z.object({
  event: z.enum(["notification", "ping"]),
  notification: notificationSchema.optional(),
});
