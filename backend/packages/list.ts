import { api } from "encore.dev/api";
import db from "../db";
import { ServicePackage, PackageService } from "./types";

export interface ListPackagesRequest {
  freelancerId?: string;
  activeOnly?: boolean;
}

export interface ListPackagesResponse {
  packages: ServicePackage[];
}

export const listPackages = api<ListPackagesRequest, ListPackagesResponse>(
  { method: "GET", path: "/packages", expose: true },
  async (req): Promise<ListPackagesResponse> => {
    let whereClause = "WHERE 1=1";
    const params: any[] = [];

    if (req.freelancerId) {
      params.push(req.freelancerId);
      whereClause += ` AND sp.freelancer_id = $${params.length}`;
    }

    if (req.activeOnly !== false) {
      whereClause += " AND sp.is_active = true";
      whereClause += " AND (sp.valid_until IS NULL OR sp.valid_until > NOW())";
      whereClause += " AND (sp.max_uses IS NULL OR sp.current_uses < sp.max_uses)";
    }

    const packages: ServicePackage[] = [];

    const packagesQuery = await db.rawQuery<any>(
      `SELECT 
        sp.id, sp.freelancer_id, sp.name, sp.description,
        sp.discount_percent, sp.discount_amount_pence,
        sp.is_active, sp.image_url, sp.valid_until,
        sp.max_uses, sp.current_uses, sp.created_at, sp.updated_at
      FROM service_packages sp
      ${whereClause}
      ORDER BY sp.created_at DESC`,
      params
    );

    for (const pkg of packagesQuery.rows) {
      // Get services in this package
      const servicesQuery = await db.rawQuery<any>(
        `SELECT 
          ps.id, ps.service_id, ps.sort_order,
          s.title, s.duration_minutes, s.studio_price_pence
        FROM package_services ps
        JOIN services s ON s.id = ps.service_id
        WHERE ps.package_id = $1
        ORDER BY ps.sort_order`,
        [pkg.id]
      );

      const services: PackageService[] = servicesQuery.rows.map((s: any) => ({
        id: s.id,
        serviceId: s.service_id,
        title: s.title,
        durationMinutes: s.duration_minutes,
        pricePence: s.studio_price_pence || 0,
        sortOrder: s.sort_order,
      }));

      const originalPricePence = services.reduce((sum, s) => sum + s.pricePence, 0);
      const totalDurationMinutes = services.reduce((sum, s) => sum + s.durationMinutes, 0);

      // Calculate discounted price
      let discountedPricePence = originalPricePence;
      if (pkg.discount_percent > 0) {
        discountedPricePence = Math.round(originalPricePence * (1 - pkg.discount_percent / 100));
      }
      if (pkg.discount_amount_pence > 0) {
        discountedPricePence = Math.max(0, discountedPricePence - pkg.discount_amount_pence);
      }

      packages.push({
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
      });
    }

    return { packages };
  }
);

