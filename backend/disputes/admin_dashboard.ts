import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { APIError } from "encore.dev/api";
import { DisputeStatus } from "./types";
import { sendNotification } from "../notifications/send";
import { requireAdmin } from "../admin/middleware";

export interface DisputeDashboardStats {
  total: number;
  new: number;
  inReview: number;
  resolved: number;
  averageResolutionHours: number;
}

export interface DisputeWithDetails {
  id: string;
  bookingId: string;
  category: string;
  description: string;
  status: DisputeStatus;
  raisedBy: string;
  raisedByName: string;
  raisedByRole: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  freelancerId: string;
  freelancerName: string;
  freelancerEmail: string;
  serviceTitle: string;
  bookingDate: string;
  bookingTotal: number;
  paymentStatus: string;
  escrowStatus: string;
  attachments: { id: string; url: string; filename: string }[];
  notes: { id: number; content: string; authorName: string; createdAt: string; isInternal: boolean }[];
  messages: { id: number; senderId: string; senderName: string; content: string; createdAt: string }[];
  resolution?: {
    type: string;
    refundAmount?: number;
    note: string;
    resolvedBy: string;
    resolvedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Get dispute dashboard statistics
export const getDashboardStats = api(
  { method: "GET", path: "/admin/disputes/stats", expose: true, auth: true },
  async (): Promise<DisputeDashboardStats> => {
    await requireAdmin();

    const stats = await db.queryRow<{
      total: number;
      new_count: number;
      in_review: number;
      resolved: number;
    }>`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'new') as new_count,
        COUNT(*) FILTER (WHERE status = 'in_review') as in_review,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved
      FROM disputes
    `;

    const avgResolution = await db.queryRow<{ avg_hours: number }>`
      SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600) as avg_hours
      FROM disputes
      WHERE resolved_at IS NOT NULL
    `;

    return {
      total: stats?.total || 0,
      new: stats?.new_count || 0,
      inReview: stats?.in_review || 0,
      resolved: stats?.resolved || 0,
      averageResolutionHours: Math.round(avgResolution?.avg_hours || 0),
    };
  }
);

// Get detailed dispute view for admin
export const getDisputeDetails = api(
  { method: "GET", path: "/admin/disputes/:id/details", expose: true, auth: true },
  async (req: { id: string }): Promise<DisputeWithDetails> => {
    await requireAdmin();

    const dispute = await db.queryRow<{
      id: string;
      booking_id: string;
      category: string;
      description: string;
      status: DisputeStatus;
      raised_by: string;
      raised_by_name: string;
      raised_by_role: string;
      client_id: string;
      client_name: string;
      client_email: string;
      freelancer_id: string;
      freelancer_name: string;
      freelancer_email: string;
      service_title: string;
      booking_date: Date;
      booking_total: number;
      payment_status: string;
      escrow_status: string;
      resolution_type: string | null;
      resolution_refund_amount: number | null;
      resolution_note: string | null;
      resolved_by: string | null;
      resolved_at: Date | null;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT 
        d.id,
        d.booking_id,
        d.category,
        d.description,
        d.status,
        d.raised_by,
        rb.name as raised_by_name,
        rb.role as raised_by_role,
        b.client_id,
        c.name as client_name,
        c.email as client_email,
        b.freelancer_id,
        f.name as freelancer_name,
        f.email as freelancer_email,
        s.title as service_title,
        b.start_datetime as booking_date,
        b.total_price_pence as booking_total,
        p.status as payment_status,
        p.escrow_status,
        d.resolution_type,
        d.resolution_refund_amount,
        d.resolution_note,
        d.resolved_by,
        d.resolved_at,
        d.created_at,
        d.updated_at
      FROM disputes d
      JOIN bookings b ON d.booking_id = b.id
      JOIN users rb ON d.raised_by = rb.id
      JOIN users c ON b.client_id = c.id
      JOIN users f ON b.freelancer_id = f.id
      JOIN services s ON b.service_id = s.id
      LEFT JOIN payments p ON b.id = p.booking_id
      WHERE d.id = ${req.id}
    `;

    if (!dispute) {
      throw APIError.notFound("Dispute not found");
    }

    // Get attachments
    const attachmentsGen = db.query<{
      id: string;
      url: string;
      filename: string;
    }>`
      SELECT id, attachment_url as url, original_filename as filename
      FROM dispute_attachments
      WHERE dispute_id = ${req.id}
      ORDER BY created_at
    `;

    const attachments: any[] = [];
    for await (const att of attachmentsGen) {
      attachments.push(att);
    }

    // Get admin notes
    const notesGen = db.query<{
      id: number;
      content: string;
      author_name: string;
      created_at: Date;
      is_internal: boolean;
    }>`
      SELECT dn.id, dn.note as content, u.name as author_name, dn.created_at, dn.is_internal
      FROM dispute_notes dn
      JOIN users u ON dn.author_id = u.id
      WHERE dn.dispute_id = ${req.id}
      ORDER BY dn.created_at
    `;

    const notes: any[] = [];
    for await (const note of notesGen) {
      notes.push({
        id: note.id,
        content: note.content,
        authorName: note.author_name,
        createdAt: note.created_at.toISOString(),
        isInternal: note.is_internal,
      });
    }

    // Get booking messages
    const messagesGen = db.query<{
      id: number;
      sender_id: string;
      sender_name: string;
      content: string;
      created_at: Date;
    }>`
      SELECT m.id, m.sender_id, u.name as sender_name, m.content, m.created_at
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.booking_id = ${dispute.booking_id}::integer
      ORDER BY m.created_at
    `;

    const messages: any[] = [];
    for await (const msg of messagesGen) {
      messages.push({
        id: msg.id,
        senderId: msg.sender_id,
        senderName: msg.sender_name,
        content: msg.content,
        createdAt: msg.created_at.toISOString(),
      });
    }

    return {
      id: dispute.id,
      bookingId: dispute.booking_id,
      category: dispute.category,
      description: dispute.description,
      status: dispute.status,
      raisedBy: dispute.raised_by,
      raisedByName: dispute.raised_by_name,
      raisedByRole: dispute.raised_by_role,
      clientId: dispute.client_id,
      clientName: dispute.client_name,
      clientEmail: dispute.client_email,
      freelancerId: dispute.freelancer_id,
      freelancerName: dispute.freelancer_name,
      freelancerEmail: dispute.freelancer_email,
      serviceTitle: dispute.service_title,
      bookingDate: dispute.booking_date.toISOString(),
      bookingTotal: dispute.booking_total,
      paymentStatus: dispute.payment_status || "unknown",
      escrowStatus: dispute.escrow_status || "unknown",
      attachments,
      notes,
      messages,
      resolution: dispute.resolution_type
        ? {
            type: dispute.resolution_type,
            refundAmount: dispute.resolution_refund_amount || undefined,
            note: dispute.resolution_note || "",
            resolvedBy: dispute.resolved_by || "",
            resolvedAt: dispute.resolved_at?.toISOString() || "",
          }
        : undefined,
      createdAt: dispute.created_at.toISOString(),
      updatedAt: dispute.updated_at.toISOString(),
    };
  }
);

