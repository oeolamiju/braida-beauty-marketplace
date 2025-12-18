import db from "../db";
import { emit } from "./events";
import { NotificationType, CRITICAL_NOTIFICATION_TYPES } from "./types";
import { sendEmail } from "./email_service";

interface SendNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  emailHtml?: string;
}

export async function sendNotification(params: SendNotificationParams): Promise<void> {
  const { userId, type, title, message, data, emailHtml } = params;

  const prefs: { enabled: boolean; email_enabled: boolean }[] = [];
  for await (const row of db.query<{ enabled: boolean; email_enabled: boolean }>`
    SELECT ${type} as enabled, email_enabled
    FROM notification_preferences
    WHERE user_id = ${userId}
  `) {
    prefs.push(row);
  }

  const isEnabled = prefs[0]?.enabled ?? true;
  const emailEnabled = prefs[0]?.email_enabled ?? true;

  if (!isEnabled) {
    return;
  }

  await db.exec`
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (${userId}, ${type}, ${title}, ${message}, ${data ? JSON.stringify(data) : null})
  `;

  emit({
    userId,
    type,
    title,
    message,
    data,
  });

  const isCritical = CRITICAL_NOTIFICATION_TYPES.includes(type);
  if (emailHtml && (emailEnabled || isCritical)) {
    const users: { email: string }[] = [];
    for await (const row of db.query<{ email: string }>`
      SELECT email FROM users WHERE id = ${userId}
    `) {
      users.push(row);
    }

    if (users[0]) {
      try {
        await sendEmail({
          to: users[0].email,
          subject: title,
          html: emailHtml,
        });
      } catch (error) {
        console.error("Failed to send email notification:", error);
      }
    }
  }
}
