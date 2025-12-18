import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface UpdatePackageRequest {
  id: number;
  name?: string;
  description?: string;
  serviceIds?: number[];
  discountPercent?: number;
  discountAmountPence?: number;
  imageUrl?: string;
  validUntil?: string | null;
  maxUses?: number | null;
  isActive?: boolean;
}

export interface UpdatePackageResponse {
  success: boolean;
}

export const updatePackage = api<UpdatePackageRequest, UpdatePackageResponse>(
  { method: "PUT", path: "/packages/:id", expose: true, auth: true },
  async (req): Promise<UpdatePackageResponse> => {
    const auth = getAuthData()!;

    // Verify package exists and belongs to user
    const pkg = await db.queryRow<{ freelancer_id: string }>`
      SELECT freelancer_id FROM service_packages WHERE id = ${req.id}
    `;

    if (!pkg) {
      throw APIError.notFound("Package not found");
    }

    if (pkg.freelancer_id !== auth.userID) {
      throw APIError.permissionDenied("You can only update your own packages");
    }

    // Validate inputs
    if (req.discountPercent !== undefined && (req.discountPercent < 0 || req.discountPercent > 50)) {
      throw APIError.invalidArgument("Discount percent must be between 0 and 50");
    }

    // Update package fields
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (req.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(req.name.trim());
    }
    if (req.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(req.description || null);
    }
    if (req.discountPercent !== undefined) {
      updates.push(`discount_percent = $${paramIndex++}`);
      values.push(req.discountPercent);
    }
    if (req.discountAmountPence !== undefined) {
      updates.push(`discount_amount_pence = $${paramIndex++}`);
      values.push(req.discountAmountPence);
    }
    if (req.imageUrl !== undefined) {
      updates.push(`image_url = $${paramIndex++}`);
      values.push(req.imageUrl || null);
    }
    if (req.validUntil !== undefined) {
      updates.push(`valid_until = $${paramIndex++}`);
      values.push(req.validUntil ? new Date(req.validUntil) : null);
    }
    if (req.maxUses !== undefined) {
      updates.push(`max_uses = $${paramIndex++}`);
      values.push(req.maxUses);
    }
    if (req.isActive !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(req.isActive);
    }

    updates.push("updated_at = NOW()");

    if (updates.length > 1) {
      values.push(req.id);
      await db.rawQuery(
        `UPDATE service_packages SET ${updates.join(", ")} WHERE id = $${paramIndex}`,
        values
      );
    }

    // Update services if provided
    if (req.serviceIds && req.serviceIds.length > 0) {
      if (req.serviceIds.length < 2) {
        throw APIError.invalidArgument("Package must include at least 2 services");
      }

      // Verify services belong to freelancer
      const servicesQuery = db.query<{ id: number; freelancer_id: string }>`
        SELECT id, freelancer_id FROM services
        WHERE id = ANY(${req.serviceIds})
      `;

      const services: any[] = [];
      for await (const s of servicesQuery) {
        services.push(s);
      }

      if (services.length !== req.serviceIds.length) {
        throw APIError.notFound("One or more services not found");
      }

      for (const service of services) {
        if (service.freelancer_id !== auth.userID) {
          throw APIError.permissionDenied("All services must belong to you");
        }
      }

      // Delete existing services
      await db.exec`
        DELETE FROM package_services WHERE package_id = ${req.id}
      `;

      // Add new services
      for (let i = 0; i < req.serviceIds.length; i++) {
        await db.exec`
          INSERT INTO package_services (package_id, service_id, sort_order)
          VALUES (${req.id}, ${req.serviceIds[i]}, ${i})
        `;
      }
    }

    return { success: true };
  }
);

