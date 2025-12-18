import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import db from "../db";

export interface DashboardBooking {
  id: number;
  serviceTitle: string;
  clientName: string;
  startDatetime: string;
  endDatetime: string;
  status: string;
  totalPricePence: number;
  locationType: string;
}

export interface DashboardStats {
  todayBookings: DashboardBooking[];
  upcomingBookings: DashboardBooking[];
  recentActivity: DashboardBooking[];
  weeklyCalendar: WeeklyCalendarData;
  statistics: {
    totalBookings: number;
    pendingRequests: number;
    confirmedThisWeek: number;
    totalRevenueThisWeek: number;
    completedThisMonth: number;
  };
}

export interface WeeklyCalendarData {
  weekStart: string;
  weekEnd: string;
  days: DayBookings[];
}

export interface DayBookings {
  date: string;
  dayName: string;
  bookings: DashboardBooking[];
}

export const getDashboardStats = api<void, DashboardStats>(
  { auth: true, expose: true, method: "GET", path: "/bookings/dashboard-stats" },
  async () => {
    const auth = getAuthData()! as AuthData;
    
    if (!auth.isVerified) {
      return {
        todayBookings: [],
        upcomingBookings: [],
        recentActivity: [],
        weeklyCalendar: {
          weekStart: new Date().toISOString(),
          weekEnd: new Date().toISOString(),
          days: [],
        },
        statistics: {
          totalBookings: 0,
          pendingRequests: 0,
          confirmedThisWeek: 0,
          totalRevenueThisWeek: 0,
          completedThisMonth: 0,
        },
      };
    }
    
    const userId = auth.userID;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayBookingsRows = await db.queryAll<{
      id: number;
      service_title: string;
      client_name: string;
      start_datetime: Date;
      end_datetime: Date;
      status: string;
      total_price_pence: number;
      location_type: string;
    }>`
      SELECT 
        b.id, s.title as service_title,
        u.first_name || ' ' || u.last_name as client_name,
        b.start_datetime, b.end_datetime, b.status,
        b.total_price_pence, b.location_type
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users u ON b.client_id = u.id
      WHERE b.freelancer_id = ${userId}
        AND b.start_datetime >= ${todayStart}
        AND b.start_datetime < ${todayEnd}
        AND b.status IN ('CONFIRMED', 'PENDING')
      ORDER BY b.start_datetime ASC
    `;

    const upcomingBookingsRows = await db.queryAll<{
      id: number;
      service_title: string;
      client_name: string;
      start_datetime: Date;
      end_datetime: Date;
      status: string;
      total_price_pence: number;
      location_type: string;
    }>`
      SELECT 
        b.id, s.title as service_title,
        u.first_name || ' ' || u.last_name as client_name,
        b.start_datetime, b.end_datetime, b.status,
        b.total_price_pence, b.location_type
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users u ON b.client_id = u.id
      WHERE b.freelancer_id = ${userId}
        AND b.start_datetime >= ${now}
        AND b.status IN ('CONFIRMED', 'PENDING')
      ORDER BY b.start_datetime ASC
      LIMIT 10
    `;

    const recentActivityRows = await db.queryAll<{
      id: number;
      service_title: string;
      client_name: string;
      start_datetime: Date;
      end_datetime: Date;
      status: string;
      total_price_pence: number;
      location_type: string;
    }>`
      SELECT 
        b.id, s.title as service_title,
        u.first_name || ' ' || u.last_name as client_name,
        b.start_datetime, b.end_datetime, b.status,
        b.total_price_pence, b.location_type
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users u ON b.client_id = u.id
      WHERE b.freelancer_id = ${userId}
      ORDER BY b.created_at DESC
      LIMIT 10
    `;

    const weeklyBookingsRows = await db.queryAll<{
      id: number;
      service_title: string;
      client_name: string;
      start_datetime: Date;
      end_datetime: Date;
      status: string;
      total_price_pence: number;
      location_type: string;
    }>`
      SELECT 
        b.id, s.title as service_title,
        u.first_name || ' ' || u.last_name as client_name,
        b.start_datetime, b.end_datetime, b.status,
        b.total_price_pence, b.location_type
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users u ON b.client_id = u.id
      WHERE b.freelancer_id = ${userId}
        AND b.start_datetime >= ${weekStart}
        AND b.start_datetime < ${weekEnd}
        AND b.status IN ('CONFIRMED', 'PENDING', 'COMPLETED')
      ORDER BY b.start_datetime ASC
    `;

    const totalBookingsResult = await db.queryRow<{ count: number }>`
      SELECT COUNT(*) as count
      FROM bookings
      WHERE freelancer_id = ${userId}
    `;

    const pendingRequestsResult = await db.queryRow<{ count: number }>`
      SELECT COUNT(*) as count
      FROM bookings
      WHERE freelancer_id = ${userId} AND status = 'PENDING'
    `;

    const confirmedThisWeekResult = await db.queryRow<{ count: number }>`
      SELECT COUNT(*) as count
      FROM bookings
      WHERE freelancer_id = ${userId}
        AND status = 'CONFIRMED'
        AND created_at >= ${weekStart}
    `;

    const revenueThisWeekResult = await db.queryRow<{ total: number | null }>`
      SELECT SUM(total_price_pence) as total
      FROM bookings
      WHERE freelancer_id = ${userId}
        AND status IN ('CONFIRMED', 'COMPLETED')
        AND created_at >= ${weekStart}
    `;

    const completedThisMonthResult = await db.queryRow<{ count: number }>`
      SELECT COUNT(*) as count
      FROM bookings
      WHERE freelancer_id = ${userId}
        AND status = 'COMPLETED'
        AND end_datetime >= ${monthStart}
    `;

    const mapBooking = (row: {
      id: number;
      service_title: string;
      client_name: string;
      start_datetime: Date;
      end_datetime: Date;
      status: string;
      total_price_pence: number;
      location_type: string;
    }): DashboardBooking => ({
      id: row.id,
      serviceTitle: row.service_title,
      clientName: row.client_name,
      startDatetime: row.start_datetime.toISOString(),
      endDatetime: row.end_datetime.toISOString(),
      status: row.status,
      totalPricePence: row.total_price_pence,
      locationType: row.location_type,
    });

    const days: DayBookings[] = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + i);
      const nextDay = new Date(dayDate);
      nextDay.setDate(dayDate.getDate() + 1);

      const dayBookings = weeklyBookingsRows
        .filter(b => {
          const bookingDate = new Date(b.start_datetime);
          return bookingDate >= dayDate && bookingDate < nextDay;
        })
        .map(mapBooking);

      days.push({
        date: dayDate.toISOString(),
        dayName: dayDate.toLocaleDateString('en-US', { weekday: 'short' }),
        bookings: dayBookings,
      });
    }

    return {
      todayBookings: todayBookingsRows.map(mapBooking),
      upcomingBookings: upcomingBookingsRows.map(mapBooking),
      recentActivity: recentActivityRows.map(mapBooking),
      weeklyCalendar: {
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        days,
      },
      statistics: {
        totalBookings: totalBookingsResult?.count || 0,
        pendingRequests: pendingRequestsResult?.count || 0,
        confirmedThisWeek: confirmedThisWeekResult?.count || 0,
        totalRevenueThisWeek: revenueThisWeekResult?.total || 0,
        completedThisMonth: completedThisMonthResult?.count || 0,
      },
    };
  }
);
