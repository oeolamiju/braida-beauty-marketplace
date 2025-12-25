import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { APIError } from "encore.dev/api";
import { DisputeBookingTimeline, DisputeWithDetails, DisputeAttachment, DisputeNote } from "./types";
import { requireAdmin } from "../admin/middleware";

export interface AdminGetDisputeRequest {
  dispute_id: string;
}

export interface AdminGetDisputeResponse {
  timeline: DisputeBookingTimeline;
  audit_logs: Array<{
    id: string;
    action: string;
    performed_by: string;
    performed_by_name: string;
    details: Record<string, any>;
    created_at: Date;
  }>;
}

export const adminGet = api(
  { method: "GET", path: "/admin/disputes/:dispute_id", auth: true, expose: true },
  async (req: AdminGetDisputeRequest): Promise<AdminGetDisputeResponse> => {
    await requireAdmin();
    const auth = getAuthData()!;

    const dispute = await db.rawQueryRow<DisputeWithDetails>(
      `SELECT 
        d.*,
        CONCAT(u.first_name, ' ', u.last_name) as raised_by_name,
        u.email as raised_by_email,
        CONCAT(ra.first_name, ' ', ra.last_name) as resolved_by_name
       FROM disputes d
       JOIN users u ON d.raised_by = u.id
       LEFT JOIN users ra ON d.resolved_by = ra.id
       WHERE d.id = $1`,
      req.dispute_id
    );

    if (!dispute) {
      throw APIError.notFound("Dispute not found");
    }

    const booking = await db.rawQueryRow<{
      id: string;
      client_id: string;
      freelancer_id: string;
      service_id: string;
      scheduled_start: Date;
      scheduled_end: Date;
      status: string;
      payment_status?: string;
      total_amount: number;
    }>(
      `SELECT 
        b.id,
        b.client_id,
        b.freelancer_id,
        b.service_id,
        b.scheduled_start,
        b.scheduled_end,
        b.status,
        b.payment_status,
        b.total_amount
       FROM bookings b
       WHERE b.id = $1`,
      dispute.booking_id
    );

    if (!booking) {
      throw APIError.notFound("Booking not found");
    }

    const client = await db.rawQueryRow<{ name: string }>(
      `SELECT CONCAT(first_name, ' ', last_name) as name FROM users WHERE id = $1`,
      booking.client_id
    );

    const freelancer = await db.rawQueryRow<{ name: string }>(
      `SELECT CONCAT(first_name, ' ', last_name) as name FROM users WHERE id = $1`,
      booking.freelancer_id
    );

    const service = await db.rawQueryRow<{ name: string }>(
      `SELECT title as name FROM services WHERE id = $1`,
      booking.service_id
    );

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

    const auditLogsGen = db.rawQuery<{
      id: string;
      action: string;
      performed_by: string;
      performed_by_name: string;
      details: Record<string, any>;
      created_at: Date;
    }>(
      `SELECT 
        dal.id,
        dal.action,
        dal.performed_by,
        CONCAT(u.first_name, ' ', u.last_name) as performed_by_name,
        dal.details,
        dal.created_at
       FROM dispute_audit_logs dal
       LEFT JOIN users u ON dal.performed_by = u.id
       WHERE dal.dispute_id = $1
       ORDER BY dal.created_at DESC`,
      req.dispute_id
    );
    const auditLogs: Array<{
      id: string;
      action: string;
      performed_by: string;
      performed_by_name: string;
      details: Record<string, any>;
      created_at: Date;
    }> = [];
    for await (const log of auditLogsGen) {
      auditLogs.push(log);
    }

    dispute.attachments = attachments;
    dispute.notes = notes;

    const timeline: DisputeBookingTimeline = {
      booking_id: booking.id,
      client_name: client?.name || "Unknown",
      freelancer_name: freelancer?.name || "Unknown",
      service_name: service?.name || "Unknown",
      scheduled_start: booking.scheduled_start,
      scheduled_end: booking.scheduled_end,
      booking_status: booking.status,
      payment_status: booking.payment_status,
      total_amount: booking.total_amount,
      dispute,
    };

    return {
      timeline,
      audit_logs: auditLogs,
    };
  }
);
