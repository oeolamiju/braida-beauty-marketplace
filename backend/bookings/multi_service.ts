import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { APIError } from "encore.dev/api";
import { sendNotification } from "../notifications/send";
import Stripe from "stripe";
import { secret } from "encore.dev/config";

const stripeSecretKey = secret("StripeSecretKey");

export interface MultiServiceBookingRequest {
  serviceIds: number[];
  freelancerId: string;
  startDatetime: string;
  locationType: "client_travels_to_freelancer" | "freelancer_travels_to_client";
  clientAddress?: {
    line1: string;
    postcode: string;
    city: string;
  };
  notes?: string;
}

export interface MultiServiceBookingResponse {
  bookingGroupId: string;
  bookings: {
    id: number;
    serviceTitle: string;
    startTime: string;
    endTime: string;
    price: number;
  }[];
  totalPricePence: number;
  totalDurationMinutes: number;
  estimatedEndTime: string;
  paymentIntentId: string;
  clientSecret: string;
}

export const createMultiServiceBooking = api<MultiServiceBookingRequest, MultiServiceBookingResponse>(
  { method: "POST", path: "/bookings/multi", expose: true, auth: true },
  async (req): Promise<MultiServiceBookingResponse> => {
    const auth = getAuthData()!;

    if (req.serviceIds.length === 0) {
      throw APIError.invalidArgument("At least one service is required");
    }

    if (req.serviceIds.length > 5) {
      throw APIError.invalidArgument("Maximum 5 services per booking");
    }

    // Get all services and verify they belong to the same freelancer
    const servicesGen = db.query<{
      id: number;
      freelancer_id: string;
      title: string;
      duration_minutes: number;
      studio_price_pence: number | null;
      mobile_price_pence: number | null;
      materials_fee_pence: number;
      travel_fee_pence: number;
      location_types: string[];
      is_active: boolean;
    }>`
      SELECT 
        id, freelancer_id, title, duration_minutes,
        studio_price_pence, mobile_price_pence,
        materials_fee_pence, travel_fee_pence,
        location_types, is_active
      FROM services
      WHERE id = ANY(${req.serviceIds})
      ORDER BY id
    `;

    const services: any[] = [];
    for await (const service of servicesGen) {
      services.push(service);
    }

    if (services.length !== req.serviceIds.length) {
      throw APIError.notFound("One or more services not found");
    }

    // Verify all services belong to the same freelancer
    const freelancerIds = [...new Set(services.map((s) => s.freelancer_id))];
    if (freelancerIds.length > 1) {
      throw APIError.invalidArgument("All services must be from the same freelancer");
    }

    if (freelancerIds[0] !== req.freelancerId) {
      throw APIError.invalidArgument("Services do not belong to the specified freelancer");
    }

    // Check location type compatibility
    for (const service of services) {
      if (!service.location_types.includes(req.locationType)) {
        throw APIError.invalidArgument(
          `Service "${service.title}" does not support ${req.locationType}`
        );
      }
      if (!service.is_active) {
        throw APIError.invalidArgument(`Service "${service.title}" is not active`);
      }
    }

    // Calculate total duration and prices
    let totalDurationMinutes = 0;
    let totalBasePricePence = 0;
    let totalMaterialsPence = 0;
    let travelFeePence = 0;

    for (const service of services) {
      totalDurationMinutes += service.duration_minutes;
      totalMaterialsPence += service.materials_fee_pence;

      const price =
        req.locationType === "client_travels_to_freelancer"
          ? service.studio_price_pence
          : service.mobile_price_pence;

      if (!price) {
        throw APIError.invalidArgument(
          `Service "${service.title}" does not have pricing for ${req.locationType}`
        );
      }

      totalBasePricePence += price;

      // Only add travel fee once for mobile service
      if (req.locationType === "freelancer_travels_to_client" && service.travel_fee_pence > travelFeePence) {
        travelFeePence = service.travel_fee_pence;
      }
    }

    const platformFeePence = Math.round(totalBasePricePence * 0.05); // 5% platform fee
    const totalPricePence = totalBasePricePence + totalMaterialsPence + travelFeePence + platformFeePence;

    // Parse start datetime and calculate end time
    const startDatetime = new Date(req.startDatetime);
    const endDatetime = new Date(startDatetime.getTime() + totalDurationMinutes * 60 * 1000);

    // Check availability
    const conflictingBooking = await db.queryRow<{ id: number }>`
      SELECT id FROM bookings
      WHERE freelancer_id = ${req.freelancerId}
        AND status IN ('pending', 'confirmed')
        AND (
          (start_datetime <= ${startDatetime} AND end_datetime > ${startDatetime})
          OR (start_datetime < ${endDatetime} AND end_datetime >= ${endDatetime})
          OR (start_datetime >= ${startDatetime} AND end_datetime <= ${endDatetime})
        )
    `;

    if (conflictingBooking) {
      throw APIError.failedPrecondition("Time slot not available");
    }

    // Generate booking group ID
    const bookingGroupId = `group_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // Create bookings for each service sequentially
    const createdBookings: any[] = [];
    let currentStartTime = new Date(startDatetime);

    for (const service of services) {
      const serviceEndTime = new Date(currentStartTime.getTime() + service.duration_minutes * 60 * 1000);

      const basePricePence =
        req.locationType === "client_travels_to_freelancer"
          ? service.studio_price_pence
          : service.mobile_price_pence;

      const serviceTotal =
        basePricePence +
        service.materials_fee_pence +
        (services.indexOf(service) === 0 ? travelFeePence : 0); // Travel fee only on first service

      const booking = await db.queryRow<{ id: number }>`
        INSERT INTO bookings (
          client_id, freelancer_id, service_id,
          start_datetime, end_datetime,
          location_type, client_address_line1, client_address_postcode, client_address_city,
          notes, booking_group_id,
          price_base_pence, price_materials_pence, price_travel_pence, total_price_pence,
          status, payment_status
        ) VALUES (
          ${auth.userID}, ${req.freelancerId}, ${service.id},
          ${currentStartTime}, ${serviceEndTime},
          ${req.locationType}, ${req.clientAddress?.line1 || null}, ${req.clientAddress?.postcode || null}, ${req.clientAddress?.city || null},
          ${req.notes || null}, ${bookingGroupId},
          ${basePricePence}, ${service.materials_fee_pence}, ${services.indexOf(service) === 0 ? travelFeePence : 0}, ${serviceTotal},
          'pending', 'payment_pending'
        )
        RETURNING id
      `;

      createdBookings.push({
        id: booking!.id,
        serviceTitle: service.title,
        startTime: currentStartTime.toISOString(),
        endTime: serviceEndTime.toISOString(),
        price: serviceTotal,
      });

      currentStartTime = serviceEndTime;
    }

    // Create Stripe PaymentIntent
    const stripe = new Stripe(stripeSecretKey(), { apiVersion: "2025-02-24.acacia" });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPricePence,
      currency: "gbp",
      metadata: {
        bookingGroupId,
        bookingIds: createdBookings.map((b) => b.id).join(","),
        clientId: auth.userID,
        freelancerId: req.freelancerId,
      },
    });

    // Store payment record for the group
    await db.exec`
      INSERT INTO payments (
        booking_id, payment_intent_id, amount_pence,
        platform_fee_pence, status, escrow_status
      ) VALUES (
        ${createdBookings[0].id}, ${paymentIntent.id}, ${totalPricePence},
        ${platformFeePence}, 'pending', 'pending'
      )
    `;

    return {
      bookingGroupId,
      bookings: createdBookings,
      totalPricePence,
      totalDurationMinutes,
      estimatedEndTime: endDatetime.toISOString(),
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret!,
    };
  }
);

export interface GetBookingDurationRequest {
  serviceIds: number[];
  startDatetime: string;
}

export interface GetBookingDurationResponse {
  services: {
    id: number;
    title: string;
    durationMinutes: number;
    startTime: string;
    endTime: string;
  }[];
  totalDurationMinutes: number;
  estimatedEndTime: string;
}

export const getBookingDuration = api<GetBookingDurationRequest, GetBookingDurationResponse>(
  { method: "POST", path: "/bookings/calculate-duration", expose: true },
  async (req): Promise<GetBookingDurationResponse> => {
    if (req.serviceIds.length === 0) {
      throw APIError.invalidArgument("At least one service is required");
    }

    const servicesGen = db.query<{
      id: number;
      title: string;
      duration_minutes: number;
    }>`
      SELECT id, title, duration_minutes
      FROM services
      WHERE id = ANY(${req.serviceIds})
      ORDER BY ARRAY_POSITION(${req.serviceIds}::int[], id)
    `;

    const services: any[] = [];
    let totalDurationMinutes = 0;
    let currentStartTime = new Date(req.startDatetime);

    for await (const service of servicesGen) {
      const endTime = new Date(currentStartTime.getTime() + service.duration_minutes * 60 * 1000);

      services.push({
        id: service.id,
        title: service.title,
        durationMinutes: service.duration_minutes,
        startTime: currentStartTime.toISOString(),
        endTime: endTime.toISOString(),
      });

      totalDurationMinutes += service.duration_minutes;
      currentStartTime = endTime;
    }

    return {
      services,
      totalDurationMinutes,
      estimatedEndTime: currentStartTime.toISOString(),
    };
  }
);

