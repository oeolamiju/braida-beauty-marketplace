import { api, Query } from "encore.dev/api";
import { z } from "zod";
import db from "../db";
import { validateSchema } from "../shared/validation";

const listServicesSchema = z.object({
  freelancerId: z.string().optional(),
  category: z.string().optional(),
  includeInactive: z.boolean().optional(),
});

interface ListServicesParams {
  freelancerId?: Query<string>;
  category?: Query<string>;
  includeInactive?: Query<boolean>;
}

interface ServiceListing {
  id: number;
  freelancerId: string;
  title: string;
  category: string;
  subcategory: string | null;
  description: string | null;
  basePricePence: number;
  durationMinutes: number;
  materialsPolicy: string;
  materialsFee: number;
  materialsDescription: string | null;
  locationTypes: string[];
  travelFeePence: number;
  isActive: boolean;
  styles: { id: number; name: string }[];
}

interface ListServicesResponse {
  services: ServiceListing[];
}

// Lists active services with optional filtering by freelancer or category
export const list = api<ListServicesParams, ListServicesResponse>(
  { expose: true, method: "GET", path: "/services" },
  async (params): Promise<ListServicesResponse> => {
    try {
    const { freelancerId, category, includeInactive } = validateSchema(listServicesSchema, params);
    let query = `
      SELECT 
        id, freelancer_id, title, category, subcategory,
        description, base_price_pence, duration_minutes,
        materials_policy, materials_fee_pence, materials_description, location_types,
        travel_fee_pence, is_active
      FROM services
      WHERE 1=1
    `;

    if (!includeInactive) {
      query += ` AND is_active = true`;
    }

    const queryParams: any[] = [];
    let paramIndex = 1;

    if (freelancerId) {
      query += ` AND freelancer_id = $${paramIndex}`;
      queryParams.push(freelancerId);
      paramIndex++;
    }

    if (category) {
      query += ` AND category = $${paramIndex}`;
      queryParams.push(category);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC`;

    const rows = await db.rawQueryAll<{
      id: number;
      freelancer_id: string;
      title: string;
      category: string;
      subcategory: string | null;
      description: string | null;
      base_price_pence: number;
      duration_minutes: number;
      materials_policy: string;
      materials_fee_pence: number;
      materials_description: string | null;
      location_types: string | string[];
      travel_fee_pence: number;
      is_active: boolean;
    }>(query, ...queryParams);

    const services = await Promise.all(
      rows.map(async (row) => {
        const styleRows = await db.queryAll<{
          id: number;
          name: string;
        }>`
          SELECT st.id, st.name
          FROM service_styles ss
          JOIN styles st ON ss.style_id = st.id
          WHERE ss.service_id = ${row.id}
        `;

        return {
          id: row.id,
          freelancerId: row.freelancer_id,
          title: row.title,
          category: row.category,
          subcategory: row.subcategory,
          description: row.description,
          basePricePence: row.base_price_pence,
          durationMinutes: row.duration_minutes,
          materialsPolicy: row.materials_policy,
          materialsFee: row.materials_fee_pence,
          materialsDescription: row.materials_description,
          locationTypes: typeof row.location_types === 'string' ? JSON.parse(row.location_types) : row.location_types,
          travelFeePence: row.travel_fee_pence,
          isActive: row.is_active,
          styles: styleRows.map(s => ({ id: s.id, name: s.name })),
        };
      })
    );

    return { services };
    } catch (error) {
      console.error('Error listing services:', error);
      return { services: [] };
    }
  }
);
