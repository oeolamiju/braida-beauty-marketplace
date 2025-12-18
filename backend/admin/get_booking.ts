import { api } from "encore.dev/api";
import { requireAdmin } from "./middleware";
import { BookingDetailAdminResponse } from "./types";
import db from "../db";

export interface GetBookingAdminRequest {
  bookingId: string;
}

export const getBooking = api(
  { method: "GET", path: "/admin/bookings/:bookingId", expose: true },
  async ({ bookingId }: GetBookingAdminRequest): Promise<BookingDetailAdminResponse> => {
    await requireAdmin();

    const booking = await db.queryRow<any>`
      SELECT 
        b.id,
        b.service_id,
        s.title as service_title,
        b.freelancer_id,
        uf.full_name as freelancer_name,
        b.client_id,
        uc.full_name as client_name,
        b.status,
        b.scheduled_for,
        b.total_price,
        b.address,
        b.notes,
        b.cancelled_at,
        b.cancellation_reason,
        b.confirmed_at,
        b.completed_at,
        b.created_at,
        p.status as payment_status
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users uf ON b.freelancer_id = uf.id
      JOIN users uc ON b.client_id = uc.id
      LEFT JOIN payments p ON b.id = p.booking_id
      WHERE b.id = ${bookingId}
    `;

    if (!booking) {
      throw new Error("Booking not found");
    }

    const bookingDetail = {
      id: booking.id,
      serviceId: booking.service_id,
      serviceTitle: booking.service_title,
      freelancerId: booking.freelancer_id,
      freelancerName: booking.freelancer_name,
      clientId: booking.client_id,
      clientName: booking.client_name,
      status: booking.status,
      scheduledFor: new Date(booking.scheduled_for),
      totalPrice: parseFloat(booking.total_price),
      paymentStatus: booking.payment_status || undefined,
      createdAt: new Date(booking.created_at),
      address: booking.address,
      notes: booking.notes || undefined,
      cancelledAt: booking.cancelled_at ? new Date(booking.cancelled_at) : undefined,
      cancellationReason: booking.cancellation_reason || undefined,
      confirmedAt: booking.confirmed_at ? new Date(booking.confirmed_at) : undefined,
      completedAt: booking.completed_at ? new Date(booking.completed_at) : undefined,
    };

    const paymentRow = await db.queryRow<any>`
      SELECT id, amount, status, escrow_release_at, refunded_amount
      FROM payments
      WHERE booking_id = ${bookingId}
    `;

    const payment = paymentRow ? {
      id: paymentRow.id,
      amount: parseFloat(paymentRow.amount),
      status: paymentRow.status,
      escrowReleaseAt: paymentRow.escrow_release_at ? new Date(paymentRow.escrow_release_at) : undefined,
      refundedAmount: paymentRow.refunded_amount ? parseFloat(paymentRow.refunded_amount) : undefined,
    } : undefined;

    const disputes = await db.queryAll<any>`
      SELECT id, reason, status, created_at
      FROM disputes
      WHERE booking_id = ${bookingId}
      ORDER BY created_at DESC
    `;

    const reviews = await db.queryAll<any>`
      SELECT id, rating, comment, created_at
      FROM reviews
      WHERE booking_id = ${bookingId}
      ORDER BY created_at DESC
    `;

    return {
      booking: bookingDetail,
      payment,
      disputes,
      reviews,
    };
  }
);
