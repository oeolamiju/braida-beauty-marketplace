import { api, APIError } from "encore.dev/api";
import db from "../db";
import { ServicePackage, PackageService } from "./types";

export interface GetPackageRequest {
  id: number;
}

export interface GetPackageResponse {
  package: ServicePackage;
}

export const getPackage = api<GetPackageRequest, GetPackageResponse>(
  { method: "GET", path: "/packages/:id", expose: true },
  async (req): Promise<GetPackageResponse> => {
    const pkg = await db.queryRow<any>`
      SELECT 
        sp.id, sp.freelancer_id, sp.name, sp.description,
        sp.discount_percent, sp.discount_amount_pence,
        sp.is_active, sp.image_url, sp.valid_until,
        sp.max_uses, sp.current_uses, sp.created_at, sp.updated_at
      FROM service_packages sp
      WHERE sp.id = ${req.id}
    `;

    if (!pkg) {
      throw APIError.notFound("Package not found");
    }

    // Get services
    const servicesQuery = db.query<any>`
      SELECT 
        ps.id, ps.service_id, ps.sort_order,
        s.title, s.duration_minutes, s.studio_price_pence
      FROM package_services ps
      JOIN services s ON s.id = ps.service_id
      WHERE ps.package_id = ${pkg.id}
      ORDER BY ps.sort_order
    `;

    const services: PackageService[] = [];
    for await (const s of servicesQuery) {
      services.push({
        id: s.id,
        serviceId: s.service_id,
        title: s.title,
        durationMinutes: s.duration_minutes,
        pricePence: s.studio_price_pence || 0,
        sortOrder: s.sort_order,
      });
    }

    const originalPricePence = services.reduce((sum, s) => sum + s.pricePence, 0);
    const totalDurationMinutes = services.reduce((sum, s) => sum + s.durationMinutes, 0);

    let discountedPricePence = originalPricePence;
    if (pkg.discount_percent > 0) {
      discountedPricePence = Math.round(originalPricePence * (1 - pkg.discount_percent / 100));
    }
    if (pkg.discount_amount_pence > 0) {
      discountedPricePence = Math.max(0, discountedPricePence - pkg.discount_amount_pence);
    }

    return {
      package: {
        id: pkg.id,
        freelancerId: pkg.freelancer_id,
        name: pkg.name,
        description: pkg.description,
        discountPercent: parseFloat(pkg.discount_percent) || 0,
        discountAmountPence: pkg.discount_amount_pence || 0,
        isActive: pkg.is_active,
        imageUrl: pkg.image_url,
        validUntil: pkg.valid_until?.toISOString() || null,
        maxUses: pkg.max_uses,
        currentUses: pkg.current_uses,
        services,
        originalPricePence,
        discountedPricePence,
        totalDurationMinutes,
        createdAt: pkg.created_at.toISOString(),
        updatedAt: pkg.updated_at.toISOString(),
      },
    };
  }
);

