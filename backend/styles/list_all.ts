import { api } from "encore.dev/api";
import db from "../db";
import { requireAdmin } from "../auth/middleware";

interface Style {
  id: number;
  name: string;
  description: string | null;
  referenceImageUrl: string | null;
  isActive: boolean;
  servicesCount: number;
}

export interface ListAllStylesResponse {
  styles: Style[];
}

export const listAll = api<void, ListAllStylesResponse>(
  { expose: true, method: "GET", path: "/admin/styles", auth: true },
  async (): Promise<ListAllStylesResponse> => {
    requireAdmin();

    const rows = await db.queryAll<{
      id: number;
      name: string;
      description: string | null;
      reference_image_url: string | null;
      is_active: boolean;
      services_count: number;
    }>`
      SELECT s.id, s.name, s.description, s.reference_image_url, s.is_active,
             COUNT(ss.service_id) as services_count
      FROM styles s
      LEFT JOIN service_styles ss ON s.id = ss.style_id
      GROUP BY s.id, s.name, s.description, s.reference_image_url, s.is_active
      ORDER BY s.name ASC
    `;

    const styles = rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      referenceImageUrl: row.reference_image_url,
      isActive: row.is_active,
      servicesCount: row.services_count,
    }));

    return { styles };
  }
);
