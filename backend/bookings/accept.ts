import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import { requireVerifiedFreelancer } from "../auth/middleware";
import db from "../db";
import { sendNotification } from "../notifications/send";
import { getBookingAcceptedEmail } from "../notifications/email_service";
import { logBookingEvent } from "../shared/logger";

export interface AcceptBookingRequest {
  id: number;
}

export interface AcceptBookingResponse {
  message: string;
}

export const accept = api<AcceptBookingRequest, AcceptBookingResponse>(
  { auth: true, expose: true, method: "POST", path: "/bookings/:id/accept" },
  async (req) => {
    requireVerifiedFreelancer();

    const auth = getAuthData()! as AuthData;

    const booking = await db.queryRow<{
      id: number;
      freelancer_id: string;
      client_id: string;
      status: string;
      start_datetime: Date;
    }>`
      SELECT id, freelancer_id, client_id, status, start_datetime
      FROM bookings
      WHERE id = ${req.id}
    `;

    if (!booking) {
      throw APIError.notFound("booking not found");
    }

    if (booking.freelancer_id !== auth.userID) {
      throw APIError.permissionDenied("you can only accept your own bookings");
    }

    if (booking.status !== "pending") {
      throw APIError.invalidArgument("booking is not in pending status");
    }

    await db.exec`
      UPDATE bookings
      SET status = 'confirmed', updated_at = NOW(), expires_at = NULL
      WHERE id = ${req.id}
    `;

    await db.exec`
      INSERT INTO booking_audit_logs (booking_id, user_id, action, previous_status, new_status)
      VALUES (${req.id}, ${auth.userID}, 'accepted', 'pending', 'confirmed')
    `;

    logBookingEvent("accepted", req.id, {
      freelancerId: auth.userID,
      clientId: booking.client_id,
      status: "confirmed",
    });

    const serviceDetails = await db.queryRow<{ name: string }>`
      SELECT s.name
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.id = ${req.id}
    `;

    const freelancerUser = await db.queryRow<{ name: string }>`
      SELECT CONCAT(first_name, ' ', last_name) as name FROM users WHERE id = ${booking.freelancer_id}
    `;

    const clientUser = await db.queryRow<{ name: string; email: string }>`
      SELECT CONCAT(first_name, ' ', last_name) as name, email FROM users WHERE id = ${booking.client_id}
    `;

    if (freelancerUser && clientUser && serviceDetails) {
      await sendNotification({
        userId: booking.client_id,
        type: "booking_confirmed",
        title: "Booking Confirmed",
        message: `Your booking for ${booking.start_datetime.toLocaleDateString()} has been confirmed`,
        data: { bookingId: req.id },
        emailHtml: getBookingAcceptedEmail(
          clientUser.name,
          freelancerUser.name,
          serviceDetails.name,
          booking.start_datetime,
          req.id
        ),
      });
    }

    return {
      message: "Booking accepted successfully",
    };
  }
);
