import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { DisputeCategory } from "./types";
import { APIError } from "encore.dev/api";
import { sendNotification } from "../notifications/send";
import { trackEvent } from "../analytics/track";

export interface CreateDisputeRequest {
  booking_id: string;
  category: DisputeCategory;
  description: string;
}

export interface CreateDisputeResponse {
  dispute_id: string;
}

async function logAudit(
  dispute_id: string,
  action: string,
  performed_by: string,
  details: Record<string, any>
) {
  await db.rawExec(
    `INSERT INTO dispute_audit_logs (dispute_id, action, performed_by, details)
     VALUES ($1, $2, $3, $4)`,
    dispute_id, action, performed_by, JSON.stringify(details)
  );
}

export const create = api(
  { method: "POST", path: "/disputes", auth: true, expose: true },
  async (req: CreateDisputeRequest): Promise<CreateDisputeResponse> => {
    const auth = getAuthData()!;

    const bookingResult = await db.rawQueryRow<{
      id: string;
      client_id: string;
      freelancer_id: string;
      status: string;
      scheduled_end: Date;
      service_id: string;
    }>(
      `SELECT b.id, b.client_id, b.freelancer_id, b.status, b.scheduled_end, b.service_id
       FROM bookings b
       WHERE b.id = $1`,
      req.booking_id
    );

    if (!bookingResult) {
      throw APIError.notFound("Booking not found");
    }

    if (bookingResult.client_id !== auth.userID) {
      throw APIError.permissionDenied("Only the client can raise a dispute");
    }

    if (bookingResult.status !== "confirmed" && bookingResult.status !== "completed") {
      throw APIError.invalidArgument("Disputes can only be raised for confirmed or completed bookings");
    }

    const existingDispute = await db.rawQueryRow(
      `SELECT id FROM disputes WHERE booking_id = $1`,
      req.booking_id
    );

    if (existingDispute) {
      throw APIError.invalidArgument("A dispute already exists for this booking");
    }

    const settingsResult = await db.queryRow<{ dispute_window_hours: number }>`
      SELECT dispute_window_hours FROM payment_settings LIMIT 1
    `;
    const disputeWindowHours = settingsResult?.dispute_window_hours || 48;

    const now = new Date();
    const scheduledEnd = new Date(bookingResult.scheduled_end);
    const windowEnd = new Date(scheduledEnd.getTime() + disputeWindowHours * 60 * 60 * 1000);

    if (now > windowEnd) {
      throw APIError.invalidArgument(
        `Disputes must be raised within ${disputeWindowHours} hours of scheduled end time`
      );
    }

    const result = await db.rawQueryRow<{ id: string }>(
      `INSERT INTO disputes (booking_id, raised_by, category, description, status)
       VALUES ($1, $2, $3, $4, 'new')
       RETURNING id`,
      req.booking_id, auth.userID, req.category, req.description
    );

    const disputeId = result!.id;

    await logAudit(disputeId, "dispute_created", auth.userID, {
      category: req.category,
      description: req.description,
    });

    await sendNotification({
      userId: bookingResult.freelancer_id,
      type: "dispute_raised",
      title: "Dispute Raised on Booking",
      message: `A dispute has been raised for your booking (${req.category})`,
      data: {
        booking_id: req.booking_id,
        dispute_id: disputeId,
        service_id: bookingResult.service_id,
      },
    });

    const adminsGen = db.rawQuery<{ id: string }>(
      `SELECT id FROM users WHERE role = 'admin'`
    );

    for await (const admin of adminsGen) {
      await sendNotification({
        userId: admin.id,
        type: "dispute_needs_review",
        title: "New Dispute Requires Review",
        message: `A new dispute has been raised for booking ${req.booking_id}`,
        data: {
          booking_id: req.booking_id,
          dispute_id: disputeId,
        },
      });
    }

    await trackEvent(auth.userID, "dispute_opened", {
      bookingId: req.booking_id,
      category: req.category,
    });

    return { dispute_id: disputeId };
  }
);
