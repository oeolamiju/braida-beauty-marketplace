import { api } from "encore.dev/api";
import db from "../db";
import type { SafetyResource } from "./types";

interface ListSafetyResourcesRequest {
  resourceType?: string;
  activeOnly?: boolean;
}

interface ListSafetyResourcesResponse {
  resources: SafetyResource[];
}

export const listSafetyResources = api(
  { method: "GET", path: "/content/safety-resources", expose: true },
  async ({ resourceType, activeOnly = true }: ListSafetyResourcesRequest): Promise<ListSafetyResourcesResponse> => {
    let rows: Array<{
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
    }>;

    if (resourceType && activeOnly) {
      rows = await db.queryAll`
        SELECT id, title, description, resource_type, url, phone_number,
          is_emergency, display_order, is_active, created_at, updated_at
        FROM safety_resources
        WHERE resource_type = ${resourceType} AND is_active = true
        ORDER BY is_emergency DESC, display_order ASC, created_at ASC
      `;
    } else if (resourceType) {
      rows = await db.queryAll`
        SELECT id, title, description, resource_type, url, phone_number,
          is_emergency, display_order, is_active, created_at, updated_at
        FROM safety_resources
        WHERE resource_type = ${resourceType}
        ORDER BY is_emergency DESC, display_order ASC, created_at ASC
      `;
    } else if (activeOnly) {
      rows = await db.queryAll`
        SELECT id, title, description, resource_type, url, phone_number,
          is_emergency, display_order, is_active, created_at, updated_at
        FROM safety_resources
        WHERE is_active = true
        ORDER BY is_emergency DESC, display_order ASC, created_at ASC
      `;
    } else {
      rows = await db.queryAll`
        SELECT id, title, description, resource_type, url, phone_number,
          is_emergency, display_order, is_active, created_at, updated_at
        FROM safety_resources
        ORDER BY is_emergency DESC, display_order ASC, created_at ASC
      `;
    }

    const resources: SafetyResource[] = rows.map(row => ({
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
    }));

    return { resources };
  }
);
