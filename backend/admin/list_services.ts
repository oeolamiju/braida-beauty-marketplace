import { api } from "encore.dev/api";
import { requireAdmin } from "./middleware";
import { ListServicesRequest, ListServicesResponse, ServiceListItem } from "./types";
import db from "../db";

export const listServices = api(
  { method: "POST", path: "/admin/services/list", expose: true },
  async (req: ListServicesRequest): Promise<ListServicesResponse> => {
    await requireAdmin();

    const limit = req.limit || 50;
    const offset = req.offset || 0;

    let countQuery = `SELECT COUNT(*) as count FROM services s JOIN users u ON s.freelancer_id = u.id WHERE 1=1`;
    let selectQuery = `
      SELECT 
        s.id,
        s.freelancer_id,
        u.full_name as freelancer_name,
        u.email as freelancer_email,
        s.title,
        s.category,
        s.active,
        s.deactivation_reason,
        s.deactivated_at,
        s.base_price,
        s.created_at,
        COALESCE(b.count, 0) as total_bookings,
        COALESCE(r.avg_rating, 0) as average_rating
      FROM services s
      JOIN users u ON s.freelancer_id = u.id
      LEFT JOIN (SELECT service_id, COUNT(*) as count FROM bookings GROUP BY service_id) b ON s.id = b.service_id
      LEFT JOIN (SELECT service_id, AVG(rating) as avg_rating FROM reviews GROUP BY service_id) r ON s.id = r.service_id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (req.category) {
      countQuery += ` AND s.category = $${params.length + 1}`;
      selectQuery += ` AND s.category = $${params.length + 1}`;
      params.push(req.category);
    }

    if (req.active !== undefined) {
      countQuery += ` AND s.active = $${params.length + 1}`;
      selectQuery += ` AND s.active = $${params.length + 1}`;
      params.push(req.active);
    }

    if (req.search) {
      countQuery += ` AND (s.title ILIKE $${params.length + 1} OR u.full_name ILIKE $${params.length + 1} OR u.email ILIKE $${params.length + 1})`;
      selectQuery += ` AND (s.title ILIKE $${params.length + 1} OR u.full_name ILIKE $${params.length + 1} OR u.email ILIKE $${params.length + 1})`;
      params.push(`%${req.search}%`);
    }

    const countResult = await db.rawQueryAll(countQuery, ...params);
    const total = countResult[0]?.count || 0;

    selectQuery += ` ORDER BY s.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const servicesResult = await db.rawQueryAll(selectQuery, ...params);

    const services: ServiceListItem[] = servicesResult.map((row: any) => ({
      id: row.id,
      freelancerId: row.freelancer_id,
      freelancerName: row.freelancer_name,
      freelancerEmail: row.freelancer_email,
      title: row.title,
      category: row.category,
      active: row.active,
      deactivationReason: row.deactivation_reason || undefined,
      deactivatedAt: row.deactivated_at ? new Date(row.deactivated_at) : undefined,
      basePrice: parseFloat(row.base_price),
      totalBookings: parseInt(row.total_bookings) || 0,
      averageRating: parseFloat(row.average_rating) || undefined,
      createdAt: new Date(row.created_at),
    }));

    return { services, total };
  }
);
