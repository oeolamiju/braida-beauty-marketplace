import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import { requireVerifiedFreelancer } from "../auth/middleware";
import db from "../db";
import type { AvailabilityRule } from "./types";

export interface GetRulesResponse {
  rules: AvailabilityRule[];
}

export const getRules = api<void, GetRulesResponse>(
  { auth: true, expose: true, method: "GET", path: "/availability/rules" },
  async () => {
    requireVerifiedFreelancer();
    const auth = getAuthData()! as AuthData;

    const rulesIter = db.query<{
      id: number;
      day_of_week: number;
      start_time: string;
      end_time: string;
      is_active: boolean;
    }>`
      SELECT id, day_of_week, start_time, end_time, is_active
      FROM availability_rules
      WHERE freelancer_id = ${auth.userID}
      ORDER BY day_of_week, start_time
    `;

    const rules = [];
    for await (const r of rulesIter) {
      rules.push({
        id: r.id,
        dayOfWeek: r.day_of_week,
        startTime: r.start_time,
        endTime: r.end_time,
        isActive: r.is_active,
      });
    }

    return { rules };
  }
);
