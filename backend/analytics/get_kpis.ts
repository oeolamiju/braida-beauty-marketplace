import { api } from "encore.dev/api";
import { requireAdmin } from "../auth/middleware";
import db from "../db";

export interface KPIMetrics {
  verifiedFreelancersByCity: { city: string; count: number }[];
  completedBookingsPerMonth: { month: string; count: number }[];
  repeatClientPercentage: number;
  averageRating: number;
  cancellationRate: number;
  disputeRatePer100: number;
  gmvPounds: number;
  revenuePounds: number;
}

export const getKPIs = api(
  { method: "GET", path: "/analytics/kpis", expose: true, auth: true },
  async (): Promise<KPIMetrics> => {
    requireAdmin();

    const verifiedFreelancers = await db.queryAll<{ city: string; count: number }>`
      SELECT 
        COALESCE(city, 'Unknown') as city, 
        COUNT(*) as count
      FROM freelancer_profiles
      WHERE verification_status = 'verified'
      GROUP BY city
      ORDER BY count DESC
    `;

    const bookingsPerMonth = await db.queryAll<{ month: string; count: number }>`
      SELECT 
        TO_CHAR(completed_at, 'YYYY-MM') as month,
        COUNT(*) as count
      FROM bookings
      WHERE status = 'completed' AND completed_at IS NOT NULL
      GROUP BY TO_CHAR(completed_at, 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 12
    `;

    const repeatClientData = await db.queryRow<{ total_clients: number; repeat_clients: number }>`
      WITH client_booking_counts AS (
        SELECT client_id, COUNT(*) as booking_count
        FROM bookings
        WHERE status = 'completed'
        GROUP BY client_id
      )
      SELECT 
        COUNT(*) as total_clients,
        COUNT(*) FILTER (WHERE booking_count > 1) as repeat_clients
      FROM client_booking_counts
    `;

    const repeatPercentage = repeatClientData?.total_clients
      ? (repeatClientData.repeat_clients / repeatClientData.total_clients) * 100
      : 0;

    const avgRatingData = await db.queryRow<{ avg_rating: number }>`
      SELECT COALESCE(AVG(rating), 0) as avg_rating
      FROM reviews
      WHERE removed_at IS NULL
    `;

    const cancellationData = await db.queryRow<{ total: number; cancelled: number }>`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled
      FROM bookings
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `;

    const cancellationRate = cancellationData?.total
      ? (cancellationData.cancelled / cancellationData.total) * 100
      : 0;

    const disputeData = await db.queryRow<{ total_bookings: number; total_disputes: number }>`
      SELECT 
        (SELECT COUNT(*) FROM bookings WHERE status IN ('completed', 'cancelled')) as total_bookings,
        (SELECT COUNT(*) FROM disputes) as total_disputes
    `;

    const disputeRate = disputeData?.total_bookings
      ? (disputeData.total_disputes / disputeData.total_bookings) * 100
      : 0;

    const gmvData = await db.queryRow<{ gmv_pence: number; platform_fee_pence: number }>`
      SELECT 
        COALESCE(SUM(amount_pence), 0) as gmv_pence,
        COALESCE(SUM(platform_fee_pence), 0) as platform_fee_pence
      FROM payments
      WHERE status = 'succeeded'
    `;

    return {
      verifiedFreelancersByCity: verifiedFreelancers.map(r => ({
        city: r.city,
        count: Number(r.count),
      })),
      completedBookingsPerMonth: bookingsPerMonth.map(r => ({
        month: r.month,
        count: Number(r.count),
      })),
      repeatClientPercentage: Math.round(repeatPercentage * 10) / 10,
      averageRating: Math.round((avgRatingData?.avg_rating || 0) * 10) / 10,
      cancellationRate: Math.round(cancellationRate * 10) / 10,
      disputeRatePer100: Math.round(disputeRate * 100) / 100,
      gmvPounds: (gmvData?.gmv_pence || 0) / 100,
      revenuePounds: (gmvData?.platform_fee_pence || 0) / 100,
    };
  }
);
