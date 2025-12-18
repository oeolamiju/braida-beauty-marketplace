import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { PayoutScheduleType } from "./types";

export interface SetPayoutScheduleRequest {
  scheduleType: PayoutScheduleType;
}

export interface SetPayoutScheduleResponse {
  success: boolean;
}

export const setSchedule = api(
  { method: "POST", path: "/payouts/schedule", expose: true, auth: true },
  async (req: SetPayoutScheduleRequest): Promise<SetPayoutScheduleResponse> => {
    const auth = getAuthData()!;
    
    await db.exec`
      INSERT INTO payout_schedules (freelancer_id, schedule_type)
      VALUES (${auth.userID}, ${req.scheduleType})
      ON CONFLICT (freelancer_id) 
      DO UPDATE SET 
        schedule_type = ${req.scheduleType},
        updated_at = NOW()
    `;
    
    return { success: true };
  }
);
