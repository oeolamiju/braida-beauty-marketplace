import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import db from "../db";
import { sendNotification } from "../notifications/send";
import { calculateRefund } from "../policies/policy_service";

export interface RespondRescheduleRequest {
  rescheduleRequestId: number;
  accept: boolean;
  note?: string;
}

export interface RespondRescheduleResponse {
  message: string;
  refundOffered?: {
    refundPercentage: number;
    refundAmount: number;
  };
}

export const respondReschedule = api<RespondRescheduleRequest, RespondRescheduleResponse>(
  { auth: true, expose: true, method: "POST", path: "/bookings/reschedule/:rescheduleRequestId/respond" },
  async (req) => {
    const auth = getAuthData()! as AuthData;

    const rescheduleRequest = await db.queryRow<{
      id: number;
      booking_id: number;
      requested_by: string;
      new_start_time: Date;
      new_end_time: Date;
      status: string;
    }>`
      SELECT id, booking_id, requested_by, new_start_time, new_end_time, status
      FROM reschedule_requests
      WHERE id = ${req.rescheduleRequestId}
    `;

    if (!rescheduleRequest) {
      throw APIError.notFound("reschedule request not found");
    }

    if (rescheduleRequest.status !== "pending") {
      throw APIError.invalidArgument("this reschedule request has already been responded to");
    }

    const booking = await db.queryRow<{
      id: number;
      freelancer_id: string;
      client_id: string;
      status: string;
      start_datetime: Date;
      price: string;
    }>`
      SELECT id, freelancer_id, client_id, status, start_datetime, price
      FROM bookings
      WHERE id = ${rescheduleRequest.booking_id}
    `;

    if (!booking) {
      throw APIError.notFound("booking not found");
    }

    const responderId = booking.freelancer_id === rescheduleRequest.requested_by 
      ? booking.client_id 
      : booking.freelancer_id;

    if (responderId !== auth.userID) {
      throw APIError.permissionDenied("you can only respond to reschedule requests for your own bookings");
    }

    const newStatus = req.accept ? "accepted" : "rejected";

    await db.exec`
      UPDATE reschedule_requests
      SET status = ${newStatus},
          responded_at = NOW(),
          responded_by = ${auth.userID},
          response_note = ${req.note || null},
          updated_at = NOW()
      WHERE id = ${req.rescheduleRequestId}
    `;

    let refundOffered: { refundPercentage: number; refundAmount: number } | undefined;

    if (req.accept) {
      await db.exec`
        UPDATE bookings
        SET start_datetime = ${rescheduleRequest.new_start_time},
            end_datetime = ${rescheduleRequest.new_end_time},
            updated_at = NOW()
        WHERE id = ${rescheduleRequest.booking_id}
      `;

      await db.exec`
        INSERT INTO booking_audit_logs (booking_id, user_id, action, previous_status, new_status)
        VALUES (${rescheduleRequest.booking_id}, ${auth.userID}, 'rescheduled', ${booking.status}, ${booking.status})
      `;

      await sendNotification({
        userId: rescheduleRequest.requested_by,
        type: "booking_rescheduled",
        title: "Reschedule Accepted",
        message: `Your reschedule request has been accepted. New time: ${rescheduleRequest.new_start_time.toLocaleString()}`,
        data: { 
          bookingId: rescheduleRequest.booking_id,
          rescheduleRequestId: req.rescheduleRequestId
        },
      });
    } else {
      const hoursBeforeService = Math.floor(
        (booking.start_datetime.getTime() - new Date().getTime()) / (1000 * 60 * 60)
      );

      if (hoursBeforeService >= 24) {
        const bookingAmount = parseFloat(booking.price);
        const refundCalc = await calculateRefund(
          bookingAmount,
          booking.start_datetime,
          new Date(),
          'client'
        );

        refundOffered = {
          refundPercentage: refundCalc.refundPercentage,
          refundAmount: refundCalc.refundAmount
        };
      }

      await sendNotification({
        userId: rescheduleRequest.requested_by,
        type: "booking_reschedule_rejected",
        title: "Reschedule Declined",
        message: req.note 
          ? `Your reschedule request has been declined. Reason: ${req.note}`
          : "Your reschedule request has been declined",
        data: { 
          bookingId: rescheduleRequest.booking_id,
          rescheduleRequestId: req.rescheduleRequestId,
          refundOffered
        },
      });
    }

    return {
      message: req.accept 
        ? "Reschedule request accepted. Booking has been updated."
        : "Reschedule request declined",
      refundOffered
    };
  }
);
