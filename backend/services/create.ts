import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import { requireVerifiedFreelancer } from "../auth/middleware";
import db from "../db";
import { trackEvent } from "../analytics/track";

export interface CreateServiceRequest {
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
}

export interface CreateServiceResponse {
  id: number;
  message: string;
}

export const create = api<CreateServiceRequest, CreateServiceResponse>(
  { auth: true, expose: true, method: "POST", path: "/services" },
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

    const result = await db.queryRow<{ id: number }>`
      INSERT INTO services (
        stylist_id, title, category, subcategory, description,
        base_price_pence, studio_price_pence, mobile_price_pence,
        duration_minutes, materials_policy,
        materials_fee_pence, materials_description, location_types, travel_fee_pence
      )
      VALUES (
        ${auth.userID}, ${req.title}, ${req.category}, ${req.subcategory || null},
        ${req.description || null}, ${req.basePricePence || null}, 
        ${req.studioPricePence || null}, ${req.mobilePricePence || null},
        ${req.durationMinutes}, ${req.materialsPolicy}, ${req.materialsFee || 0},
        ${req.materialsDescription || null}, ${JSON.stringify(req.locationTypes)}, ${req.travelFee || 0}
      )
      RETURNING id
    `;

    for (const styleId of req.styleIds) {
      await db.exec`
        INSERT INTO service_styles (service_id, style_id)
        VALUES (${result!.id}, ${styleId})
      `;
    }

    await trackEvent(auth.userID, "service_created", {
      serviceId: result!.id,
      category: req.category,
      studioPricePence: req.studioPricePence,
      mobilePricePence: req.mobilePricePence,
    });

    return {
      id: result!.id,
      message: "Service created successfully",
    };
  }
);
