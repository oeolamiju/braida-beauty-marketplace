import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MapPin,
  Users,
  Calendar,
  DollarSign,
  Star,
  TrendingUp,
  Clock,
  Download,
  RefreshCw,
} from "lucide-react";
import backend from "@/lib/backend";

interface CityMetrics {
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

export default function CityAnalytics() {
  const [metrics, setMetrics] = useState<CityMetrics[]>([]);
  const [totals, setTotals] = useState<any>(null);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30d");
  const [selectedCities, setSelectedCities] = useState<string[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange, selectedCities]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (dateRange) {
        case "7d":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(startDate.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(startDate.getDate() - 90);
          break;
        case "1y":
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      const response = await backend.analytics.getCityAnalytics({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        cities: selectedCities.length > 0 ? selectedCities : undefined,
      });

      setMetrics(response.metrics);
      setTotals(response.totals);
      setAvailableCities(response.availableCities);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (pence: number) => `£${(pence / 100).toLocaleString()}`;

  const exportToCSV = () => {
    const headers = [
      "City", "Total Users", "Freelancers", "Verified", "Clients",
      "Bookings", "Completed", "Cancelled", "Disputed",
      "Repeat %", "Avg Rating", "Cancel Rate %", "Dispute Rate %",
      "GMV", "Revenue", "Avg Response (min)"
    ];
    
    const rows = metrics.map(m => [
      m.city, m.totalUsers, m.totalFreelancers, m.verifiedFreelancers, m.totalClients,
      m.totalBookings, m.completedBookings, m.cancelledBookings, m.disputedBookings,
      m.repeatClientPercentage, m.averageRating, m.cancellationRate, m.disputeRate,
      m.gmvPence / 100, m.revenuePence / 100, m.avgFreelancerResponseMinutes
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `city-analytics-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">City Analytics</h1>
          <p className="text-muted-foreground">
            Performance metrics across all active cities
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadAnalytics} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {totals && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{totals.totalUsers.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{totals.totalFreelancers.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Freelancers</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{totals.totalClients.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Clients</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{totals.totalBookings.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Bookings</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-emerald-500" />
              <div>
                <p className="text-2xl font-bold">{formatPrice(totals.gmvPence)}</p>
                <p className="text-xs text-muted-foreground">GMV</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{formatPrice(totals.revenuePence)}</p>
                <p className="text-xs text-muted-foreground">Revenue</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* City Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>City</TableHead>
                <TableHead className="text-right">Users</TableHead>
                <TableHead className="text-right">Freelancers</TableHead>
                <TableHead className="text-right">Verified</TableHead>
                <TableHead className="text-right">Bookings</TableHead>
                <TableHead className="text-right">Completed</TableHead>
                <TableHead className="text-right">Repeat %</TableHead>
                <TableHead className="text-right">Rating</TableHead>
                <TableHead className="text-right">Cancel %</TableHead>
                <TableHead className="text-right">Dispute %</TableHead>
                <TableHead className="text-right">GMV</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Avg Response</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={13} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : metrics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} className="text-center py-8 text-muted-foreground">
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                metrics.map((m) => (
                  <TableRow key={m.city}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {m.city}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{m.totalUsers.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{m.totalFreelancers.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <span className="text-green-600">{m.verifiedFreelancers}</span>
                    </TableCell>
                    <TableCell className="text-right">{m.totalBookings.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <span className="text-green-600">{m.completedBookings}</span>
                    </TableCell>
                    <TableCell className="text-right">{m.repeatClientPercentage}%</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        {m.averageRating.toFixed(1)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={m.cancellationRate > 10 ? "text-red-600" : ""}>
                        {m.cancellationRate}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={m.disputeRate > 5 ? "text-red-600" : ""}>
                        {m.disputeRate}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(m.gmvPence)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatPrice(m.revenuePence)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {m.avgFreelancerResponseMinutes}m
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

