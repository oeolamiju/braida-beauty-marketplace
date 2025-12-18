import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { AuthData } from "../auth/auth";

export interface TrackEventRequest {
  event: string;
  properties?: Record<string, any>;
}

export interface TrackEventResponse {
  success: boolean;
}

export const track = api<TrackEventRequest, TrackEventResponse>(
  { expose: true, method: "POST", path: "/analytics/track", auth: true },
  async (req) => {
    const auth = getAuthData() as AuthData | undefined;

    await db.exec`
      INSERT INTO analytics_events (user_id, event_name, properties, created_at)
      VALUES (
        ${auth?.userID || null},
        ${req.event},
        ${JSON.stringify(req.properties || {})},
        NOW()
      )
    `;

    return { success: true };
  }
);

export async function trackEvent(
  userId: string | null,
  event: string,
  properties?: Record<string, any>
): Promise<void> {
  await db.exec`
    INSERT INTO analytics_events (user_id, event_name, properties, created_at)
    VALUES (
      ${userId},
      ${event},
      ${JSON.stringify(properties || {})},
      NOW()
    )
  `;
}
