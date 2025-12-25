import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { UpdateSafetyResourceSchema } from "./schemas";
import type { SafetyResource } from "./types";

interface UpdateSafetyResourceRequest {
  id: string;
  title?: string;
  description?: string;
  resourceType?: string;
  url?: string;
  phoneNumber?: string;
  isEmergency?: boolean;
  displayOrder?: number;
  isActive?: boolean;
}

interface UpdateSafetyResourceResponse {
  resource: SafetyResource;
}

export const updateSafetyResource = api(
  { method: "PATCH", path: "/admin/content/safety-resources/:id", auth: true, expose: true },
  async ({ id, ...updates }: UpdateSafetyResourceRequest): Promise<UpdateSafetyResourceResponse> => {
    const auth = getAuthData();
    if (!auth || auth.role?.toUpperCase() !== "ADMIN") {
      throw { code: "permission_denied", message: "Admin access required" };
    }

    const validated = UpdateSafetyResourceSchema.parse(updates);

    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (validated.title !== undefined) {
      setClauses.push(`title = $${paramIndex++}`);
      values.push(validated.title);
    }

    if (validated.description !== undefined) {
      setClauses.push(`description = $${paramIndex++}`);
      values.push(validated.description);
    }

    if (validated.resourceType !== undefined) {
      setClauses.push(`resource_type = $${paramIndex++}`);
      values.push(validated.resourceType);
    }

    if (validated.url !== undefined) {
      setClauses.push(`url = $${paramIndex++}`);
      values.push(validated.url);
    }

    if (validated.phoneNumber !== undefined) {
      setClauses.push(`phone_number = $${paramIndex++}`);
      values.push(validated.phoneNumber);
    }

    if (validated.isEmergency !== undefined) {
      setClauses.push(`is_emergency = $${paramIndex++}`);
      values.push(validated.isEmergency);
    }

    if (validated.displayOrder !== undefined) {
      setClauses.push(`display_order = $${paramIndex++}`);
      values.push(validated.displayOrder);
    }

    if (validated.isActive !== undefined) {
      setClauses.push(`is_active = $${paramIndex++}`);
      values.push(validated.isActive);
    }

    setClauses.push(`updated_at = NOW()`);
    values.push(id);

    await db.rawExec(
      `UPDATE safety_resources
       SET ${setClauses.join(', ')}
       WHERE id = $${paramIndex}`,
      ...values
    );

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
      SELECT * FROM safety_resources WHERE id = ${id}
    `;

    if (!row) {
      throw { code: "not_found", message: "Safety resource not found" };
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
