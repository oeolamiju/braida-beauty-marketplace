import { z } from "zod";
import { idSchema, userIdSchema, positiveIntSchema, nonNegativeIntSchema } from "../shared/schemas";

export const dayOfWeekSchema = z.enum([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday"
]);

export const availabilityRuleSchema = z.object({
  dayOfWeek: dayOfWeekSchema,
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  isAvailable: z.boolean(),
});

export const setRulesRequestSchema = z.object({
  rules: z.array(availabilityRuleSchema),
});

export const setRulesResponseSchema = z.object({
  message: z.string(),
});

export const getRulesResponseSchema = z.object({
  rules: z.array(availabilityRuleSchema.extend({
    id: idSchema,
    freelancerId: userIdSchema,
  })),
});

export const exceptionTypeSchema = z.enum(["unavailable", "available"]);

export const addExceptionRequestSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  type: exceptionTypeSchema,
  reason: z.string().max(200).optional(),
});

export const addExceptionResponseSchema = z.object({
  id: idSchema,
  message: z.string(),
});

export const exceptionSchema = z.object({
  id: idSchema,
  freelancerId: userIdSchema,
  date: z.string(),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
  type: exceptionTypeSchema,
  reason: z.string().nullable(),
  createdAt: z.string(),
});

export const listExceptionsRequestSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const listExceptionsResponseSchema = z.object({
  exceptions: z.array(exceptionSchema),
});

export const deleteExceptionResponseSchema = z.object({
  message: z.string(),
});

export const availabilitySettingsSchema = z.object({
  minLeadTimeHours: nonNegativeIntSchema,
  maxBookingsPerDay: positiveIntSchema.nullable(),
  bufferMinutes: nonNegativeIntSchema,
});

export const getSettingsResponseSchema = availabilitySettingsSchema.extend({
  freelancerId: userIdSchema,
});

export const setSettingsRequestSchema = availabilitySettingsSchema.partial();

export const setSettingsResponseSchema = z.object({
  message: z.string(),
});

export const getServiceSlotsRequestSchema = z.object({
  serviceId: idSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const getServiceSlotsResponseSchema = z.object({
  slots: z.array(z.string().datetime()),
});

export const getScheduleRequestSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const scheduleSlotSchema = z.object({
  date: z.string(),
  slots: z.array(z.object({
    time: z.string(),
    isAvailable: z.boolean(),
  })),
});

export const getScheduleResponseSchema = z.object({
  schedule: z.array(scheduleSlotSchema),
});
