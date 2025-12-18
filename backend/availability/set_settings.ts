import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import { requireVerifiedFreelancer } from "../auth/middleware";
import db from "../db";
import type { AvailabilitySettings } from "./types";

export interface SetSettingsRequest {
  minLeadTimeHours: number;
  maxBookingsPerDay?: number;
}

export interface SetSettingsResponse {
  settings: AvailabilitySettings;
}

export const setSettings = api<SetSettingsRequest, SetSettingsResponse>(
  { auth: true, expose: true, method: "POST", path: "/availability/settings" },
  async (req) => {
    requireVerifiedFreelancer();
    const auth = getAuthData()! as AuthData;

    if (req.minLeadTimeHours < 0) {
      throw APIError.invalidArgument("minLeadTimeHours must be non-negative");
    }

    if (req.maxBookingsPerDay !== undefined && req.maxBookingsPerDay < 1) {
      throw APIError.invalidArgument("maxBookingsPerDay must be at least 1");
    }

    await db.exec`
      INSERT INTO freelancer_availability_settings (freelancer_id, min_lead_time_hours, max_bookings_per_day)
      VALUES (${auth.userID}, ${req.minLeadTimeHours}, ${req.maxBookingsPerDay || null})
      ON CONFLICT (freelancer_id) DO UPDATE SET
        min_lead_time_hours = ${req.minLeadTimeHours},
        max_bookings_per_day = ${req.maxBookingsPerDay || null},
        updated_at = NOW()
    `;

    return {
      settings: {
        minLeadTimeHours: req.minLeadTimeHours,
        maxBookingsPerDay: req.maxBookingsPerDay || null,
      },
    };
  }
);
