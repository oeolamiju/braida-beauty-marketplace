import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import { requireVerifiedFreelancer } from "../auth/middleware";
import db from "../db";
import type { DaySchedule } from "./types";
import { generateAvailableSlots } from "./slot_generator";

export interface GetScheduleRequest {
  date: string;
}

export interface GetScheduleResponse {
  schedule: DaySchedule;
}

export const getSchedule = api<GetScheduleRequest, GetScheduleResponse>(
  { auth: true, expose: true, method: "GET", path: "/availability/schedule" },
  async (req) => {
    requireVerifiedFreelancer();
    const auth = getAuthData()! as AuthData;

    const requestedDate = new Date(req.date);
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const settings = await db.queryRow<{
      min_lead_time_hours: number;
      max_bookings_per_day: number | null;
    }>`
      SELECT min_lead_time_hours, max_bookings_per_day
      FROM freelancer_availability_settings
      WHERE freelancer_id = ${auth.userID}
    `;

    const minLeadTimeHours = settings?.min_lead_time_hours || 0;
    const maxBookingsPerDay = settings?.max_bookings_per_day || null;

    const result = await generateAvailableSlots({
      freelancerId: auth.userID,
      date: requestedDate,
      durationMinutes: 60,
      minLeadTimeHours,
      maxBookingsPerDay,
    });

    const bookingsIter = db.query<{
      id: number;
      start_datetime: Date;
      end_datetime: Date;
      status: string;
    }>`
      SELECT id, start_datetime, end_datetime, status
      FROM bookings
      WHERE freelancer_id = ${auth.userID}
        AND start_datetime < ${endOfDay.toISOString()}
        AND end_datetime > ${startOfDay.toISOString()}
      ORDER BY start_datetime
    `;

    const bookings = [];
    for await (const b of bookingsIter) {
      bookings.push({
        id: b.id,
        startTime: b.start_datetime.toISOString(),
        endTime: b.end_datetime.toISOString(),
        status: b.status,
      });
    }

    const exceptionsIter = db.query<{
      id: number;
      start_datetime: Date;
      end_datetime: Date;
      type: string;
    }>`
      SELECT id, start_datetime, end_datetime, type
      FROM availability_exceptions
      WHERE freelancer_id = ${auth.userID}
        AND start_datetime < ${endOfDay.toISOString()}
        AND end_datetime > ${startOfDay.toISOString()}
      ORDER BY start_datetime
    `;

    const exceptions = [];
    for await (const e of exceptionsIter) {
      exceptions.push({
        id: e.id,
        startTime: e.start_datetime.toISOString(),
        endTime: e.end_datetime.toISOString(),
        type: e.type,
      });
    }

    const schedule: DaySchedule = {
      date: req.date,
      availableSlots: result.slots.map(slot => {
        const end = new Date(slot.getTime() + 60 * 60000);
        return {
          startTime: slot.toISOString(),
          endTime: end.toISOString(),
        };
      }),
      bookings,
      exceptions,
    };

    return { schedule };
  }
);
