import { api } from "encore.dev/api";
import db from "../db";
import { generateAvailableSlots } from "../availability/slot_generator";

export interface GetServiceSlotsRequest {
  serviceId: number;
  date: string;
}

export interface GetServiceSlotsResponse {
  slots: string[];
  freelancerArea: string;
  locationTypes: string[];
  travelFeePence: number;
  basePricePence: number;
  materialsFee: number;
  materialsPolicy: string;
  durationMinutes: number;
}

export const getSlots = api<GetServiceSlotsRequest, GetServiceSlotsResponse>(
  { expose: true, method: "GET", path: "/bookings/slots" },
  async (req) => {
    const service = await db.queryRow<{
      id: number;
      stylist_id: string;
      base_price_pence: number;
      materials_fee_pence: number;
      travel_fee_pence: number;
      duration_minutes: number;
      location_types: string;
      materials_policy: string;
    }>`
      SELECT id, stylist_id, base_price_pence, materials_fee_pence, 
             travel_fee_pence, duration_minutes, location_types, materials_policy
      FROM services
      WHERE id = ${req.serviceId} AND is_active = true
    `;

    if (!service) {
      throw new Error("Service not found or not available");
    }

    const freelancerProfile = await db.queryRow<{
      location_area: string;
    }>`
      SELECT location_area
      FROM freelancer_profiles
      WHERE user_id = ${service.stylist_id}
    `;

    const requestDate = new Date(req.date);
    if (isNaN(requestDate.getTime())) {
      throw new Error("Invalid date format");
    }
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

    // Parse location_types - handle both JSON string and native array from JSONB
    let locationTypes: string[] = [];
    try {
      if (typeof service.location_types === 'string') {
        locationTypes = JSON.parse(service.location_types);
      } else if (Array.isArray(service.location_types)) {
        locationTypes = service.location_types;
      }
    } catch (e) {
      console.error('Failed to parse location_types:', service.location_types, e);
      locationTypes = [];
    }

    return {
      slots: availabilityResult.slots.map(slot => slot.toISOString()),
      freelancerArea: freelancerProfile?.location_area || "Unknown",
      locationTypes: locationTypes,
      travelFeePence: service.travel_fee_pence,
      basePricePence: service.base_price_pence,
      materialsFee: service.materials_fee_pence,
      materialsPolicy: service.materials_policy,
      durationMinutes: service.duration_minutes,
    };
  }
);
