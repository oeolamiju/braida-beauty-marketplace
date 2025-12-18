import { api } from "encore.dev/api";
import { requireAdmin } from "./middleware";
import { ListBookingsAdminRequest, ListBookingsAdminResponse, BookingListItem } from "./types";
import db from "../db";

export const listBookings = api(
  { method: "POST", path: "/admin/bookings/list", expose: true },
  async (req: ListBookingsAdminRequest): Promise<ListBookingsAdminResponse> => {
    await requireAdmin();

    const limit = req.limit || 50;
    const offset = req.offset || 0;

    let countQuery = `
      SELECT COUNT(*) as count
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users uf ON b.freelancer_id = uf.id
      JOIN users uc ON b.client_id = uc.id
      WHERE 1=1
    `;
    let selectQuery = `
      SELECT 
        b.id,
        b.service_id,
        s.title as service_title,
        b.freelancer_id,
        uf.full_name as freelancer_name,
        b.client_id,
        uc.full_name as client_name,
        b.status,
        b.scheduled_for,
        b.total_price,
        p.status as payment_status,
        b.created_at
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users uf ON b.freelancer_id = uf.id
      JOIN users uc ON b.client_id = uc.id
      LEFT JOIN payments p ON b.id = p.booking_id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (req.status) {
      countQuery += ` AND b.status = $${params.length + 1}`;
      selectQuery += ` AND b.status = $${params.length + 1}`;
      params.push(req.status);
    }

    if (req.freelancerId) {
      countQuery += ` AND b.freelancer_id = $${params.length + 1}`;
      selectQuery += ` AND b.freelancer_id = $${params.length + 1}`;
      params.push(req.freelancerId);
    }

    if (req.clientId) {
      countQuery += ` AND b.client_id = $${params.length + 1}`;
      selectQuery += ` AND b.client_id = $${params.length + 1}`;
      params.push(req.clientId);
    }

    if (req.startDate) {
      countQuery += ` AND b.scheduled_for >= $${params.length + 1}`;
      selectQuery += ` AND b.scheduled_for >= $${params.length + 1}`;
      params.push(req.startDate);
    }

    if (req.endDate) {
      countQuery += ` AND b.scheduled_for <= $${params.length + 1}`;
      selectQuery += ` AND b.scheduled_for <= $${params.length + 1}`;
      params.push(req.endDate);
    }

    if (req.search) {
      countQuery += ` AND (s.title ILIKE $${params.length + 1} OR uf.full_name ILIKE $${params.length + 1} OR uc.full_name ILIKE $${params.length + 1})`;
      selectQuery += ` AND (s.title ILIKE $${params.length + 1} OR uf.full_name ILIKE $${params.length + 1} OR uc.full_name ILIKE $${params.length + 1})`;
      params.push(`%${req.search}%`);
    }

    const countResult = await db.rawQueryAll(countQuery, ...params);
    const total = countResult[0]?.count || 0;

    selectQuery += ` ORDER BY b.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const bookingsResult = await db.rawQueryAll(selectQuery, ...params);

    const bookings: BookingListItem[] = bookingsResult.map((row: any) => ({
      id: row.id,
      serviceId: row.service_id,
      serviceTitle: row.service_title,
      freelancerId: row.freelancer_id,
      freelancerName: row.freelancer_name,
      clientId: row.client_id,
      clientName: row.client_name,
      status: row.status,
      scheduledFor: new Date(row.scheduled_for),
      totalPrice: parseFloat(row.total_price),
      paymentStatus: row.payment_status || undefined,
      createdAt: new Date(row.created_at),
    }));

    return { bookings, total };
  }
);
