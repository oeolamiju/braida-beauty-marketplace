import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import { requireVerifiedFreelancer } from "../auth/middleware";
import db from "../db";

export interface UpdateServiceRequest {
  id: number;
  title: string;
  category: string;
  subcategory?: string;
  description?: string;
  basePricePence?: number;
  studioPricePence?: number;
  mobilePricePence?: number;
  durationMinutes: number;
  materialsPolicy: string;
  materialsFee?: number;
  materialsDescription?: string;
  locationTypes: string[];
  travelFee?: number;
  styleIds: number[];
  isActive: boolean;
}

export interface UpdateServiceResponse {
  message: string;
}

export const update = api<UpdateServiceRequest, UpdateServiceResponse>(
  { auth: true, expose: true, method: "PUT", path: "/services/:id" },
  async (req) => {
    requireVerifiedFreelancer();

    const auth = getAuthData()! as AuthData;

    if (!req.title || !req.category || !req.durationMinutes || !req.materialsPolicy) {
      throw APIError.invalidArgument("title, category, durationMinutes, and materialsPolicy are required");
    }

    const hasStudio = req.locationTypes.includes('client_travels_to_freelancer');
    const hasMobile = req.locationTypes.includes('freelancer_travels_to_client');

    if (hasStudio && (req.studioPricePence == null || req.studioPricePence < 0)) {
      throw APIError.invalidArgument("studioPricePence must be provided and non-negative for studio services");
    }

    if (hasMobile && (req.mobilePricePence == null || req.mobilePricePence < 0)) {
      throw APIError.invalidArgument("mobilePricePence must be provided and non-negative for mobile services");
    }

    if (req.durationMinutes < 15 || req.durationMinutes > 600) {
      throw APIError.invalidArgument("durationMinutes must be between 15 and 600");
    }

    if (!req.styleIds || req.styleIds.length === 0) {
      throw APIError.invalidArgument("At least one style must be selected");
    }

    if (!req.locationTypes || req.locationTypes.length === 0) {
      throw APIError.invalidArgument("At least one location type must be selected");
    }

    const existing = await db.queryRow<{ freelancer_id: string }>`
      SELECT freelancer_id FROM services WHERE id = ${req.id}
    `;

    if (!existing) {
      throw APIError.notFound("Service not found");
    }

    if (existing.freelancer_id !== auth.userID) {
      throw APIError.permissionDenied("You can only update your own services");
    }

    await db.exec`
      UPDATE services
      SET
        title = ${req.title},
        category = ${req.category},
        subcategory = ${req.subcategory || null},
        description = ${req.description || null},
        base_price_pence = ${req.basePricePence || null},
        studio_price_pence = ${req.studioPricePence || null},
        mobile_price_pence = ${req.mobilePricePence || null},
        duration_minutes = ${req.durationMinutes},
        materials_policy = ${req.materialsPolicy},
        materials_fee_pence = ${req.materialsFee || 0},
        materials_description = ${req.materialsDescription || null},
        location_types = ${JSON.stringify(req.locationTypes)},
        travel_fee_pence = ${req.travelFee || 0},
        is_active = ${req.isActive},
        updated_at = NOW()
      WHERE id = ${req.id}
    `;

    await db.exec`
      DELETE FROM service_styles WHERE service_id = ${req.id}
    `;

    for (const styleId of req.styleIds) {
      await db.exec`
        INSERT INTO service_styles (service_id, style_id)
        VALUES (${req.id}, ${styleId})
      `;
    }

    return {
      message: "Service updated successfully",
    };
  }
);
