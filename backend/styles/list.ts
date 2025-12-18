import { api, Query } from "encore.dev/api";
import db from "../db";

interface Style {
  id: number;
  name: string;
  description: string | null;
  referenceImageUrl: string | null;
  isActive: boolean;
  category: string | null;
}

interface ListStylesRequest {
  category?: Query<string>;
}

interface ListStylesResponse {
  styles: Style[];
}

export const list = api<ListStylesRequest, ListStylesResponse>(
  { expose: true, method: "GET", path: "/styles" },
  async (req): Promise<ListStylesResponse> => {
    let rows;
    
    if (req.category) {
      rows = await db.queryAll<{
        id: number;
        name: string;
        description: string | null;
        reference_image_url: string | null;
        is_active: boolean;
        category: string | null;
      }>`
        SELECT id, name, description, reference_image_url, is_active, category
        FROM styles
        WHERE is_active = true AND category = ${req.category}
        ORDER BY name ASC
      `;
    } else {
      rows = await db.queryAll<{
        id: number;
        name: string;
        description: string | null;
        reference_image_url: string | null;
        is_active: boolean;
        category: string | null;
      }>`
        SELECT id, name, description, reference_image_url, is_active, category
        FROM styles
        WHERE is_active = true
        ORDER BY name ASC
      `;
    }

    const styles = rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      referenceImageUrl: row.reference_image_url,
      isActive: row.is_active,
      category: row.category,
    }));

    return { styles };
  }
);
