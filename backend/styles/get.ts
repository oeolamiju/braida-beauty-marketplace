import { api, APIError } from "encore.dev/api";
import db from "../db";

interface GetStyleRequest {
  id: number;
}

interface GetStyleResponse {
  id: number;
  name: string;
  description: string | null;
  referenceImageUrl: string | null;
  isActive: boolean;
}

export const get = api<GetStyleRequest, GetStyleResponse>(
  { expose: true, method: "GET", path: "/styles/:id" },
  async (req: GetStyleRequest): Promise<GetStyleResponse> => {
    const style = await db.queryRow<{
      id: number;
      name: string;
      description: string | null;
      reference_image_url: string | null;
      is_active: boolean;
    }>`
      SELECT id, name, description, reference_image_url, is_active
      FROM styles
      WHERE id = ${req.id}
    `;

    if (!style) {
      throw APIError.notFound("style not found");
    }

    return {
      id: style.id,
      name: style.name,
      description: style.description,
      referenceImageUrl: style.reference_image_url,
      isActive: style.is_active,
    };
  }
);
