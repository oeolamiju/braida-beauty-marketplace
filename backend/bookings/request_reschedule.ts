import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import db from "../db";
import { sendNotification } from "../notifications/send";

export interface RequestRescheduleRequest {
  bookingId: number;
  newStartTime: Date;
  newEndTime: Date;
}

export interface RequestRescheduleResponse {
  rescheduleRequestId: number;
  message: string;
}

export const requestReschedule = api<RequestRescheduleRequest, RequestRescheduleResponse>(
  { auth: true, expose: true, method: "POST", path: "/bookings/:bookingId/reschedule/request" },
  async (req) => {
    const auth = getAuthData()! as AuthData;

    const booking = await db.queryRow<{
      id: number;
      freelancer_id: string;
      client_id: string;
      status: string;
      start_datetime: Date;
      end_datetime: Date;
    }>`
      SELECT id, freelancer_id, client_id, status, start_datetime, end_datetime
      FROM bookings
      WHERE id = ${req.bookingId}
    `;

    if (!booking) {
      throw APIError.notFound("booking not found");
    }

    if (booking.freelancer_id !== auth.userID && booking.client_id !== auth.userID) {
      throw APIError.permissionDenied("you can only reschedule your own bookings");
    }

    if (booking.status !== "confirmed" && booking.status !== "pending") {
      throw APIError.invalidArgument("only confirmed or pending bookings can be rescheduled");
    }

    const existingRequest = await db.queryRow<{ id: number }>`
      SELECT id
      FROM reschedule_requests
      WHERE booking_id = ${req.bookingId}
        AND status = 'pending'
    `;

    if (existingRequest) {
      throw APIError.invalidArgument("a pending reschedule request already exists for this booking");
    }

    if (req.newStartTime >= req.newEndTime) {
      throw APIError.invalidArgument("end time must be after start time");
    }

    if (req.newStartTime < new Date()) {
      throw APIError.invalidArgument("cannot reschedule to a past time");
    }

    const result = await db.queryRow<{ id: number }>`
      INSERT INTO reschedule_requests (
        booking_id,
        requested_by,
        new_start_time,
        new_end_time,
        status
      ) VALUES (
        ${req.bookingId},
        ${auth.userID},
        ${req.newStartTime},
        ${req.newEndTime},
        'pending'
      )
      RETURNING id
    `;

    const rescheduleRequestId = result!.id;

    const notifyUserId = booking.client_id === auth.userID 
      ? booking.freelancer_id 
      : booking.client_id;

    const requestedBy = booking.client_id === auth.userID ? 'client' : 'freelancer';

    await sendNotification({
      userId: notifyUserId,
      type: "booking_reschedule_requested",
      title: "Reschedule Request",
      message: `The ${requestedBy} has requested to reschedule your booking from ${booking.start_datetime.toLocaleString()} to ${req.newStartTime.toLocaleString()}`,
      data: { 
        bookingId: req.bookingId,
        rescheduleRequestId
      },
    });

    return {
      rescheduleRequestId,
      message: "Reschedule request sent successfully"
    };
  }
);
