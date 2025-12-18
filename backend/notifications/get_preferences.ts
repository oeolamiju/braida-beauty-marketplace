import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import db from "../db";
import { NotificationPreferences } from "./types";

export const getPreferences = api(
  { method: "GET", path: "/notifications/preferences", expose: true, auth: true },
  async (): Promise<NotificationPreferences> => {
    const auth = getAuthData()! as AuthData;
    const userId = auth.userID;

    const prefs: NotificationPreferences[] = [];
    for await (const row of db.query<NotificationPreferences>`
      SELECT 
        user_id, 
        new_booking_request, 
        booking_confirmed, 
        booking_cancelled,
        booking_declined, 
        booking_expired, 
        booking_reminder, 
        message_received,
        booking_paid,
        payment_confirmed,
        payment_failed,
        payment_released,
        booking_refunded,
        service_auto_confirmed,
        booking_reschedule_requested,
        booking_rescheduled,
        booking_reschedule_rejected,
        review_reminder,
        email_enabled,
        updated_at
      FROM notification_preferences
      WHERE user_id = ${userId}
    `) {
      prefs.push(row);
    }

    if (prefs.length === 0) {
      await db.exec`
        INSERT INTO notification_preferences (user_id)
        VALUES (${userId})
      `;

      return {
        user_id: userId,
        new_booking_request: true,
        booking_confirmed: true,
        booking_cancelled: true,
        booking_declined: true,
        booking_expired: true,
        booking_reminder: true,
        message_received: true,
        booking_paid: true,
        payment_confirmed: true,
        payment_failed: true,
        payment_released: true,
        booking_refunded: true,
        service_auto_confirmed: true,
        booking_reschedule_requested: true,
        booking_rescheduled: true,
        booking_reschedule_rejected: true,
        review_reminder: true,
        email_enabled: true,
        updated_at: new Date(),
      };
    }

    return prefs[0];
  }
);
