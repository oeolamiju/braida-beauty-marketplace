import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { APIError } from "encore.dev/api";
import { Dispute } from "./types";

export interface ListDisputesByBookingRequest {
  booking_id: string;
}

export interface ListDisputesByBookingResponse {
  disputes: Dispute[];
}

export const listByBooking = api(
  { method: "GET", path: "/bookings/:booking_id/disputes", auth: true, expose: true },
  async (req: ListDisputesByBookingRequest): Promise<ListDisputesByBookingResponse> => {
    const auth = getAuthData()!;

    const booking = await db.rawQueryRow<{ client_id: string; freelancer_id: string }>(
      `SELECT client_id, freelancer_id FROM bookings WHERE id = $1`,
      req.booking_id
    );

    if (!booking) {
      throw APIError.notFound("Booking not found");
    }

    if (auth.userID !== booking.client_id && auth.userID !== booking.freelancer_id) {
      throw APIError.permissionDenied("Access denied");
    }

    const disputesGen = db.rawQuery<Dispute>(
      `SELECT * FROM disputes WHERE booking_id = $1 ORDER BY created_at DESC`,
      req.booking_id
    );
    const disputes: Dispute[] = [];
    for await (const dispute of disputesGen) {
      disputes.push(dispute);
    }

    return { disputes };
  }
);
