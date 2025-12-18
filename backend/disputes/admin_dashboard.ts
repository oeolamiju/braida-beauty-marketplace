import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { APIError } from "encore.dev/api";
import { DisputeStatus } from "./types";
import { sendNotification } from "../notifications/send";

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
    const auth = getAuthData()!;

    const userRole = await db.rawQueryRow<{ role: string }>(
      `SELECT role FROM users WHERE id = $1`,
      auth.userID
    );

    if (userRole?.role !== "admin") {
      throw APIError.permissionDenied("Admin access required");
    }

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
    const auth = getAuthData()!;

    const userRole = await db.rawQueryRow<{ role: string }>(
      `SELECT role FROM users WHERE id = $1`,
      auth.userID
    );

    if (userRole?.role !== "admin") {
      throw APIError.permissionDenied("Admin access required");
    }

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

export interface ResolveDisputeRequest {
  id: string;
  resolution: "full_refund" | "partial_refund" | "release_to_freelancer" | "split" | "no_action";
  refundAmountPence?: number;
  note: string;
}

// Resolve a dispute with detailed resolution
export const resolveDispute = api(
  { method: "POST", path: "/admin/disputes/:id/resolve", expose: true, auth: true },
  async (req: ResolveDisputeRequest): Promise<{ success: boolean; message: string }> => {
    const auth = getAuthData()!;

    const userRole = await db.rawQueryRow<{ role: string }>(
      `SELECT role FROM users WHERE id = $1`,
      auth.userID
    );

    if (userRole?.role !== "admin") {
      throw APIError.permissionDenied("Admin access required");
    }

    const dispute = await db.queryRow<{
      id: string;
      booking_id: string;
      status: string;
      raised_by: string;
    }>`
      SELECT id, booking_id, status, raised_by FROM disputes WHERE id = ${req.id}
    `;

    if (!dispute) {
      throw APIError.notFound("Dispute not found");
    }

    if (dispute.status === "resolved") {
      throw APIError.failedPrecondition("Dispute is already resolved");
    }

    // Get booking and payment details
    const booking = await db.queryRow<{
      client_id: string;
      freelancer_id: string;
      total_price_pence: number;
    }>`
      SELECT client_id, freelancer_id, total_price_pence
      FROM bookings
      WHERE id = ${parseInt(dispute.booking_id)}
    `;

    if (!booking) {
      throw APIError.notFound("Booking not found");
    }

    const payment = await db.queryRow<{
      id: number;
      amount_pence: number;
      escrow_status: string;
    }>`
      SELECT id, amount_pence, escrow_status
      FROM payments
      WHERE booking_id = ${parseInt(dispute.booking_id)}
    `;

    // Handle resolution based on type
    let refundAmount = 0;
    let freelancerPayout = 0;

    switch (req.resolution) {
      case "full_refund":
        refundAmount = payment?.amount_pence || booking.total_price_pence;
        // In real implementation, trigger Stripe refund
        break;
      case "partial_refund":
        if (!req.refundAmountPence) {
          throw APIError.invalidArgument("Refund amount required for partial refund");
        }
        refundAmount = req.refundAmountPence;
        freelancerPayout = (payment?.amount_pence || booking.total_price_pence) - refundAmount;
        break;
      case "release_to_freelancer":
        freelancerPayout = payment?.amount_pence || booking.total_price_pence;
        break;
      case "split":
        const totalAmount = payment?.amount_pence || booking.total_price_pence;
        refundAmount = Math.floor(totalAmount / 2);
        freelancerPayout = totalAmount - refundAmount;
        break;
      case "no_action":
        // No financial action
        break;
    }

    // Update dispute
    await db.exec`
      UPDATE disputes
      SET 
        status = 'resolved',
        resolution_type = ${req.resolution},
        resolution_refund_amount = ${refundAmount > 0 ? refundAmount : null},
        resolution_note = ${req.note},
        resolved_by = ${auth.userID},
        resolved_at = NOW(),
        updated_at = NOW()
      WHERE id = ${req.id}
    `;

    // Update payment if applicable
    if (payment && (refundAmount > 0 || freelancerPayout > 0)) {
      await db.exec`
        UPDATE payments
        SET 
          escrow_status = 'released',
          escrow_released_at = NOW(),
          refund_amount_pence = ${refundAmount > 0 ? refundAmount : null},
          freelancer_payout_pence = ${freelancerPayout > 0 ? freelancerPayout : null}
        WHERE id = ${payment.id}
      `;
    }

    // Update booking status
    await db.exec`
      UPDATE bookings
      SET status = 'disputed_resolved', updated_at = NOW()
      WHERE id = ${parseInt(dispute.booking_id)}
    `;

    // Log the resolution
    await db.exec`
      INSERT INTO dispute_notes (dispute_id, author_id, note, is_internal)
      VALUES (${req.id}, ${auth.userID}, ${`Resolution: ${req.resolution}. ${req.note}`}, false)
    `;

    // Notify both parties
    const resolutionMessages: Record<string, string> = {
      full_refund: "A full refund has been issued.",
      partial_refund: `A partial refund of £${(refundAmount / 100).toFixed(2)} has been issued.`,
      release_to_freelancer: "Payment has been released to the freelancer.",
      split: "The payment has been split between both parties.",
      no_action: "The dispute has been closed with no financial action.",
    };

    await sendNotification({
      userId: booking.client_id,
      type: "dispute_resolved",
      title: "Dispute Resolved",
      message: `Your dispute has been resolved. ${resolutionMessages[req.resolution]}`,
      data: { disputeId: req.id, resolution: req.resolution },
    });

    await sendNotification({
      userId: booking.freelancer_id,
      type: "dispute_resolved",
      title: "Dispute Resolved",
      message: `A dispute has been resolved. ${resolutionMessages[req.resolution]}`,
      data: { disputeId: req.id, resolution: req.resolution },
    });

    return {
      success: true,
      message: `Dispute resolved with ${req.resolution.replace("_", " ")}`,
    };
  }
);

// Add internal admin note
export const addInternalNote = api(
  { method: "POST", path: "/admin/disputes/:id/notes", expose: true, auth: true },
  async (req: { id: string; note: string; isInternal: boolean }): Promise<{ id: number }> => {
    const auth = getAuthData()!;

    const userRole = await db.rawQueryRow<{ role: string }>(
      `SELECT role FROM users WHERE id = $1`,
      auth.userID
    );

    if (userRole?.role !== "admin") {
      throw APIError.permissionDenied("Admin access required");
    }

    const result = await db.queryRow<{ id: number }>`
      INSERT INTO dispute_notes (dispute_id, author_id, note, is_internal)
      VALUES (${req.id}, ${auth.userID}, ${req.note}, ${req.isInternal})
      RETURNING id
    `;

    return { id: result!.id };
  }
);

