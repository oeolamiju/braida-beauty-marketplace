import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { APIError } from "encore.dev/api";
import { sendNotification } from "../notifications/send";

export interface RescheduleRequest {
  bookingId: number;
  newStartDatetime: string;
  reason?: string;
}

export interface RescheduleResponse {
  id: number;
  status: string;
  newStartDatetime: string;
  newEndDatetime: string;
  message: string;
}

export interface RespondToRescheduleRequest {
  rescheduleRequestId: number;
  action: "accept" | "decline" | "suggest_alternative";
  alternativeDatetime?: string;
  message?: string;
}

// Request to reschedule a booking
export const requestReschedule = api<RescheduleRequest, RescheduleResponse>(
  { method: "POST", path: "/bookings/:bookingId/reschedule", expose: true, auth: true },
  async (req): Promise<RescheduleResponse> => {
    const auth = getAuthData()!;

    const booking = await db.queryRow<{
      id: number;
      client_id: string;
      freelancer_id: string;
      service_id: number;
      start_datetime: Date;
      end_datetime: Date;
      status: string;
    }>`
      SELECT id, client_id, freelancer_id, service_id, start_datetime, end_datetime, status
      FROM bookings
      WHERE id = ${req.bookingId}
    `;

    if (!booking) {
      throw APIError.notFound("Booking not found");
    }

    const isClient = booking.client_id === auth.userID;
    const isFreelancer = booking.freelancer_id === auth.userID;

    if (!isClient && !isFreelancer) {
      throw APIError.permissionDenied("You can only reschedule your own bookings");
    }

    if (!["pending", "confirmed"].includes(booking.status)) {
      throw APIError.failedPrecondition("Cannot reschedule a booking in this status");
    }

    // Check if within reschedule window (24 hours before)
    const hoursUntilBooking = (booking.start_datetime.getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntilBooking < 24) {
      throw APIError.failedPrecondition(
        "Cannot reschedule within 24 hours of the appointment"
      );
    }

    // Calculate new end datetime
    const durationMs = booking.end_datetime.getTime() - booking.start_datetime.getTime();
    const newStartDatetime = new Date(req.newStartDatetime);
    const newEndDatetime = new Date(newStartDatetime.getTime() + durationMs);

    // Check availability
    const conflictingBooking = await db.queryRow<{ id: number }>`
      SELECT id FROM bookings
      WHERE freelancer_id = ${booking.freelancer_id}
        AND id != ${req.bookingId}
        AND status IN ('pending', 'confirmed')
        AND (
          (start_datetime <= ${newStartDatetime} AND end_datetime > ${newStartDatetime})
          OR (start_datetime < ${newEndDatetime} AND end_datetime >= ${newEndDatetime})
          OR (start_datetime >= ${newStartDatetime} AND end_datetime <= ${newEndDatetime})
        )
    `;

    if (conflictingBooking) {
      throw APIError.failedPrecondition("The requested time slot is not available");
    }

    // Create reschedule request
    const rescheduleRequest = await db.queryRow<{ id: number }>`
      INSERT INTO reschedule_requests (
        booking_id,
        requested_by,
        original_start_datetime,
        original_end_datetime,
        proposed_start_datetime,
        proposed_end_datetime,
        reason,
        status
      ) VALUES (
        ${req.bookingId},
        ${auth.userID},
        ${booking.start_datetime},
        ${booking.end_datetime},
        ${newStartDatetime},
        ${newEndDatetime},
        ${req.reason || null},
        'pending'
      )
      RETURNING id
    `;

    // Notify the other party
    const notifyUserId = isClient ? booking.freelancer_id : booking.client_id;
    await sendNotification({
      userId: notifyUserId,
      type: "reschedule_request",
      title: "Reschedule Request",
      message: `A reschedule has been requested for booking #${req.bookingId}`,
      data: {
        bookingId: req.bookingId,
        rescheduleRequestId: rescheduleRequest!.id,
        newStartDatetime: newStartDatetime.toISOString(),
      },
    });

    // Log action
    await db.exec`
      INSERT INTO booking_audit_log (booking_id, action, previous_status, new_status, user_id)
      VALUES (${req.bookingId}, 'reschedule_requested', ${booking.status}, ${booking.status}, ${auth.userID})
    `;

    return {
      id: rescheduleRequest!.id,
      status: "pending",
      newStartDatetime: newStartDatetime.toISOString(),
      newEndDatetime: newEndDatetime.toISOString(),
      message: "Reschedule request sent. Waiting for response.",
    };
  }
);

// Respond to reschedule request
export const respondToReschedule = api<RespondToRescheduleRequest, { success: boolean; message: string }>(
  { method: "POST", path: "/bookings/reschedule/:rescheduleRequestId/respond", expose: true, auth: true },
  async (req): Promise<{ success: boolean; message: string }> => {
    const auth = getAuthData()!;

    const rescheduleRequest = await db.queryRow<{
      id: number;
      booking_id: number;
      requested_by: string;
      proposed_start_datetime: Date;
      proposed_end_datetime: Date;
      status: string;
    }>`
      SELECT id, booking_id, requested_by, proposed_start_datetime, proposed_end_datetime, status
      FROM reschedule_requests
      WHERE id = ${req.rescheduleRequestId}
    `;

    if (!rescheduleRequest) {
      throw APIError.notFound("Reschedule request not found");
    }

    if (rescheduleRequest.status !== "pending") {
      throw APIError.failedPrecondition("This reschedule request has already been processed");
    }

    const booking = await db.queryRow<{
      id: number;
      client_id: string;
      freelancer_id: string;
    }>`
      SELECT id, client_id, freelancer_id FROM bookings WHERE id = ${rescheduleRequest.booking_id}
    `;

    if (!booking) {
      throw APIError.notFound("Booking not found");
    }

    // Only the other party can respond
    const isClient = booking.client_id === auth.userID;
    const isFreelancer = booking.freelancer_id === auth.userID;

    if (rescheduleRequest.requested_by === auth.userID) {
      throw APIError.permissionDenied("You cannot respond to your own reschedule request");
    }

    if (!isClient && !isFreelancer) {
      throw APIError.permissionDenied("You are not authorized to respond to this request");
    }

    if (req.action === "accept") {
      // Update the booking
      await db.exec`
        UPDATE bookings
        SET 
          start_datetime = ${rescheduleRequest.proposed_start_datetime},
          end_datetime = ${rescheduleRequest.proposed_end_datetime},
          updated_at = NOW()
        WHERE id = ${rescheduleRequest.booking_id}
      `;

      await db.exec`
        UPDATE reschedule_requests
        SET status = 'accepted', responded_at = NOW(), responded_by = ${auth.userID}
        WHERE id = ${req.rescheduleRequestId}
      `;

      // Notify requester
      await sendNotification({
        userId: rescheduleRequest.requested_by,
        type: "reschedule_accepted",
        title: "Reschedule Accepted",
        message: `Your reschedule request for booking #${rescheduleRequest.booking_id} has been accepted`,
        data: {
          bookingId: rescheduleRequest.booking_id,
          newStartDatetime: rescheduleRequest.proposed_start_datetime.toISOString(),
        },
      });

      await db.exec`
        INSERT INTO booking_audit_log (booking_id, action, user_id, notes)
        VALUES (${rescheduleRequest.booking_id}, 'rescheduled', ${auth.userID}, 'Reschedule accepted')
      `;

      return { success: true, message: "Reschedule accepted. Booking updated." };
    } else if (req.action === "decline") {
      await db.exec`
        UPDATE reschedule_requests
        SET status = 'declined', responded_at = NOW(), responded_by = ${auth.userID}, response_message = ${req.message || null}
        WHERE id = ${req.rescheduleRequestId}
      `;

      await sendNotification({
        userId: rescheduleRequest.requested_by,
        type: "reschedule_declined",
        title: "Reschedule Declined",
        message: `Your reschedule request for booking #${rescheduleRequest.booking_id} was declined${req.message ? `: ${req.message}` : ""}`,
        data: { bookingId: rescheduleRequest.booking_id },
      });

      return { success: true, message: "Reschedule declined." };
    } else if (req.action === "suggest_alternative") {
      if (!req.alternativeDatetime) {
        throw APIError.invalidArgument("Alternative datetime is required");
      }

      const altStart = new Date(req.alternativeDatetime);
      const duration =
        rescheduleRequest.proposed_end_datetime.getTime() -
        rescheduleRequest.proposed_start_datetime.getTime();
      const altEnd = new Date(altStart.getTime() + duration);

      await db.exec`
        UPDATE reschedule_requests
        SET 
          status = 'counter_proposed',
          responded_at = NOW(),
          responded_by = ${auth.userID},
          counter_proposed_start = ${altStart},
          counter_proposed_end = ${altEnd},
          response_message = ${req.message || null}
        WHERE id = ${req.rescheduleRequestId}
      `;

      await sendNotification({
        userId: rescheduleRequest.requested_by,
        type: "reschedule_alternative",
        title: "Alternative Time Suggested",
        message: `An alternative time has been suggested for booking #${rescheduleRequest.booking_id}`,
        data: {
          bookingId: rescheduleRequest.booking_id,
          alternativeDatetime: altStart.toISOString(),
          message: req.message,
        },
      });

      return { success: true, message: "Alternative time suggested." };
    }

    throw APIError.invalidArgument("Invalid action");
  }
);

// Get pending reschedule requests for a booking
export const getRescheduleRequests = api(
  { method: "GET", path: "/bookings/:bookingId/reschedule-requests", expose: true, auth: true },
  async (req: { bookingId: number }): Promise<{
    requests: {
      id: number;
      requestedBy: string;
      requestedByName: string;
      originalStartDatetime: string;
      proposedStartDatetime: string;
      reason: string | null;
      status: string;
      createdAt: string;
    }[];
  }> => {
    const auth = getAuthData()!;

    // Verify access
    const booking = await db.queryRow<{ client_id: string; freelancer_id: string }>`
      SELECT client_id, freelancer_id FROM bookings WHERE id = ${req.bookingId}
    `;

    if (!booking) {
      throw APIError.notFound("Booking not found");
    }

    if (booking.client_id !== auth.userID && booking.freelancer_id !== auth.userID) {
      throw APIError.permissionDenied("Access denied");
    }

    const requestsGen = db.query<{
      id: number;
      requested_by: string;
      requester_name: string;
      original_start_datetime: Date;
      proposed_start_datetime: Date;
      reason: string | null;
      status: string;
      created_at: Date;
    }>`
      SELECT 
        rr.id,
        rr.requested_by,
        u.name as requester_name,
        rr.original_start_datetime,
        rr.proposed_start_datetime,
        rr.reason,
        rr.status,
        rr.created_at
      FROM reschedule_requests rr
      JOIN users u ON rr.requested_by = u.id
      WHERE rr.booking_id = ${req.bookingId}
      ORDER BY rr.created_at DESC
    `;

    const requests: any[] = [];
    for await (const r of requestsGen) {
      requests.push({
        id: r.id,
        requestedBy: r.requested_by,
        requestedByName: r.requester_name,
        originalStartDatetime: r.original_start_datetime.toISOString(),
        proposedStartDatetime: r.proposed_start_datetime.toISOString(),
        reason: r.reason,
        status: r.status,
        createdAt: r.created_at.toISOString(),
      });
    }

    return { requests };
  }
);

