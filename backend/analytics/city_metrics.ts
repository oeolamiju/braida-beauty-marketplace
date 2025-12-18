import { api } from "encore.dev/api";
import db from "../db";
import { requireAdminPermission } from "../admin/rbac";

export interface CityMetrics {
  city: string;
  totalUsers: number;
  totalFreelancers: number;
  verifiedFreelancers: number;
  totalClients: number;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  disputedBookings: number;
  repeatClientPercentage: number;
  averageRating: number;
  cancellationRate: number;
  disputeRate: number;
  gmvPence: number;
  revenuePence: number;
  avgFreelancerResponseMinutes: number;
}

export interface CityAnalyticsRequest {
  startDate?: string;
  endDate?: string;
  cities?: string[];
}

export interface CityAnalyticsResponse {
  metrics: CityMetrics[];
  totals: {
    totalUsers: number;
    totalFreelancers: number;
    totalClients: number;
    totalBookings: number;
    gmvPence: number;
    revenuePence: number;
  };
  availableCities: string[];
}

export const getCityAnalytics = api<CityAnalyticsRequest, CityAnalyticsResponse>(
  { method: "GET", path: "/analytics/cities", expose: true, auth: true },
  async (req): Promise<CityAnalyticsResponse> => {
    await requireAdminPermission("analytics", "view");

    const startDate = req.startDate ? new Date(req.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.endDate ? new Date(req.endDate) : new Date();

    // Get all available cities
    const citiesGen = db.query<{ city: string }>`
      SELECT DISTINCT city FROM freelancer_profiles 
      WHERE city IS NOT NULL AND city != ''
      ORDER BY city
    `;

    const availableCities: string[] = [];
    for await (const row of citiesGen) {
      availableCities.push(row.city);
    }

    const targetCities = req.cities?.length ? req.cities : availableCities;
    const metrics: CityMetrics[] = [];

    for (const city of targetCities) {
      // User counts
      const userCounts = await db.queryRow<{
        total_freelancers: number;
        verified_freelancers: number;
      }>`
        SELECT 
          COUNT(*)::int as total_freelancers,
          COUNT(*) FILTER (WHERE verification_status = 'verified')::int as verified_freelancers
        FROM freelancer_profiles
        WHERE city = ${city}
      `;

      const clientCount = await db.queryRow<{ count: number }>`
        SELECT COUNT(DISTINCT b.client_id)::int as count
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        JOIN freelancer_profiles fp ON s.freelancer_id = fp.user_id
        WHERE fp.city = ${city}
          AND b.created_at >= ${startDate}
          AND b.created_at <= ${endDate}
      `;

      // Booking metrics
      const bookingStats = await db.queryRow<{
        total_bookings: number;
        completed_bookings: number;
        cancelled_bookings: number;
        disputed_bookings: number;
        gmv_pence: number;
        revenue_pence: number;
      }>`
        SELECT 
          COUNT(*)::int as total_bookings,
          COUNT(*) FILTER (WHERE b.status = 'completed')::int as completed_bookings,
          COUNT(*) FILTER (WHERE b.status = 'cancelled')::int as cancelled_bookings,
          COUNT(*) FILTER (WHERE b.status = 'disputed')::int as disputed_bookings,
          COALESCE(SUM(b.total_price_pence) FILTER (WHERE b.status = 'completed'), 0)::int as gmv_pence,
          COALESCE(SUM(p.platform_fee_pence) FILTER (WHERE p.status = 'succeeded'), 0)::int as revenue_pence
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        JOIN freelancer_profiles fp ON s.freelancer_id = fp.user_id
        LEFT JOIN payments p ON b.id = p.booking_id
        WHERE fp.city = ${city}
          AND b.created_at >= ${startDate}
          AND b.created_at <= ${endDate}
      `;

      // Repeat clients
      const repeatClients = await db.queryRow<{ percentage: number }>`
        WITH client_bookings AS (
          SELECT b.client_id, COUNT(*) as booking_count
          FROM bookings b
          JOIN services s ON b.service_id = s.id
          JOIN freelancer_profiles fp ON s.freelancer_id = fp.user_id
          WHERE fp.city = ${city}
            AND b.created_at >= ${startDate}
            AND b.created_at <= ${endDate}
            AND b.status = 'completed'
          GROUP BY b.client_id
        )
        SELECT 
          CASE 
            WHEN COUNT(*) = 0 THEN 0
            ELSE (COUNT(*) FILTER (WHERE booking_count > 1)::float / COUNT(*) * 100)::numeric(5,2)
          END as percentage
        FROM client_bookings
      `;

      // Average rating
      const avgRating = await db.queryRow<{ avg_rating: number }>`
        SELECT COALESCE(AVG(r.rating), 0)::numeric(3,2) as avg_rating
        FROM reviews r
        JOIN bookings b ON r.booking_id = b.id
        JOIN services s ON b.service_id = s.id
        JOIN freelancer_profiles fp ON s.freelancer_id = fp.user_id
        WHERE fp.city = ${city}
          AND r.created_at >= ${startDate}
          AND r.created_at <= ${endDate}
          AND r.is_removed = false
      `;

      // Average response time
      const avgResponse = await db.queryRow<{ avg_minutes: number }>`
        SELECT COALESCE(
          AVG(EXTRACT(EPOCH FROM (bal.created_at - b.created_at)) / 60),
          0
        )::int as avg_minutes
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        JOIN freelancer_profiles fp ON s.freelancer_id = fp.user_id
        JOIN booking_audit_log bal ON b.id = bal.booking_id AND bal.action = 'accepted'
        WHERE fp.city = ${city}
          AND b.created_at >= ${startDate}
          AND b.created_at <= ${endDate}
      `;

      const totalBookings = bookingStats?.total_bookings || 0;

      metrics.push({
        city,
        totalUsers: (userCounts?.total_freelancers || 0) + (clientCount?.count || 0),
        totalFreelancers: userCounts?.total_freelancers || 0,
        verifiedFreelancers: userCounts?.verified_freelancers || 0,
        totalClients: clientCount?.count || 0,
        totalBookings,
        completedBookings: bookingStats?.completed_bookings || 0,
        cancelledBookings: bookingStats?.cancelled_bookings || 0,
        disputedBookings: bookingStats?.disputed_bookings || 0,
        repeatClientPercentage: repeatClients?.percentage || 0,
        averageRating: avgRating?.avg_rating || 0,
        cancellationRate: totalBookings > 0 
          ? Number(((bookingStats?.cancelled_bookings || 0) / totalBookings * 100).toFixed(2))
          : 0,
        disputeRate: totalBookings > 0
          ? Number(((bookingStats?.disputed_bookings || 0) / totalBookings * 100).toFixed(2))
          : 0,
        gmvPence: bookingStats?.gmv_pence || 0,
        revenuePence: bookingStats?.revenue_pence || 0,
        avgFreelancerResponseMinutes: avgResponse?.avg_minutes || 0,
      });
    }

    // Calculate totals
    const totals = {
      totalUsers: metrics.reduce((sum, m) => sum + m.totalUsers, 0),
      totalFreelancers: metrics.reduce((sum, m) => sum + m.totalFreelancers, 0),
      totalClients: metrics.reduce((sum, m) => sum + m.totalClients, 0),
      totalBookings: metrics.reduce((sum, m) => sum + m.totalBookings, 0),
      gmvPence: metrics.reduce((sum, m) => sum + m.gmvPence, 0),
      revenuePence: metrics.reduce((sum, m) => sum + m.revenuePence, 0),
    };

    return { metrics, totals, availableCities };
  }
);

// Get list of supported cities for frontend
export const getSupportedCities = api(
  { method: "GET", path: "/cities", expose: true },
  async (): Promise<{ cities: { name: string; displayName: string; freelancerCount: number }[] }> => {
    const citiesGen = db.query<{
      city: string;
      freelancer_count: number;
    }>`
      SELECT 
        city,
        COUNT(*)::int as freelancer_count
      FROM freelancer_profiles
      WHERE city IS NOT NULL AND city != ''
      GROUP BY city
      HAVING COUNT(*) > 0
      ORDER BY COUNT(*) DESC
    `;

    const cities: { name: string; displayName: string; freelancerCount: number }[] = [];
    for await (const row of citiesGen) {
      cities.push({
        name: row.city.toLowerCase().replace(/\s+/g, "-"),
        displayName: row.city,
        freelancerCount: row.freelancer_count,
      });
    }

    // Add default cities if not present
    const defaultCities = ["London", "Birmingham", "Manchester", "Leeds", "Liverpool"];
    for (const city of defaultCities) {
      if (!cities.find(c => c.displayName === city)) {
        cities.push({
          name: city.toLowerCase(),
          displayName: city,
          freelancerCount: 0,
        });
      }
    }

    return { cities };
  }
);

