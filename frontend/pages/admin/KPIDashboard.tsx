import { useEffect, useState } from "react";
import backend from "@/lib/backend";
import { Card } from "@/components/ui/card";
import { BarChart, TrendingUp, Users, Star, AlertTriangle, DollarSign } from "lucide-react";

interface KPIData {
  verifiedFreelancersByCity: { city: string; count: number }[];
  completedBookingsPerMonth: { month: string; count: number }[];
  repeatClientPercentage: number;
  averageRating: number;
  cancellationRate: number;
  disputeRatePer100: number;
  gmvPounds: number;
  revenuePounds: number;
}

export default function KPIDashboard() {
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKPIs();
  }, []);

  const loadKPIs = async () => {
    try {
      const data = await backend.analytics.getKPIs();
      setKpis(data);
    } catch (err) {
      console.error("Failed to load KPIs:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading KPIs...</div>
      </div>
    );
  }

  if (!kpis) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">Failed to load KPIs</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Operational Dashboard</h1>
        <p className="text-muted-foreground mt-1">Key performance indicators for Braida marketplace</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-3xl font-bold">{kpis.averageRating.toFixed(1)}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Repeat Clients</p>
                <p className="text-3xl font-bold">{kpis.repeatClientPercentage.toFixed(1)}%</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cancellation Rate</p>
                <p className="text-3xl font-bold">{kpis.cancellationRate.toFixed(1)}%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Disputes/100</p>
                <p className="text-3xl font-bold">{kpis.disputeRatePer100.toFixed(2)}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Revenue</h2>
              <DollarSign className="h-6 w-6 text-green-500" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">GMV</span>
                <span className="font-semibold">£{kpis.gmvPounds.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Revenue</span>
                <span className="font-semibold">£{kpis.revenuePounds.toLocaleString()}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Verified Freelancers by City</h2>
              <BarChart className="h-6 w-6 text-purple-500" />
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {kpis.verifiedFreelancersByCity.slice(0, 10).map((city) => (
                <div key={city.city} className="flex justify-between items-center">
                  <span className="text-sm">{city.city}</span>
                  <span className="font-semibold">{city.count}</span>
                </div>
              ))}
            </div>
        </Card>
      </div>

      <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Completed Bookings (Last 12 Months)</h2>
            <TrendingUp className="h-6 w-6 text-teal-500" />
          </div>
          <div className="space-y-2">
            {kpis.completedBookingsPerMonth.map((month) => (
              <div key={month.month} className="flex justify-between items-center border-b pb-2">
                <span className="text-sm">{month.month}</span>
                <span className="font-semibold">{month.count}</span>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
