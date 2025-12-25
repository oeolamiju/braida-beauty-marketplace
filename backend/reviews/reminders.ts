import { api } from "encore.dev/api";
import { CronJob } from "encore.dev/cron";
import db from "../db";
import { sendNotification } from "../notifications/send";
import { sendEmail } from "../notifications/email_service";

async function sendReviewReminders(): Promise<{ sent: number }> {
  let sentCount = 0;

  // Find completed bookings without reviews
  // Send first reminder 2 hours after completion
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);

  const firstReminderBookings = db.query<{
    booking_id: number;
    client_id: string;
    client_email: string;
    client_name: string;
    freelancer_name: string;
    service_title: string;
  }>`
    SELECT 
      b.id as booking_id,
      b.client_id,
      u.email as client_email,
      CONCAT(u.first_name, ' ', u.last_name) as client_name,
      CONCAT(f.first_name, ' ', f.last_name) as freelancer_name,
      s.title as service_title
    FROM bookings b
    JOIN users u ON b.client_id = u.id
    JOIN users f ON b.freelancer_id = f.id
    JOIN services s ON b.service_id = s.id
    LEFT JOIN reviews r ON b.id = r.booking_id
    LEFT JOIN review_reminders rr ON b.id = rr.booking_id AND rr.reminder_type = 'first'
    WHERE b.status = 'completed'
      AND b.completed_at IS NOT NULL
      AND b.completed_at BETWEEN ${fourHoursAgo} AND ${twoHoursAgo}
      AND r.id IS NULL
      AND rr.id IS NULL
  `;

  for await (const booking of firstReminderBookings) {
    try {
      // Send in-app notification
      await sendNotification({
        userId: booking.client_id,
        type: "review_reminder",
        title: "How was your appointment?",
        message: `We'd love to hear about your experience with ${booking.freelancer_name}. Leave a review!`,
        data: {
          bookingId: booking.booking_id,
          serviceTitle: booking.service_title,
        },
      });

      // Send email
      await sendEmail({
        to: booking.client_email,
        subject: `How was your ${booking.service_title} appointment?`,
        html: getReviewReminderEmailTemplate({
          clientName: booking.client_name,
          freelancerName: booking.freelancer_name,
          serviceTitle: booking.service_title,
          bookingId: booking.booking_id,
        }),
      });

      // Log the reminder
      await db.exec`
        INSERT INTO review_reminders (booking_id, reminder_type, sent_at)
        VALUES (${booking.booking_id}, 'first', NOW())
      `;

      sentCount++;
    } catch (error) {
      console.error(`Failed to send first review reminder for booking ${booking.booking_id}:`, error);
    }
  }

  // Send second reminder 48 hours after completion
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const fiftyHoursAgo = new Date(Date.now() - 50 * 60 * 60 * 1000);

  const secondReminderBookings = db.query<{
    booking_id: number;
    client_id: string;
    client_email: string;
    client_name: string;
    freelancer_name: string;
    service_title: string;
  }>`
    SELECT 
      b.id as booking_id,
      b.client_id,
      u.email as client_email,
      u.name as client_name,
      f.name as freelancer_name,
      s.title as service_title
    FROM bookings b
    JOIN users u ON b.client_id = u.id
    JOIN users f ON b.freelancer_id = f.id
    JOIN services s ON b.service_id = s.id
    LEFT JOIN reviews r ON b.id = r.booking_id
    LEFT JOIN review_reminders rr ON b.id = rr.booking_id AND rr.reminder_type = 'second'
    WHERE b.status = 'completed'
      AND b.completed_at IS NOT NULL
      AND b.completed_at BETWEEN ${fiftyHoursAgo} AND ${fortyEightHoursAgo}
      AND r.id IS NULL
      AND rr.id IS NULL
  `;

  for await (const booking of secondReminderBookings) {
    try {
      await sendNotification({
        userId: booking.client_id,
        type: "review_reminder",
        title: "Don't forget to leave a review!",
        message: `Your feedback helps ${booking.freelancer_name} grow. Share your experience!`,
        data: {
          bookingId: booking.booking_id,
          serviceTitle: booking.service_title,
        },
      });

      await sendEmail({
        to: booking.client_email,
        subject: `Don't forget to review your ${booking.service_title} experience!`,
        html: getReviewReminderEmailTemplate({
          clientName: booking.client_name,
          freelancerName: booking.freelancer_name,
          serviceTitle: booking.service_title,
          bookingId: booking.booking_id,
          isSecondReminder: true,
        }),
      });

      await db.exec`
        INSERT INTO review_reminders (booking_id, reminder_type, sent_at)
        VALUES (${booking.booking_id}, 'second', NOW())
      `;

      sentCount++;
    } catch (error) {
      console.error(`Failed to send second review reminder for booking ${booking.booking_id}:`, error);
    }
  }

  return { sent: sentCount };
}

function getReviewReminderEmailTemplate(data: {
  clientName: string;
  freelancerName: string;
  serviceTitle: string;
  bookingId: number;
  isSecondReminder?: boolean;
}): string {
  const reviewUrl = `https://braida.uk/client/bookings/${data.bookingId}`;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <table width="100%" cellpadding="0" cellspacing="0" style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #f97316 0%, #f59e0b 100%); padding: 40px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">
                ${data.isSecondReminder ? "⭐ Last Chance to Review!" : "⭐ How was your appointment?"}
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Hi ${data.clientName},
              </p>
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                ${data.isSecondReminder 
                  ? `We noticed you haven't left a review yet for your recent ${data.serviceTitle} appointment with ${data.freelancerName}. Your feedback is invaluable!`
                  : `We hope you enjoyed your ${data.serviceTitle} appointment with ${data.freelancerName}! We'd love to hear about your experience.`
                }
              </p>
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                Your review helps other clients find great stylists and helps ${data.freelancerName} continue providing excellent service.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center;">
                    <a href="${reviewUrl}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #f59e0b 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Leave a Review
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0; text-align: center;">
                It only takes a minute! You can also upload a photo of your new look. 📸
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #f9fafb; padding: 20px 40px; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Braida. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Manual trigger for testing
export const triggerReviewReminders = api(
  { method: "POST", path: "/admin/review-reminders/trigger", expose: true, auth: true },
  async (): Promise<{ sent: number }> => {
    return sendReviewReminders();
  }
);

// Cron job to send review reminders
const reviewReminderCron = new CronJob("review-reminders", {
  title: "Send Review Reminders",
  schedule: "0 */2 * * *", // Every 2 hours
  endpoint: triggerReviewReminders,
});

