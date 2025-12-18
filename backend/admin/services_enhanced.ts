import { api } from "encore.dev/api";
import db from "../db";
import { requireAdminPermission } from "./rbac";
import { APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";

export interface ServiceListFilters {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  city?: string;
  status?: "active" | "inactive";
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "created_at" | "title" | "price" | "bookings";
  sortOrder?: "asc" | "desc";
}

export interface ServiceListItem {
  id: number;
  title: string;
  category: string;
  subcategory: string | null;
  freelancerId: string;
  freelancerName: string;
  freelancerCity: string | null;
  basePricePence: number | null;
  durationMinutes: number;
  isActive: boolean;
  bookingCount: number;
  averageRating: number | null;
  createdAt: string;
}

export interface ServiceListResponse {
  services: ServiceListItem[];
  total: number;
  page: number;
  totalPages: number;
}

export const listServicesEnhanced = api<ServiceListFilters, ServiceListResponse>(
  { method: "GET", path: "/admin/services/enhanced", expose: true, auth: true },
  async (req): Promise<ServiceListResponse> => {
    await requireAdminPermission("services", "view");

    const page = req.page || 1;
    const limit = Math.min(req.limit || 20, 100);
    const offset = (page - 1) * limit;
    const sortBy = req.sortBy || "created_at";
    const sortOrder = req.sortOrder || "desc";

    const conditions: string[] = ["1=1"];
    const params: any[] = [];
    let paramIndex = 1;

    if (req.category) {
      conditions.push(`s.category = $${paramIndex++}`);
      params.push(req.category);
    }

    if (req.priceMin !== undefined) {
      conditions.push(`COALESCE(s.studio_price_pence, s.mobile_price_pence, s.base_price_pence) >= $${paramIndex++}`);
      params.push(req.priceMin);
    }

    if (req.priceMax !== undefined) {
      conditions.push(`COALESCE(s.studio_price_pence, s.mobile_price_pence, s.base_price_pence) <= $${paramIndex++}`);
      params.push(req.priceMax);
    }

    if (req.city) {
      conditions.push(`fp.city = $${paramIndex++}`);
      params.push(req.city);
    }

    if (req.status) {
      conditions.push(`s.is_active = $${paramIndex++}`);
      params.push(req.status === "active");
    }

    if (req.search) {
      conditions.push(`(s.title ILIKE $${paramIndex} OR s.description ILIKE $${paramIndex})`);
      params.push(`%${req.search}%`);
      paramIndex++;
    }

    const whereClause = conditions.join(" AND ");

    // Get total count
    const countResult = await db.rawQueryRow<{ count: number }>(
      `SELECT COUNT(*)::int as count
       FROM services s
       LEFT JOIN freelancer_profiles fp ON s.freelancer_id = fp.user_id
       WHERE ${whereClause}`,
      ...params
    );

    const total = countResult?.count || 0;

    // Get services
    params.push(limit, offset);
    const servicesGen = db.rawQuery<ServiceListItem>(
      `SELECT 
        s.id,
        s.title,
        s.category,
        s.subcategory,
        s.freelancer_id as "freelancerId",
        u.name as "freelancerName",
        fp.city as "freelancerCity",
        COALESCE(s.studio_price_pence, s.mobile_price_pence, s.base_price_pence) as "basePricePence",
        s.duration_minutes as "durationMinutes",
        s.is_active as "isActive",
        COALESCE(bc.booking_count, 0)::int as "bookingCount",
        sr.avg_rating as "averageRating",
        s.created_at as "createdAt"
       FROM services s
       JOIN users u ON s.freelancer_id = u.id
       LEFT JOIN freelancer_profiles fp ON s.freelancer_id = fp.user_id
       LEFT JOIN (
         SELECT service_id, COUNT(*) as booking_count
         FROM bookings
         GROUP BY service_id
       ) bc ON s.id = bc.service_id
       LEFT JOIN (
         SELECT b.service_id, AVG(r.rating)::numeric(3,2) as avg_rating
         FROM reviews r
         JOIN bookings b ON r.booking_id = b.id
         WHERE r.is_removed = false
         GROUP BY b.service_id
       ) sr ON s.id = sr.service_id
       WHERE ${whereClause}
       ORDER BY s.${sortBy === 'bookings' ? `(SELECT COUNT(*) FROM bookings WHERE service_id = s.id)` : sortBy} ${sortOrder}
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      ...params
    );

    const services: ServiceListItem[] = [];
    for await (const service of servicesGen) {
      services.push(service);
    }

    return {
      services,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
);

// Activate/deactivate service
export const updateServiceStatus = api(
  { method: "PUT", path: "/admin/services/:serviceId/status", expose: true, auth: true },
  async (req: { serviceId: number; isActive: boolean; reason?: string }): Promise<{ success: boolean }> => {
    await requireAdminPermission("services", "deactivate");
    const auth = getAuthData()!;

    await db.exec`
      UPDATE services 
      SET is_active = ${req.isActive}, updated_at = NOW()
      WHERE id = ${req.serviceId}
    `;

    // Log the action
    await db.exec`
      INSERT INTO admin_audit_log (admin_id, action, target_type, target_id, details)
      VALUES (
        ${auth.userID}, 
        ${req.isActive ? 'activate_service' : 'deactivate_service'}, 
        'service', 
        ${req.serviceId.toString()}, 
        ${JSON.stringify({ isActive: req.isActive, reason: req.reason })}
      )
    `;

    return { success: true };
  }
);

