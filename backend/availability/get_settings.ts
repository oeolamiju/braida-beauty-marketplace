import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import { requireVerifiedFreelancer } from "../auth/middleware";
import db from "../db";
import type { AvailabilitySettings } from "./types";

export interface GetSettingsResponse {
  settings: AvailabilitySettings;
}

export const getSettings = api<void, GetSettingsResponse>(
  { auth: true, expose: true, method: "GET", path: "/availability/settings" },
  async () => {
    requireVerifiedFreelancer();
    const auth = getAuthData()! as AuthData;

    const settings = await db.queryRow<{
      min_lead_time_hours: number;
      max_bookings_per_day: number | null;
    }>`
      SELECT min_lead_time_hours, max_bookings_per_day
      FROM freelancer_availability_settings
      WHERE freelancer_id = ${auth.userID}
    `;

    if (!settings) {
      return {
        settings: {
          minLeadTimeHours: 0,
          maxBookingsPerDay: null,
        },
      };
    }

    return {
      settings: {
        minLeadTimeHours: settings.min_lead_time_hours,
        maxBookingsPerDay: settings.max_bookings_per_day,
      },
    };
  }
);
