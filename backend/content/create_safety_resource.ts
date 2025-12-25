import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { CreateSafetyResourceSchema } from "./schemas";
import type { SafetyResource } from "./types";

interface CreateSafetyResourceRequest {
  title: string;
  description: string;
  resourceType: string;
  url?: string;
  phoneNumber?: string;
  isEmergency?: boolean;
  displayOrder?: number;
  isActive?: boolean;
}

interface CreateSafetyResourceResponse {
  resource: SafetyResource;
}

export const createSafetyResource = api(
  { method: "POST", path: "/admin/content/safety-resources", auth: true, expose: true },
  async (req: CreateSafetyResourceRequest): Promise<CreateSafetyResourceResponse> => {
    const auth = getAuthData();
    if (!auth || auth.role?.toUpperCase() !== "ADMIN") {
      throw { code: "permission_denied", message: "Admin access required" };
    }

    const validated = CreateSafetyResourceSchema.parse(req);

    const row = await db.queryRow<{
      id: string;
      title: string;
      description: string;
      resource_type: string;
      url: string | null;
      phone_number: string | null;
      is_emergency: boolean;
      display_order: number;
      is_active: boolean;
      created_at: Date;
      updated_at: Date;
    }>`
      INSERT INTO safety_resources 
        (title, description, resource_type, url, phone_number, is_emergency, display_order, is_active)
      VALUES (${validated.title}, ${validated.description}, ${validated.resourceType}, ${validated.url || null}, ${validated.phoneNumber || null}, ${validated.isEmergency || false}, ${validated.displayOrder || 0}, ${validated.isActive !== undefined ? validated.isActive : true})
      RETURNING *
    `;

    if (!row) {
      throw { code: "internal", message: "Failed to create safety resource" };
    }

    const resource: SafetyResource = {
      id: row.id,
      title: row.title,
      description: row.description,
      resourceType: row.resource_type,
      url: row.url || undefined,
      phoneNumber: row.phone_number || undefined,
      isEmergency: row.is_emergency,
      displayOrder: row.display_order,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    return { resource };
  }
);
