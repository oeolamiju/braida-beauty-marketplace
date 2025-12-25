import { api } from "encore.dev/api";
import { z } from "zod";
import db from "../db";
import { validateSchema } from "../shared/validation";
import { ErrorHandler } from "../shared/errors";

const getServiceSchema = z.object({
  id: z.number().int().positive("Service ID must be a positive integer"),
});

type GetServiceInput = z.infer<typeof getServiceSchema>;

interface GetServiceParams {
  id: number;
}

interface ServiceDetail {
  id: number;
  freelancerId: string;
  freelancerName: string;
  title: string;
  category: string;
  subcategory: string | null;
  description: string | null;
  basePricePence: number | null;
  studioPricePence: number | null;
  mobilePricePence: number | null;
  durationMinutes: number;
  materialsPolicy: string;
  materialsFee: number;
  materialsDescription: string | null;
  locationTypes: string[];
  travelFeePence: number;
  isActive: boolean;
  styles: { id: number; name: string }[];
}

// Retrieves detailed information about a specific service
export const get = api<GetServiceParams, ServiceDetail>(
  { expose: true, method: "GET", path: "/services/:id" },
  async (params): Promise<ServiceDetail> => {
    const { id } = validateSchema<GetServiceInput>(getServiceSchema, params);

    const row = await db.queryRow<{
      id: number;
      stylist_id: string;
      display_name: string;
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
      location_types: string;
      travel_fee_pence: number;
      is_active: boolean;
    }>`
      SELECT 
        s.id, s.stylist_id, fp.display_name, s.title,
        s.category, s.subcategory, s.description,
        s.base_price_pence, s.studio_price_pence, s.mobile_price_pence,
        s.duration_minutes, s.materials_policy,
        s.materials_fee_pence, s.materials_description, s.location_types, s.travel_fee_pence,
        s.is_active
      FROM services s
      JOIN freelancer_profiles fp ON s.stylist_id = fp.user_id
      WHERE s.id = ${id}
    `;

    if (!row) {
      ErrorHandler.notFound("Service", id);
    }

    const styleRows = await db.queryAll<{
      id: number;
      name: string;
    }>`
      SELECT st.id, st.name
      FROM service_styles ss
      JOIN styles st ON ss.style_id = st.id
      WHERE ss.service_id = ${id}
    `;

    // Parse location_types - handle both JSON string and native array from JSONB
    let locationTypes: string[] = [];
    try {
      if (typeof row.location_types === 'string') {
        locationTypes = JSON.parse(row.location_types);
      } else if (Array.isArray(row.location_types)) {
        locationTypes = row.location_types;
      }
    } catch (e) {
      console.error('Failed to parse location_types:', row.location_types, e);
      locationTypes = [];
    }

    return {
      id: row.id,
      freelancerId: row.stylist_id,
      freelancerName: row.display_name,
      title: row.title,
      category: row.category,
      subcategory: row.subcategory,
      description: row.description,
      basePricePence: row.base_price_pence,
      studioPricePence: row.studio_price_pence,
      mobilePricePence: row.mobile_price_pence,
      durationMinutes: row.duration_minutes,
      materialsPolicy: row.materials_policy,
      materialsFee: row.materials_fee_pence,
      materialsDescription: row.materials_description,
      locationTypes: locationTypes,
      travelFeePence: row.travel_fee_pence,
      isActive: row.is_active,
      styles: styleRows.map(s => ({ id: s.id, name: s.name })),
    };
  }
);
