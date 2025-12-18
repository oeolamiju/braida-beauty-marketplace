import { api, APIError } from "encore.dev/api";
import db from "../db";
import { requireAdmin } from "../auth/middleware";

interface CreateStyleRequest {
  name: string;
  description?: string;
  referenceImageUrl?: string;
}

interface CreateStyleResponse {
  id: number;
  name: string;
  description: string | null;
  referenceImageUrl: string | null;
  isActive: boolean;
}

export const create = api<CreateStyleRequest, CreateStyleResponse>(
  { expose: true, method: "POST", path: "/admin/styles", auth: true },
  async (req: CreateStyleRequest): Promise<CreateStyleResponse> => {
    requireAdmin();

    if (!req.name || req.name.trim().length === 0) {
      throw APIError.invalidArgument("name is required");
    }

    const existing = await db.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM styles WHERE LOWER(name) = LOWER(${req.name.trim()})
    `;

    if (existing && existing.count > 0) {
      throw APIError.alreadyExists("a style with this name already exists");
    }

    const result = await db.queryRow<{
      id: number;
      name: string;
      description: string | null;
      reference_image_url: string | null;
      is_active: boolean;
    }>`
      INSERT INTO styles (name, description, reference_image_url, is_active)
      VALUES (${req.name.trim()}, ${req.description || null}, ${req.referenceImageUrl || null}, true)
      RETURNING id, name, description, reference_image_url, is_active
    `;

    if (!result) {
      throw APIError.internal("failed to create style");
    }

    return {
      id: result.id,
      name: result.name,
      description: result.description,
      referenceImageUrl: result.reference_image_url,
      isActive: result.is_active,
    };
  }
);
