import { api } from "encore.dev/api";
import { CronJob } from "encore.dev/cron";
import db from "../db";
import { sendNotification } from "./send";
import { getReviewReminderEmail } from "./email_service";

export const sendReminders = api(
  { expose: false, method: "POST", path: "/internal/notifications/review-reminders" },
  async (): Promise<void> => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const bookings: {
      id: number;
      client_id: string;
      freelancer_id: string;
      end_datetime: Date;
      service_name: string;
      client_name: string;
      client_email: string;
      freelancer_name: string;
    }[] = [];

    for await (const row of db.query<{
      id: number;
      client_id: string;
      freelancer_id: string;
      end_datetime: Date;
      service_name: string;
      client_name: string;
      client_email: string;
      freelancer_name: string;
    }>`
      SELECT 
        b.id, 
        b.client_id, 
        b.freelancer_id, 
        b.end_datetime,
        s.name as service_name,
        cu.name as client_name,
        cu.email as client_email,
        fu.name as freelancer_name
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users cu ON b.client_id = cu.id
      JOIN users fu ON b.freelancer_id = fu.id
      WHERE b.status = 'confirmed'
        AND b.completed_at IS NOT NULL
        AND b.end_datetime BETWEEN ${twoDaysAgo.toISOString()} AND ${oneDayAgo.toISOString()}
        AND NOT EXISTS (
          SELECT 1 FROM reviews r
          WHERE r.booking_id = b.id
        )
        AND NOT EXISTS (
          SELECT 1 FROM notifications n
          WHERE n.user_id::text = b.client_id
            AND n.type = 'review_reminder'
            AND n.data->>'bookingId' = b.id::text
        )
    `) {
      bookings.push(row);
    }

    for (const booking of bookings) {
      await sendNotification({
        userId: booking.client_id,
        type: "review_reminder",
        title: "Leave a Review",
        message: `How was your experience with ${booking.freelancer_name}? Leave a review!`,
        data: { bookingId: booking.id },
        emailHtml: getReviewReminderEmail(
          booking.client_name,
          booking.freelancer_name,
          booking.service_name,
          booking.id
        ),
      });
    }
  }
);

export const sendReviewReminders = new CronJob("send-review-reminders", {
  title: "Send review reminders",
  every: "1h",
  endpoint: sendReminders,
});
