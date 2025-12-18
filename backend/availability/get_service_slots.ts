import { api, APIError } from "encore.dev/api";
import db from "../db";
import { generateAvailableSlots } from "./slot_generator";

export interface GetServiceSlotsRequest {
  serviceId: number;
  date: string;
}

export interface GetServiceSlotsResponse {
  slots: string[];
}

export const getServiceSlots = api<GetServiceSlotsRequest, GetServiceSlotsResponse>(
  { expose: true, method: "GET", path: "/services/:serviceId/availability" },
  async (req) => {
    const requestedDate = new Date(req.date);
    if (isNaN(requestedDate.getTime())) {
      throw APIError.invalidArgument("invalid date format, use YYYY-MM-DD");
    }

    const service = await db.queryRow<{
      freelancer_id: string;
      duration_minutes: number;
      is_active: boolean;
    }>`
      SELECT freelancer_id, duration_minutes, is_active
      FROM services
      WHERE id = ${req.serviceId}
    `;

    if (!service || !service.is_active) {
      throw APIError.notFound("service not found or not active");
    }

    const settings = await db.queryRow<{
      min_lead_time_hours: number;
      max_bookings_per_day: number | null;
    }>`
      SELECT min_lead_time_hours, max_bookings_per_day
      FROM freelancer_availability_settings
      WHERE freelancer_id = ${service.freelancer_id}
    `;

    const minLeadTimeHours = settings?.min_lead_time_hours || 0;
    const maxBookingsPerDay = settings?.max_bookings_per_day || null;

    const result = await generateAvailableSlots({
      freelancerId: service.freelancer_id,
      date: requestedDate,
      durationMinutes: service.duration_minutes,
      minLeadTimeHours,
      maxBookingsPerDay,
    });

    return {
      slots: result.slots.map(slot => slot.toISOString()),
    };
  }
);
