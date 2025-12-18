import { api } from "encore.dev/api";
import { CronJob } from "encore.dev/cron";
import db from "../db";
import { sendNotification } from "../notifications/send";

interface ExpiredBooking {
  id: number;
  client_id: string;
  freelancer_id: string;
  start_datetime: Date;
}

export const expirePending = api(
  { expose: false, method: "POST", path: "/bookings/cron/expire-pending" },
  async () => {
    const expiredBookings = await db.queryAll<ExpiredBooking>`
      UPDATE bookings
      SET status = 'expired', updated_at = NOW()
      WHERE status = 'pending' AND expires_at < NOW()
      RETURNING id, client_id, freelancer_id, start_datetime
    `;

    for (const booking of expiredBookings) {
      await db.exec`
        INSERT INTO booking_audit_logs (booking_id, user_id, action, previous_status, new_status, metadata)
        VALUES (
          ${booking.id}, 'system', 'auto_expired', 'pending', 'expired',
          ${JSON.stringify({ reason: '24h expiry' })}
        )
      `;

      await sendNotification({
        userId: booking.client_id,
        type: "booking_expired",
        title: "Booking Request Expired",
        message: `Your booking request for ${booking.start_datetime.toLocaleDateString()} has expired`,
        data: { bookingId: booking.id },
      });

      await sendNotification({
        userId: booking.freelancer_id,
        type: "booking_expired",
        title: "Booking Request Expired",
        message: `A booking request for ${booking.start_datetime.toLocaleDateString()} has expired`,
        data: { bookingId: booking.id },
      });
    }

    return { expired: expiredBookings.length };
  }
);

const _ = new CronJob("expire-pending-bookings", {
  title: "Expire pending bookings after 24h",
  schedule: "*/15 * * * *",
  endpoint: expirePending,
});
