import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { ServicePackage, PackageService } from "./types";

export interface CreatePackageRequest {
  name: string;
  description?: string;
  serviceIds: number[];
  discountPercent?: number;
  discountAmountPence?: number;
  imageUrl?: string;
  validUntil?: string;
  maxUses?: number;
}

export interface CreatePackageResponse {
  package: ServicePackage;
}

export const createPackage = api<CreatePackageRequest, CreatePackageResponse>(
  { method: "POST", path: "/packages", expose: true, auth: true },
  async (req): Promise<CreatePackageResponse> => {
    const auth = getAuthData()!;

    // Verify user is a freelancer
    const user = await db.queryRow<{ role: string }>`
      SELECT role FROM users WHERE id = ${auth.userID}
    `;

    if (!user || user.role !== "FREELANCER") {
      throw APIError.permissionDenied("Only freelancers can create packages");
    }

    // Validate request
    if (!req.name || req.name.trim().length === 0) {
      throw APIError.invalidArgument("Package name is required");
    }

    if (req.serviceIds.length < 2) {
      throw APIError.invalidArgument("Package must include at least 2 services");
    }

    if (req.serviceIds.length > 10) {
      throw APIError.invalidArgument("Package cannot include more than 10 services");
    }

    if (req.discountPercent !== undefined && (req.discountPercent < 0 || req.discountPercent > 50)) {
      throw APIError.invalidArgument("Discount percent must be between 0 and 50");
    }

    // Verify all services belong to this freelancer
    const servicesQuery = db.query<{
      id: number;
      title: string;
      duration_minutes: number;
      studio_price_pence: number | null;
      freelancer_id: string;
      is_active: boolean;
    }>`
      SELECT id, title, duration_minutes, studio_price_pence, freelancer_id, is_active
      FROM services
      WHERE id = ANY(${req.serviceIds})
    `;

    const services: any[] = [];
    for await (const service of servicesQuery) {
      services.push(service);
    }

    if (services.length !== req.serviceIds.length) {
      throw APIError.notFound("One or more services not found");
    }

    for (const service of services) {
      if (service.freelancer_id !== auth.userID) {
        throw APIError.permissionDenied("All services must belong to you");
      }
      if (!service.is_active) {
        throw APIError.invalidArgument(`Service "${service.title}" is not active`);
      }
    }

    // Create package
    const packageResult = await db.queryRow<{ id: number; created_at: Date; updated_at: Date }>`
      INSERT INTO service_packages (
        freelancer_id, name, description,
        discount_percent, discount_amount_pence,
        image_url, valid_until, max_uses
      ) VALUES (
        ${auth.userID}, ${req.name.trim()}, ${req.description || null},
        ${req.discountPercent || 0}, ${req.discountAmountPence || 0},
        ${req.imageUrl || null}, ${req.validUntil ? new Date(req.validUntil) : null}, ${req.maxUses || null}
      )
      RETURNING id, created_at, updated_at
    `;

    if (!packageResult) {
      throw APIError.internal("Failed to create package");
    }

    // Add services to package
    for (let i = 0; i < req.serviceIds.length; i++) {
      await db.exec`
        INSERT INTO package_services (package_id, service_id, sort_order)
        VALUES (${packageResult.id}, ${req.serviceIds[i]}, ${i})
      `;
    }

    // Build response
    const packageServices: PackageService[] = [];
    const orderedServices = req.serviceIds.map(id => services.find(s => s.id === id)!);

    for (let i = 0; i < orderedServices.length; i++) {
      const service = orderedServices[i];
      packageServices.push({
        id: i + 1,
        serviceId: service.id,
        title: service.title,
        durationMinutes: service.duration_minutes,
        pricePence: service.studio_price_pence || 0,
        sortOrder: i,
      });
    }

    const originalPricePence = packageServices.reduce((sum, s) => sum + s.pricePence, 0);
    const totalDurationMinutes = packageServices.reduce((sum, s) => sum + s.durationMinutes, 0);

    let discountedPricePence = originalPricePence;
    if (req.discountPercent && req.discountPercent > 0) {
      discountedPricePence = Math.round(originalPricePence * (1 - req.discountPercent / 100));
    }
    if (req.discountAmountPence && req.discountAmountPence > 0) {
      discountedPricePence = Math.max(0, discountedPricePence - req.discountAmountPence);
    }

    return {
      package: {
        id: packageResult.id,
        freelancerId: auth.userID,
        name: req.name.trim(),
        description: req.description || null,
        discountPercent: req.discountPercent || 0,
        discountAmountPence: req.discountAmountPence || 0,
        isActive: true,
        imageUrl: req.imageUrl || null,
        validUntil: req.validUntil || null,
        maxUses: req.maxUses || null,
        currentUses: 0,
        services: packageServices,
        originalPricePence,
        discountedPricePence,
        totalDurationMinutes,
        createdAt: packageResult.created_at.toISOString(),
        updatedAt: packageResult.updated_at.toISOString(),
      },
    };
  }
);

