import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import db from "../db";

export interface ListBookingsRequest {
  role?: 'client' | 'freelancer';
  status?: string;
  page?: number;
  limit?: number;
}

export interface BookingSummary {
  id: number;
  serviceTitle: string;
  startDatetime: string;
  endDatetime: string;
  locationType: string;
  totalPricePence: number;
  status: string;
  paymentStatus: string;
  expiresAt: string | null;
  otherPartyName: string;
  createdAt: string;
}

export interface ListBookingsResponse {
  bookings: BookingSummary[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export const list = api<ListBookingsRequest, ListBookingsResponse>(
  { auth: true, expose: true, method: "GET", path: "/bookings" },
  async (req) => {
    const auth = getAuthData()! as AuthData;
    
    const page = req.page || 1;
    const limit = req.limit || 20;
    
    try {
    const role = req.role || (auth.role === 'FREELANCER' ? 'freelancer' : 'client');
    const offset = (page - 1) * limit;

    let rows: {
      id: number;
      service_title: string;
      start_datetime: Date;
      end_datetime: Date;
      location_type: string;
      total_price_pence: number;
      status: string;
      payment_status: string;
      expires_at: Date | null;
      other_party_name: string;
      created_at: Date;
    }[];

    if (role === 'client') {
      if (req.status) {
        rows = await db.queryAll<{
          id: number;
          service_title: string;
          start_datetime: Date;
          end_datetime: Date;
          location_type: string;
          total_price_pence: number;
          status: string;
          payment_status: string;
          expires_at: Date | null;
          other_party_name: string;
          created_at: Date;
        }>`
          SELECT 
            b.id, s.title as service_title,
            b.start_datetime, b.end_datetime, b.location_type,
            b.total_price_pence, b.status, b.payment_status, b.expires_at, b.created_at,
            fp.display_name as other_party_name
          FROM bookings b
          JOIN services s ON b.service_id = s.id
          JOIN freelancer_profiles fp ON b.freelancer_id = fp.user_id
          WHERE b.client_id = ${auth.userID} AND b.status = ${req.status}
          ORDER BY b.created_at DESC
          LIMIT ${limit + 1} OFFSET ${offset}
        `;
      } else {
        rows = await db.queryAll<{
          id: number;
          service_title: string;
          start_datetime: Date;
          end_datetime: Date;
          location_type: string;
          total_price_pence: number;
          status: string;
          payment_status: string;
          expires_at: Date | null;
          other_party_name: string;
          created_at: Date;
        }>`
          SELECT 
            b.id, s.title as service_title,
            b.start_datetime, b.end_datetime, b.location_type,
            b.total_price_pence, b.status, b.payment_status, b.expires_at, b.created_at,
            fp.display_name as other_party_name
          FROM bookings b
          JOIN services s ON b.service_id = s.id
          JOIN freelancer_profiles fp ON b.freelancer_id = fp.user_id
          WHERE b.client_id = ${auth.userID}
          ORDER BY b.created_at DESC
          LIMIT ${limit + 1} OFFSET ${offset}
        `;
      }
    } else {
      if (req.status) {
        rows = await db.queryAll<{
          id: number;
          service_title: string;
          start_datetime: Date;
          end_datetime: Date;
          location_type: string;
          total_price_pence: number;
          status: string;
          payment_status: string;
          expires_at: Date | null;
          other_party_name: string;
          created_at: Date;
        }>`
          SELECT 
            b.id, s.title as service_title,
            b.start_datetime, b.end_datetime, b.location_type,
            b.total_price_pence, b.status, b.payment_status, b.expires_at, b.created_at,
            u.first_name || ' ' || u.last_name as other_party_name
          FROM bookings b
          JOIN services s ON b.service_id = s.id
          JOIN users u ON b.client_id = u.id
          WHERE b.freelancer_id = ${auth.userID} AND b.status = ${req.status}
          ORDER BY b.created_at DESC
          LIMIT ${limit + 1} OFFSET ${offset}
        `;
      } else {
        rows = await db.queryAll<{
          id: number;
          service_title: string;
          start_datetime: Date;
          end_datetime: Date;
          location_type: string;
          total_price_pence: number;
          status: string;
          payment_status: string;
          expires_at: Date | null;
          other_party_name: string;
          created_at: Date;
        }>`
          SELECT 
            b.id, s.title as service_title,
            b.start_datetime, b.end_datetime, b.location_type,
            b.total_price_pence, b.status, b.payment_status, b.expires_at, b.created_at,
            u.first_name || ' ' || u.last_name as other_party_name
          FROM bookings b
          JOIN services s ON b.service_id = s.id
          JOIN users u ON b.client_id = u.id
          WHERE b.freelancer_id = ${auth.userID}
          ORDER BY b.created_at DESC
          LIMIT ${limit + 1} OFFSET ${offset}
        `;
      }
    }

    const hasMore = rows.length > limit;
    const resultsToReturn = hasMore ? rows.slice(0, limit) : rows;

    let total: number;
    if (role === 'client') {
      if (req.status) {
        const countRow = await db.queryRow<{ count: number }>`
          SELECT COUNT(*) as count FROM bookings WHERE client_id = ${auth.userID} AND status = ${req.status}
        `;
        total = countRow?.count || 0;
      } else {
        const countRow = await db.queryRow<{ count: number }>`
          SELECT COUNT(*) as count FROM bookings WHERE client_id = ${auth.userID}
        `;
        total = countRow?.count || 0;
      }
    } else {
      if (req.status) {
        const countRow = await db.queryRow<{ count: number }>`
          SELECT COUNT(*) as count FROM bookings WHERE freelancer_id = ${auth.userID} AND status = ${req.status}
        `;
        total = countRow?.count || 0;
      } else {
        const countRow = await db.queryRow<{ count: number }>`
          SELECT COUNT(*) as count FROM bookings WHERE freelancer_id = ${auth.userID}
        `;
        total = countRow?.count || 0;
      }
    }

    return {
      bookings: resultsToReturn.map(row => ({
        id: row.id,
        serviceTitle: row.service_title,
        startDatetime: row.start_datetime.toISOString(),
        endDatetime: row.end_datetime.toISOString(),
        locationType: row.location_type,
        totalPricePence: row.total_price_pence,
        status: row.status,
        paymentStatus: row.payment_status,
        expiresAt: row.expires_at?.toISOString() || null,
        otherPartyName: row.other_party_name,
        createdAt: row.created_at.toISOString(),
      })),
      total,
      page,
      limit,
      hasMore,
    };
    } catch (error) {
      console.error('Error listing bookings:', error);
      return {
        bookings: [],
        total: 0,
        page,
        limit,
        hasMore: false,
      };
    }
  }
);
