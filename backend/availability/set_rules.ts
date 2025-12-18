import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import { requireVerifiedFreelancer } from "../auth/middleware";
import db from "../db";
import type { AvailabilityRule } from "./types";

export interface SetRulesRequest {
  rules: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
}

export interface SetRulesResponse {
  rules: AvailabilityRule[];
}

export const setRules = api<SetRulesRequest, SetRulesResponse>(
  { auth: true, expose: true, method: "POST", path: "/availability/rules" },
  async (req) => {
    requireVerifiedFreelancer();
    const auth = getAuthData()! as AuthData;

    for (const rule of req.rules) {
      if (rule.dayOfWeek < 0 || rule.dayOfWeek > 6) {
        throw APIError.invalidArgument("dayOfWeek must be between 0 (Sunday) and 6 (Saturday)");
      }
      
      if (!rule.startTime.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
        throw APIError.invalidArgument("startTime must be in HH:MM or HH:MM:SS format");
      }
      
      if (!rule.endTime.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
        throw APIError.invalidArgument("endTime must be in HH:MM or HH:MM:SS format");
      }
    }

    await db.exec`
      DELETE FROM availability_rules
      WHERE freelancer_id = ${auth.userID}
    `;

    const insertedRules: AvailabilityRule[] = [];

    for (const rule of req.rules) {
      const result = await db.queryRow<{
        id: number;
        day_of_week: number;
        start_time: string;
        end_time: string;
        is_active: boolean;
      }>`
        INSERT INTO availability_rules (freelancer_id, day_of_week, start_time, end_time)
        VALUES (${auth.userID}, ${rule.dayOfWeek}, ${rule.startTime}, ${rule.endTime})
        RETURNING id, day_of_week, start_time, end_time, is_active
      `;

      if (result) {
        insertedRules.push({
          id: result.id,
          dayOfWeek: result.day_of_week,
          startTime: result.start_time,
          endTime: result.end_time,
          isActive: result.is_active,
        });
      }
    }

    return { rules: insertedRules };
  }
);
