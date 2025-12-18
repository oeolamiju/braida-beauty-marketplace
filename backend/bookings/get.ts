import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import db from "../db";
import { calculateRefund, getCancellationPolicies } from "../policies/policy_service";

export interface GetBookingRequest {
  id: number;
}

export interface BookingDetail {
  id: number;
  clientId: string;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  freelancerId: string;
  freelancerName: string;
  freelancerEmail: string | null;
  freelancerPhone: string | null;
  freelancerArea: string;
  serviceId: number;
  serviceTitle: string;
  startDatetime: string;
  endDatetime: string;
  locationType: string;
  clientAddress: {
    line1: string | null;
    postcode: string | null;
    city: string | null;
  };
  notes: string | null;
  priceBasePence: number;
  priceMaterialsPence: number;
  priceTravelPence: number;
  totalPricePence: number;
  status: string;
  paymentStatus: string;
  declinedReason: string | null;
  expiresAt: string | null;
  completedAt: string | null;
  autoConfirmAt: string | null;
  createdAt: string;
  updatedAt: string;
  auditLog: {
    id: number;
    action: string;
    previousStatus: string | null;
    newStatus: string | null;
    userId: string;
    userName: string;
    createdAt: string;
  }[];
  cancellationInfo?: {
    cancelledBy: string | null;
    cancelledAt: string | null;
    cancellationReason: string | null;
    refundAmount: number | null;
    refundPercentage: number | null;
  };
  refundEstimate?: {
    refundPercentage: number;
    refundAmount: number;
    hoursBeforeService: number;
  };
  cancellationPolicies: {
    hoursThreshold: number;
    refundPercentage: number;
  }[];
  payment?: {
    id: number;
    status: string;
    escrowStatus: string;
    amountPence: number;
    platformFeePence: number;
    freelancerPayoutPence: number | null;
    refundId: string | null;
    refundAmountPence: number | null;
    createdAt: string;
    escrowReleasedAt: string | null;
  };
}

export const get = api<GetBookingRequest, BookingDetail>(
  { auth: true, expose: true, method: "GET", path: "/bookings/:id" },
  async (req) => {
    const auth = getAuthData()! as AuthData;

    const booking = await db.queryRow<{
      id: number;
      client_id: string;
      client_first_name: string;
      client_last_name: string;
      client_email: string;
      client_phone: string | null;
      freelancer_id: string;
      freelancer_name: string;
      freelancer_email: string;
      freelancer_phone: string | null;
      freelancer_area: string;
      service_id: number;
      service_title: string;
      start_datetime: Date;
      end_datetime: Date;
      location_type: string;
      client_address_line1: string | null;
      client_postcode: string | null;
      client_city: string | null;
      notes: string | null;
      price_base_pence: number;
      price_materials_pence: number;
      price_travel_pence: number;
      total_price_pence: number;
      status: string;
      payment_status: string;
      declined_reason: string | null;
      expires_at: Date | null;
      completed_at: Date | null;
      auto_confirm_at: Date | null;
      created_at: Date;
      updated_at: Date;
      cancelled_by: string | null;
      cancelled_at: Date | null;
      cancellation_reason: string | null;
      refund_amount: string | null;
      refund_percentage: number | null;
      price: string;
    }>`
      SELECT 
        b.id, b.client_id, cu.first_name as client_first_name, cu.last_name as client_last_name,
        cu.email as client_email, cu.phone as client_phone,
        b.freelancer_id, fp.display_name as freelancer_name, fu.email as freelancer_email,
        fu.phone as freelancer_phone, fp.location_area as freelancer_area,
        b.service_id, s.title as service_title,
        b.start_datetime, b.end_datetime, b.location_type,
        b.client_address_line1, b.client_postcode, b.client_city,
        b.notes, b.price_base_pence, b.price_materials_pence,
        b.price_travel_pence, b.total_price_pence, b.status, b.payment_status,
        b.declined_reason, b.expires_at, b.completed_at, b.auto_confirm_at, 
        b.created_at, b.updated_at,
        b.cancelled_by, b.cancelled_at, b.cancellation_reason,
        b.refund_amount, b.refund_percentage, b.price
      FROM bookings b
      JOIN users cu ON b.client_id = cu.id
      JOIN users fu ON b.freelancer_id = fu.id
      JOIN freelancer_profiles fp ON b.freelancer_id = fp.user_id
      JOIN services s ON b.service_id = s.id
      WHERE b.id = ${req.id}
    `;

    if (!booking) {
      throw APIError.notFound("booking not found");
    }

    if (booking.client_id !== auth.userID && booking.freelancer_id !== auth.userID && auth.role !== 'ADMIN') {
      throw APIError.permissionDenied("you can only view your own bookings");
    }

    const auditLogs = await db.queryAll<{
      id: number;
      action: string;
      previous_status: string | null;
      new_status: string | null;
      user_id: string;
      user_name: string;
      created_at: Date;
    }>`
      SELECT 
        bal.id, bal.action, bal.previous_status, bal.new_status,
        bal.user_id, u.first_name || ' ' || u.last_name as user_name,
        bal.created_at
      FROM booking_audit_logs bal
      JOIN users u ON bal.user_id = u.id
      WHERE bal.booking_id = ${req.id}
      ORDER BY bal.created_at ASC
    `;

    const isConfirmed = booking.status === 'confirmed';
    const isCurrentUser = (userId: string) => userId === auth.userID;

    const policies = await getCancellationPolicies();

    let refundEstimate: { refundPercentage: number; refundAmount: number; hoursBeforeService: number } | undefined;
    if (booking.status !== 'cancelled' && booking.status !== 'completed') {
      const bookingAmount = parseFloat(booking.price);
      const refundCalc = await calculateRefund(
        bookingAmount,
        booking.start_datetime,
        new Date(),
        booking.client_id === auth.userID ? 'client' : 'freelancer'
      );
      refundEstimate = {
        refundPercentage: refundCalc.refundPercentage,
        refundAmount: refundCalc.refundAmount,
        hoursBeforeService: refundCalc.hoursBeforeService
      };
    }

    const payment = await db.queryRow<{
      id: number;
      status: string;
      escrow_status: string;
      amount_pence: number;
      platform_fee_pence: number;
      freelancer_payout_pence: number | null;
      refund_id: string | null;
      refund_amount_pence: number | null;
      created_at: Date;
      escrow_released_at: Date | null;
    }>`
      SELECT id, status, escrow_status, amount_pence, platform_fee_pence,
             freelancer_payout_pence, refund_id, refund_amount_pence,
             created_at, escrow_released_at
      FROM payments
      WHERE booking_id = ${req.id}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    return {
      id: booking.id,
      clientId: booking.client_id,
      clientName: `${booking.client_first_name} ${booking.client_last_name}`,
      clientEmail: isConfirmed || isCurrentUser(booking.client_id) ? booking.client_email : null,
      clientPhone: isConfirmed || isCurrentUser(booking.client_id) ? booking.client_phone : null,
      freelancerId: booking.freelancer_id,
      freelancerName: booking.freelancer_name,
      freelancerEmail: isConfirmed || isCurrentUser(booking.freelancer_id) ? booking.freelancer_email : null,
      freelancerPhone: isConfirmed || isCurrentUser(booking.freelancer_id) ? booking.freelancer_phone : null,
      freelancerArea: booking.freelancer_area,
      serviceId: booking.service_id,
      serviceTitle: booking.service_title,
      startDatetime: booking.start_datetime.toISOString(),
      endDatetime: booking.end_datetime.toISOString(),
      locationType: booking.location_type,
      clientAddress: {
        line1: booking.client_address_line1,
        postcode: booking.client_postcode,
        city: booking.client_city,
      },
      notes: booking.notes,
      priceBasePence: booking.price_base_pence,
      priceMaterialsPence: booking.price_materials_pence,
      priceTravelPence: booking.price_travel_pence,
      totalPricePence: booking.total_price_pence,
      status: booking.status,
      paymentStatus: booking.payment_status,
      declinedReason: booking.declined_reason,
      expiresAt: booking.expires_at?.toISOString() || null,
      completedAt: booking.completed_at?.toISOString() || null,
      autoConfirmAt: booking.auto_confirm_at?.toISOString() || null,
      createdAt: booking.created_at.toISOString(),
      updatedAt: booking.updated_at.toISOString(),
      auditLog: auditLogs.map(log => ({
        id: log.id,
        action: log.action,
        previousStatus: log.previous_status,
        newStatus: log.new_status,
        userId: log.user_id,
        userName: log.user_name,
        createdAt: log.created_at.toISOString(),
      })),
      cancellationInfo: booking.cancelled_by ? {
        cancelledBy: booking.cancelled_by,
        cancelledAt: booking.cancelled_at?.toISOString() || null,
        cancellationReason: booking.cancellation_reason,
        refundAmount: booking.refund_amount ? parseFloat(booking.refund_amount) : null,
        refundPercentage: booking.refund_percentage
      } : undefined,
      refundEstimate,
      cancellationPolicies: policies.map(p => ({
        hoursThreshold: p.hoursThreshold,
        refundPercentage: p.refundPercentage
      })),
      payment: payment ? {
        id: payment.id,
        status: payment.status,
        escrowStatus: payment.escrow_status,
        amountPence: payment.amount_pence,
        platformFeePence: payment.platform_fee_pence,
        freelancerPayoutPence: payment.freelancer_payout_pence,
        refundId: payment.refund_id,
        refundAmountPence: payment.refund_amount_pence,
        createdAt: payment.created_at.toISOString(),
        escrowReleasedAt: payment.escrow_released_at?.toISOString() || null,
      } : undefined,
    };
  }
);
