import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { APIError } from "encore.dev/api";
import { DisputeWithDetails, DisputeAttachment, DisputeNote } from "./types";

export interface GetDisputeRequest {
  dispute_id: string;
}

export interface GetDisputeResponse {
  dispute: DisputeWithDetails;
}

export const get = api(
  { method: "GET", path: "/disputes/:dispute_id", auth: true, expose: true },
  async (req: GetDisputeRequest): Promise<GetDisputeResponse> => {
    const auth = getAuthData()!;

    const dispute = await db.rawQueryRow<DisputeWithDetails>(
      `SELECT 
        d.*,
        u.name as raised_by_name,
        u.email as raised_by_email,
        ra.name as resolved_by_name
       FROM disputes d
       JOIN users u ON d.raised_by = u.id
       LEFT JOIN users ra ON d.resolved_by = ra.id
       WHERE d.id = $1`,
      req.dispute_id
    );

    if (!dispute) {
      throw APIError.notFound("Dispute not found");
    }

    const booking = await db.rawQueryRow<{ client_id: string; freelancer_id: string }>(
      `SELECT client_id, freelancer_id FROM bookings WHERE id = $1`,
      dispute.booking_id
    );

    const userRole = await db.rawQueryRow<{ role: string }>(
      `SELECT role FROM users WHERE id = $1`,
      auth.userID
    );

    if (
      userRole?.role !== "admin" &&
      auth.userID !== booking?.client_id &&
      auth.userID !== booking?.freelancer_id
    ) {
      throw APIError.permissionDenied("Access denied");
    }

    const attachmentsGen = db.rawQuery<DisputeAttachment>(
      `SELECT * FROM dispute_attachments WHERE dispute_id = $1 ORDER BY uploaded_at DESC`,
      req.dispute_id
    );
    const attachments: DisputeAttachment[] = [];
    for await (const att of attachmentsGen) {
      attachments.push(att);
    }

    const notesGen = db.rawQuery<DisputeNote>(
      `SELECT * FROM dispute_notes WHERE dispute_id = $1 ORDER BY created_at ASC`,
      req.dispute_id
    );
    const notes: DisputeNote[] = [];
    for await (const note of notesGen) {
      notes.push(note);
    }

    dispute.attachments = attachments;
    dispute.notes = notes;

    return { dispute };
  }
);
