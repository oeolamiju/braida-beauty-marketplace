import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import { requireVerifiedClient } from "../auth/middleware";
import db from "../db";
import { generateAvailableSlots } from "../availability/slot_generator";
import { sendNotification } from "../notifications/send";
import { getBookingRequestEmail } from "../notifications/email_service";
import { createPaymentIntent } from "../payments/stripe_service";
import { calculateBookingPrice } from "../shared/pricing";
import { logBookingEvent } from "../shared/logger";

export interface CreateBookingRequest {
  serviceId: number;
  startDatetime: string;
  locationType: 'client_travels_to_freelancer' | 'freelancer_travels_to_client';
  clientAddressLine1?: string;
  clientPostcode?: string;
  clientCity?: string;
  clientProvidesOwnMaterials?: boolean;
  notes?: string;
}

export interface CreateBookingResponse {
  id: number;
  message: string;
  requiresPayment: boolean;
  paymentIntentId?: string;
  clientSecret?: string;
  priceBreakdown?: {
    basePricePence: number;
    materialsPricePence: number;
    travelPricePence: number;
    platformFeePence: number;
    totalPence: number;
  };
}

export const create = api<CreateBookingRequest, CreateBookingResponse>(
  { auth: true, expose: true, method: "POST", path: "/bookings" },
  async (req) => {
    // Ensure user is a verified client (email/phone verified)
    await requireVerifiedClient();

    const auth = getAuthData()! as AuthData;

    // Check that the client's account is verified (email or phone verified)
    const client = await db.queryRow<{ is_verified: boolean; status: string }>`
      SELECT is_verified, status FROM users WHERE id = ${auth.userID}
    `;

    if (!client || !client.is_verified) {
      throw APIError.permissionDenied("Please verify your email address before making a booking");
    }

    if (client.status !== 'active') {
      throw APIError.permissionDenied("Your account is not active. Please contact support.");
    }

    if (req.locationType === 'freelancer_travels_to_client' && 
        (!req.clientAddressLine1 || !req.clientPostcode || !req.clientCity)) {
      throw APIError.invalidArgument("Address is required when freelancer travels to client");
    }

    const service = await db.queryRow<{
      id: number;
      stylist_id: string;
      base_price_pence: number;
      materials_fee_pence: number;
      materials_policy: string;
      travel_fee_pence: number;
      duration_minutes: number;
      location_types: string;
    }>`
      SELECT id, stylist_id, base_price_pence, materials_fee_pence, 
             materials_policy, travel_fee_pence, duration_minutes, location_types
      FROM services
      WHERE id = ${req.serviceId} AND is_active = true
    `;

    if (!service) {
      throw APIError.notFound("service not found or not available");
    }

    const locationTypes = JSON.parse(service.location_types);
    if (!locationTypes.includes(req.locationType)) {
      throw APIError.invalidArgument("Selected location type is not supported for this service");
    }

    const startDate = new Date(req.startDatetime);
    const endDate = new Date(startDate.getTime() + service.duration_minutes * 60000);

    if (isNaN(startDate.getTime())) {
      throw APIError.invalidArgument("invalid datetime format");
    }

    const requestDate = new Date(startDate);
    requestDate.setHours(0, 0, 0, 0);

    const settings = await db.queryRow<{
      min_lead_time_hours: number;
      max_bookings_per_day: number | null;
    }>`
      SELECT min_lead_time_hours, max_bookings_per_day
      FROM freelancer_availability_settings
      WHERE freelancer_id = ${service.stylist_id}
    `;

    const minLeadTimeHours = settings?.min_lead_time_hours || 0;
    const maxBookingsPerDay = settings?.max_bookings_per_day || null;

    const availabilityResult = await generateAvailableSlots({
      freelancerId: service.stylist_id,
      date: requestDate,
      durationMinutes: service.duration_minutes,
      minLeadTimeHours,
      maxBookingsPerDay,
    });

    const isSlotAvailable = availabilityResult.slots.some(slot => {
      return Math.abs(slot.getTime() - startDate.getTime()) < 60000;
    });

    if (!isSlotAvailable) {
      throw APIError.invalidArgument("selected time slot is not available");
    }

    const priceBreakdown = calculateBookingPrice({
      basePricePence: service.base_price_pence,
      materialsPricePence: service.materials_fee_pence,
      travelPricePence: service.travel_fee_pence,
      materialsPolicy: service.materials_policy as 'client_provides' | 'freelancer_provides' | 'both',
      locationType: req.locationType,
      clientProvidesOwnMaterials: req.clientProvidesOwnMaterials,
    });

    const materialsFee = priceBreakdown.materialsPricePence;
    const travelFee = priceBreakdown.travelPricePence;
    const totalPricePence = priceBreakdown.totalPence;

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const result = await db.queryRow<{ id: number }>`
      INSERT INTO bookings (
        client_id, stylist_id, service_id,
        start_datetime, end_datetime, location_type,
        client_address_line1, client_postcode, client_city,
        notes, price_base_pence, price_materials_pence,
        price_travel_pence, total_price_pence, expires_at,
        payment_status
      )
      VALUES (
        ${auth.userID}, ${service.stylist_id}, ${req.serviceId},
        ${startDate.toISOString()}, ${endDate.toISOString()}, ${req.locationType},
        ${req.clientAddressLine1 || null}, ${req.clientPostcode || null}, ${req.clientCity || null},
        ${req.notes || null}, ${service.base_price_pence}, ${materialsFee},
        ${travelFee}, ${totalPricePence}, ${expiresAt.toISOString()},
        'unpaid'
      )
      RETURNING id
    `;

    await db.exec`
      INSERT INTO booking_audit_logs (booking_id, user_id, action, new_status, metadata)
      VALUES (
        ${result!.id}, ${auth.userID}, 'created', 'pending',
        ${JSON.stringify({ serviceId: req.serviceId, locationType: req.locationType })}
      )
    `;

    logBookingEvent("created", result!.id, {
      clientId: auth.userID,
      freelancerId: service.stylist_id,
      serviceId: req.serviceId,
      totalPricePence,
      status: "pending",
    });

    const { paymentIntentId, clientSecret, platformFeePence } = await createPaymentIntent({
      bookingId: result!.id,
      totalPricePence,
      basePricePence: priceBreakdown.basePricePence,
      materialsPricePence: priceBreakdown.materialsPricePence,
      travelPricePence: priceBreakdown.travelPricePence,
      currency: 'gbp',
      metadata: {
        freelancerId: service.stylist_id,
        clientId: auth.userID,
      },
    });

    await db.exec`
      INSERT INTO payments (
        booking_id, provider, stripe_payment_intent_id,
        status, escrow_status, amount_pence, currency,
        platform_fee_pence, freelancer_payout_pence, metadata
      )
      VALUES (
        ${result!.id}, 'stripe', ${paymentIntentId},
        'initiated', 'held', ${totalPricePence}, 'GBP',
        ${platformFeePence}, ${totalPricePence - platformFeePence},
        ${JSON.stringify({ clientId: auth.userID, freelancerId: service.stylist_id })}
      )
    `;

    await db.exec`
      UPDATE bookings
      SET payment_status = 'payment_pending', updated_at = NOW()
      WHERE id = ${result!.id}
    `;

    // NOTE: Freelancer notification is sent AFTER payment succeeds (in webhook handler)
    // This ensures booking is only visible to freelancer when payment is confirmed
    // See: backend/payments/webhook.ts - handlePaymentSucceeded()

    return {
      id: result!.id,
      message: "Booking created. Please complete payment to confirm your booking.",
      requiresPayment: true,
      paymentIntentId,
      clientSecret,
      priceBreakdown,
    };
  }
);
