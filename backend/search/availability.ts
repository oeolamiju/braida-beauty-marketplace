import { api, Query } from "encore.dev/api";
import { z } from "zod";
import db from "../db";
import { validateSchema } from "../shared/validation";

const checkAvailabilitySchema = z.object({
  freelancerId: z.string(),
  date: z.string(),
});

type CheckAvailabilityInput = z.infer<typeof checkAvailabilitySchema>;

interface CheckAvailabilityParams {
  freelancerId: Query<string>;
  date: Query<string>;
}

interface TimeSlot {
  start: string;
  end: string;
}

interface CheckAvailabilityResponse {
  available: boolean;
  slots: TimeSlot[];
}

export const checkAvailability = api<CheckAvailabilityParams, CheckAvailabilityResponse>(
  { expose: true, method: "GET", path: "/search/availability" },
  async (params): Promise<CheckAvailabilityResponse> => {
    const { freelancerId, date } = validateSchema<CheckAvailabilityInput>(checkAvailabilitySchema, params);

    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();

    const rules = await db.queryAll<{
      start_time: string;
      end_time: string;
    }>`
      SELECT start_time, end_time
      FROM availability_rules
      WHERE freelancer_id = ${freelancerId}
        AND day_of_week = ${dayOfWeek}
        AND is_active = true
    `;

    if (rules.length === 0) {
      return { available: false, slots: [] };
    }

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await db.queryAll<{
      start_datetime: Date;
      end_datetime: Date;
    }>`
      SELECT start_datetime, end_datetime
      FROM bookings
      WHERE freelancer_id = ${freelancerId}
        AND status IN ('pending', 'confirmed')
        AND start_datetime >= ${startOfDay}
        AND start_datetime <= ${endOfDay}
      ORDER BY start_datetime
    `;

    const exceptions = await db.queryAll<{
      start_datetime: Date;
      end_datetime: Date;
      type: string;
    }>`
      SELECT start_datetime, end_datetime, type
      FROM availability_exceptions
      WHERE freelancer_id = ${freelancerId}
        AND start_datetime >= ${startOfDay}
        AND end_datetime <= ${endOfDay}
    `;

    const slots: TimeSlot[] = [];
    
    for (const rule of rules) {
      const [startHour, startMin] = rule.start_time.split(':').map(Number);
      const [endHour, endMin] = rule.end_time.split(':').map(Number);
      
      const slotStart = new Date(targetDate);
      slotStart.setHours(startHour, startMin, 0, 0);
      
      const slotEnd = new Date(targetDate);
      slotEnd.setHours(endHour, endMin, 0, 0);

      let blocked = false;
      for (const exception of exceptions) {
        if (exception.type === 'blocked') {
          if (slotStart < exception.end_datetime && slotEnd > exception.start_datetime) {
            blocked = true;
            break;
          }
        }
      }

      if (!blocked) {
        for (const booking of bookings) {
          if (slotStart < booking.end_datetime && slotEnd > booking.start_datetime) {
            blocked = true;
            break;
          }
        }
      }

      if (!blocked) {
        slots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
        });
      }
    }

    return {
      available: slots.length > 0,
      slots,
    };
  }
);
