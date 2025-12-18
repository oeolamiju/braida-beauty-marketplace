import { api, APIError } from "encore.dev/api";
import db from "../db";
import { requireAdmin } from "../auth/middleware";

interface UpdateStyleRequest {
  id: number;
  name?: string;
  description?: string;
  referenceImageUrl?: string;
  isActive?: boolean;
}

interface UpdateStyleResponse {
  id: number;
  name: string;
  description: string | null;
  referenceImageUrl: string | null;
  isActive: boolean;
}

export const update = api<UpdateStyleRequest, UpdateStyleResponse>(
  { expose: true, method: "PUT", path: "/admin/styles/:id", auth: true },
  async (req: UpdateStyleRequest): Promise<UpdateStyleResponse> => {
    requireAdmin();

    const existing = await db.queryRow<{
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

    if (!existing) {
      throw APIError.notFound("style not found");
    }

    if (req.name !== undefined && req.name.trim().length === 0) {
      throw APIError.invalidArgument("name cannot be empty");
    }

    if (req.name !== undefined && req.name.trim() !== existing.name) {
      const nameCheck = await db.queryRow<{ count: number }>`
        SELECT COUNT(*) as count FROM styles WHERE LOWER(name) = LOWER(${req.name.trim()}) AND id != ${req.id}
      `;

      if (nameCheck && nameCheck.count > 0) {
        throw APIError.alreadyExists("a style with this name already exists");
      }
    }

    const name = req.name !== undefined ? req.name.trim() : existing.name;
    const description = req.description !== undefined ? req.description : existing.description;
    const referenceImageUrl = req.referenceImageUrl !== undefined ? req.referenceImageUrl : existing.reference_image_url;
    const isActive = req.isActive !== undefined ? req.isActive : existing.is_active;

    const result = await db.queryRow<{
      id: number;
      name: string;
      description: string | null;
      reference_image_url: string | null;
      is_active: boolean;
    }>`
      UPDATE styles
      SET name = ${name},
          description = ${description},
          reference_image_url = ${referenceImageUrl},
          is_active = ${isActive}
      WHERE id = ${req.id}
      RETURNING id, name, description, reference_image_url, is_active
    `;

    if (!result) {
      throw APIError.internal("failed to update style");
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
