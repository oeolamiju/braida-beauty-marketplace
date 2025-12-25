import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { requireFreelancer } from "../auth/middleware";
import db from "../db";
import { APIError } from "encore.dev/api";

export interface DuplicateServiceRequest {
  serviceId: number;
  newTitle?: string;
}

export interface DuplicateServiceResponse {
  id: number;
  message: string;
}

export const duplicate = api<DuplicateServiceRequest, DuplicateServiceResponse>(
  { method: "POST", path: "/services/:serviceId/duplicate", expose: true, auth: true },
  async (req): Promise<DuplicateServiceResponse> => {
    requireFreelancer();
    const auth = getAuthData()!;

    // Get original service
    const original = await db.queryRow<{
      id: number;
      stylist_id: string;
      title: string;
      category: string;
      subcategory: string | null;
      description: string | null;
      base_price_pence: number | null;
      studio_price_pence: number | null;
      mobile_price_pence: number | null;
      duration_minutes: number;
      materials_policy: string;
      materials_fee_pence: number;
      materials_description: string | null;
      location_types: string[];
      travel_fee_pence: number;
    }>`
      SELECT 
        id, stylist_id, title, category, subcategory, description,
        base_price_pence, studio_price_pence, mobile_price_pence,
        duration_minutes, materials_policy, materials_fee_pence,
        materials_description, location_types, travel_fee_pence
      FROM services
      WHERE id = ${req.serviceId}
    `;

    if (!original) {
      throw APIError.notFound("Service not found");
    }

    if (original.stylist_id !== auth.userID) {
      throw APIError.permissionDenied("You can only duplicate your own services");
    }

    // Create duplicate with "(Copy)" suffix
    const newTitle = req.newTitle || `${original.title} (Copy)`;

    const newService = await db.queryRow<{ id: number }>`
      INSERT INTO services (
        stylist_id, title, category, subcategory, description,
        base_price_pence, studio_price_pence, mobile_price_pence,
        duration_minutes, materials_policy, materials_fee_pence,
        materials_description, location_types, travel_fee_pence,
        is_active
      ) VALUES (
        ${auth.userID}, ${newTitle}, ${original.category}, ${original.subcategory},
        ${original.description}, ${original.base_price_pence}, ${original.studio_price_pence},
        ${original.mobile_price_pence}, ${original.duration_minutes}, ${original.materials_policy},
        ${original.materials_fee_pence}, ${original.materials_description},
        ${original.location_types}, ${original.travel_fee_pence},
        false
      )
      RETURNING id
    `;

    if (!newService) {
      throw new Error("Failed to create duplicate service");
    }

    // Copy style associations
    await db.exec`
      INSERT INTO service_styles (service_id, style_id)
      SELECT ${newService.id}, style_id
      FROM service_styles
      WHERE service_id = ${req.serviceId}
    `;

    // Copy images
    const imagesGen = db.query<{ image_url: string; display_order: number }>`
      SELECT image_url, display_order
      FROM service_images
      WHERE service_id = ${req.serviceId}
      ORDER BY display_order
    `;

    for await (const image of imagesGen) {
      await db.exec`
        INSERT INTO service_images (service_id, image_url, display_order)
        VALUES (${newService.id}, ${image.image_url}, ${image.display_order})
      `;
    }

    return {
      id: newService.id,
      message: "Service duplicated successfully. Edit the details and activate when ready.",
    };
  }
);

