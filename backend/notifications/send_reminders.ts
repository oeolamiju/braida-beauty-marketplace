import { api } from "encore.dev/api";
import { CronJob } from "encore.dev/cron";
import db from "../db";
import { sendNotification } from "./send";
import { getBookingReminderEmail } from "./email_service";

export const send24HourReminders = api(
  { expose: false, method: "POST", path: "/internal/notifications/reminders/24h" },
  async (): Promise<void> => {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in24HoursPlus10 = new Date(in24Hours.getTime() + 10 * 60 * 1000);

    const bookings: {
      id: number;
      client_id: string;
      freelancer_id: string;
      start_datetime: Date;
      service_name: string;
      client_name: string;
      client_email: string;
      freelancer_name: string;
      freelancer_email: string;
    }[] = [];

    for await (const row of db.query<{
      id: number;
      client_id: string;
      freelancer_id: string;
      start_datetime: Date;
      service_name: string;
      client_name: string;
      client_email: string;
      freelancer_name: string;
      freelancer_email: string;
    }>`
      SELECT 
        b.id, 
        b.client_id, 
        b.freelancer_id, 
        b.start_datetime,
        s.name as service_name,
        cu.name as client_name,
        cu.email as client_email,
        fu.name as freelancer_name,
        fu.email as freelancer_email
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users cu ON b.client_id = cu.id
      JOIN users fu ON b.freelancer_id = fu.id
      WHERE b.status = 'confirmed'
        AND b.start_datetime BETWEEN ${in24Hours.toISOString()} AND ${in24HoursPlus10.toISOString()}
        AND NOT EXISTS (
          SELECT 1 FROM notifications n
          WHERE n.user_id::text = b.client_id
            AND n.type = 'booking_reminder'
            AND n.data->>'bookingId' = b.id::text
            AND n.data->>'hoursUntil' = '24'
        )
    `) {
      bookings.push(row);
    }

    for (const booking of bookings) {
      await sendNotification({
        userId: booking.client_id,
        type: "booking_reminder",
        title: "Booking Reminder - 24 Hours",
        message: `Your appointment for ${booking.service_name} is in 24 hours`,
        data: { bookingId: booking.id, hoursUntil: 24 },
        emailHtml: getBookingReminderEmail(
          booking.client_name,
          booking.service_name,
          booking.start_datetime,
          booking.id,
          24
        ),
      });

      await sendNotification({
        userId: booking.freelancer_id,
        type: "booking_reminder",
        title: "Booking Reminder - 24 Hours",
        message: `You have an appointment with ${booking.client_name} in 24 hours`,
        data: { bookingId: booking.id, hoursUntil: 24 },
        emailHtml: getBookingReminderEmail(
          booking.freelancer_name,
          booking.service_name,
          booking.start_datetime,
          booking.id,
          24
        ),
      });
    }
  }
);

export const send2HourReminders = api(
  { expose: false, method: "POST", path: "/internal/notifications/reminders/2h" },
  async (): Promise<void> => {
    const now = new Date();
    const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const in2HoursPlus10 = new Date(in2Hours.getTime() + 10 * 60 * 1000);

    const bookings: {
      id: number;
      client_id: string;
      freelancer_id: string;
      start_datetime: Date;
      service_name: string;
      client_name: string;
      client_email: string;
      freelancer_name: string;
      freelancer_email: string;
    }[] = [];

    for await (const row of db.query<{
      id: number;
      client_id: string;
      freelancer_id: string;
      start_datetime: Date;
      service_name: string;
      client_name: string;
      client_email: string;
      freelancer_name: string;
      freelancer_email: string;
    }>`
      SELECT 
        b.id, 
        b.client_id, 
        b.freelancer_id, 
        b.start_datetime,
        s.name as service_name,
        cu.name as client_name,
        cu.email as client_email,
        fu.name as freelancer_name,
        fu.email as freelancer_email
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users cu ON b.client_id = cu.id
      JOIN users fu ON b.freelancer_id = fu.id
      WHERE b.status = 'confirmed'
        AND b.start_datetime BETWEEN ${in2Hours.toISOString()} AND ${in2HoursPlus10.toISOString()}
        AND NOT EXISTS (
          SELECT 1 FROM notifications n
          WHERE n.user_id::text = b.client_id
            AND n.type = 'booking_reminder'
            AND n.data->>'bookingId' = b.id::text
            AND n.data->>'hoursUntil' = '2'
        )
    `) {
      bookings.push(row);
    }

    for (const booking of bookings) {
      await sendNotification({
        userId: booking.client_id,
        type: "booking_reminder",
        title: "Booking Reminder - 2 Hours",
        message: `Your appointment for ${booking.service_name} is in 2 hours`,
        data: { bookingId: booking.id, hoursUntil: 2 },
        emailHtml: getBookingReminderEmail(
          booking.client_name,
          booking.service_name,
          booking.start_datetime,
          booking.id,
          2
        ),
      });

      await sendNotification({
        userId: booking.freelancer_id,
        type: "booking_reminder",
        title: "Booking Reminder - 2 Hours",
        message: `You have an appointment with ${booking.client_name} in 2 hours`,
        data: { bookingId: booking.id, hoursUntil: 2 },
        emailHtml: getBookingReminderEmail(
          booking.freelancer_name,
          booking.service_name,
          booking.start_datetime,
          booking.id,
          2
        ),
      });
    }
  }
);

export const sendBookingReminders = new CronJob("send-booking-reminders", {
  title: "Send booking reminders",
  every: "10m",
  endpoint: send24HourReminders,
});

export const send2HourRemindersCron = new CronJob("send-2hour-reminders", {
  title: "Send 2-hour booking reminders",
  every: "10m",
  endpoint: send2HourReminders,
});
