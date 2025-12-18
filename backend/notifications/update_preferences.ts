import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import db from "../db";
import { NotificationPreferences } from "./types";

interface UpdatePreferencesRequest {
  new_booking_request?: boolean;
  booking_confirmed?: boolean;
  booking_cancelled?: boolean;
  booking_declined?: boolean;
  booking_expired?: boolean;
  booking_reminder?: boolean;
  message_received?: boolean;
  booking_paid?: boolean;
  payment_confirmed?: boolean;
  payment_failed?: boolean;
  payment_released?: boolean;
  booking_refunded?: boolean;
  service_auto_confirmed?: boolean;
  booking_reschedule_requested?: boolean;
  booking_rescheduled?: boolean;
  booking_reschedule_rejected?: boolean;
  review_reminder?: boolean;
  email_enabled?: boolean;
}

export const updatePreferences = api(
  { method: "PUT", path: "/notifications/preferences", expose: true, auth: true },
  async (req: UpdatePreferencesRequest): Promise<NotificationPreferences> => {
    const auth = getAuthData()! as AuthData;
    const userId = auth.userID;

    await db.exec`
      INSERT INTO notification_preferences (user_id)
      VALUES (${userId})
      ON CONFLICT (user_id) DO NOTHING
    `;

    if (req.new_booking_request !== undefined) {
      await db.exec`
        UPDATE notification_preferences
        SET new_booking_request = ${req.new_booking_request}, updated_at = NOW()
        WHERE user_id = ${userId}
      `;
    }
    if (req.booking_confirmed !== undefined) {
      await db.exec`
        UPDATE notification_preferences
        SET booking_confirmed = ${req.booking_confirmed}, updated_at = NOW()
        WHERE user_id = ${userId}
      `;
    }
    if (req.booking_cancelled !== undefined) {
      await db.exec`
        UPDATE notification_preferences
        SET booking_cancelled = ${req.booking_cancelled}, updated_at = NOW()
        WHERE user_id = ${userId}
      `;
    }
    if (req.booking_declined !== undefined) {
      await db.exec`
        UPDATE notification_preferences
        SET booking_declined = ${req.booking_declined}, updated_at = NOW()
        WHERE user_id = ${userId}
      `;
    }
    if (req.booking_expired !== undefined) {
      await db.exec`
        UPDATE notification_preferences
        SET booking_expired = ${req.booking_expired}, updated_at = NOW()
        WHERE user_id = ${userId}
      `;
    }
    if (req.booking_reminder !== undefined) {
      await db.exec`
        UPDATE notification_preferences
        SET booking_reminder = ${req.booking_reminder}, updated_at = NOW()
        WHERE user_id = ${userId}
      `;
    }
    if (req.message_received !== undefined) {
      await db.exec`
        UPDATE notification_preferences
        SET message_received = ${req.message_received}, updated_at = NOW()
        WHERE user_id = ${userId}
      `;
    }
    if (req.booking_paid !== undefined) {
      await db.exec`
        UPDATE notification_preferences
        SET booking_paid = ${req.booking_paid}, updated_at = NOW()
        WHERE user_id = ${userId}
      `;
    }
    if (req.payment_confirmed !== undefined) {
      await db.exec`
        UPDATE notification_preferences
        SET payment_confirmed = ${req.payment_confirmed}, updated_at = NOW()
        WHERE user_id = ${userId}
      `;
    }
    if (req.payment_failed !== undefined) {
      await db.exec`
        UPDATE notification_preferences
        SET payment_failed = ${req.payment_failed}, updated_at = NOW()
        WHERE user_id = ${userId}
      `;
    }
    if (req.payment_released !== undefined) {
      await db.exec`
        UPDATE notification_preferences
        SET payment_released = ${req.payment_released}, updated_at = NOW()
        WHERE user_id = ${userId}
      `;
    }
    if (req.booking_refunded !== undefined) {
      await db.exec`
        UPDATE notification_preferences
        SET booking_refunded = ${req.booking_refunded}, updated_at = NOW()
        WHERE user_id = ${userId}
      `;
    }
    if (req.service_auto_confirmed !== undefined) {
      await db.exec`
        UPDATE notification_preferences
        SET service_auto_confirmed = ${req.service_auto_confirmed}, updated_at = NOW()
        WHERE user_id = ${userId}
      `;
    }
    if (req.booking_reschedule_requested !== undefined) {
      await db.exec`
        UPDATE notification_preferences
        SET booking_reschedule_requested = ${req.booking_reschedule_requested}, updated_at = NOW()
        WHERE user_id = ${userId}
      `;
    }
    if (req.booking_rescheduled !== undefined) {
      await db.exec`
        UPDATE notification_preferences
        SET booking_rescheduled = ${req.booking_rescheduled}, updated_at = NOW()
        WHERE user_id = ${userId}
      `;
    }
    if (req.booking_reschedule_rejected !== undefined) {
      await db.exec`
        UPDATE notification_preferences
        SET booking_reschedule_rejected = ${req.booking_reschedule_rejected}, updated_at = NOW()
        WHERE user_id = ${userId}
      `;
    }
    if (req.review_reminder !== undefined) {
      await db.exec`
        UPDATE notification_preferences
        SET review_reminder = ${req.review_reminder}, updated_at = NOW()
        WHERE user_id = ${userId}
      `;
    }
    if (req.email_enabled !== undefined) {
      await db.exec`
        UPDATE notification_preferences
        SET email_enabled = ${req.email_enabled}, updated_at = NOW()
        WHERE user_id = ${userId}
      `;
    }

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

    return prefs[0];
  }
);
