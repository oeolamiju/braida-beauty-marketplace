import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, TrendingUp, Users, DollarSign, AlertCircle } from "lucide-react";
import backend from "@/lib/backend";
import type { DashboardStats, DashboardBooking } from "~backend/bookings/get_dashboard_stats";
import type { Notification } from "~backend/notifications/types";
import { useNavigate } from "react-router-dom";

export function BookingDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadStats = async () => {
    try {
      const data = await backend.bookings.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      console.error("Failed to load dashboard stats:", err);
      if (err?.code === "unauthenticated" || err?.code === "permission_denied") {
        setStats(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();

    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;

    const connectWebSocket = async () => {
      try {
        const stream = await backend.notifications.stream();
        reconnectAttempts = 0;
        for await (const notification of stream) {
          handleNotification(notification);
        }
      } catch (err) {
        console.warn("Notification stream unavailable, using polling fallback");
        reconnectAttempts++;
        if (reconnectAttempts < maxReconnectAttempts) {
          setTimeout(connectWebSocket, 10000);
        }
      }
    };

    connectWebSocket();
  }, []);

  const handleNotification = (notification: Notification) => {
    if (notification.type.includes("booking")) {
      loadStats();
    }
  };

  const formatPrice = (pence: number) => {
    return `£${(pence / 100).toFixed(2)}`;
  };

  const formatTime = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "PENDING":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "COMPLETED":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "CANCELLED":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  const BookingCard = ({ booking }: { booking: DashboardBooking }) => (
    <div
      onClick={() => navigate(`/freelancer/bookings/${booking.id}`)}
      className="p-3 bg-background/50 rounded-lg border border-border hover:border-primary/50 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
            {booking.serviceTitle}
          </h4>
          <p className="text-xs text-muted-foreground truncate">{booking.clientName}</p>
        </div>
        <Badge className={`text-xs ${getStatusColor(booking.status)}`}>
          {booking.status}
        </Badge>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatTime(booking.startDatetime)}
        </div>
        <div className="font-medium text-foreground">{formatPrice(booking.totalPricePence)}</div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-lg" />
          ))}
        </div>
        <div className="h-96 bg-muted rounded-lg" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Failed to load dashboard data
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.statistics.totalBookings}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.statistics.pendingRequests}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.statistics.confirmedThisWeek}</div>
              <div className="text-xs text-muted-foreground">This Week</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {formatPrice(stats.statistics.totalRevenueThisWeek)}
              </div>
              <div className="text-xs text-muted-foreground">Revenue</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.statistics.completedThisMonth}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Today's Schedule
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {stats.todayBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No bookings today
              </p>
            ) : (
              stats.todayBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Upcoming
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {stats.upcomingBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No upcoming bookings
              </p>
            ) : (
              stats.upcomingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Recent Activity
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {stats.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent activity
              </p>
            ) : (
              stats.recentActivity.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Weekly Calendar
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {stats.weeklyCalendar.days.map((day) => {
            const dayDate = new Date(day.date);
            const isToday =
              dayDate.toDateString() === new Date().toDateString();

            return (
              <div
                key={day.date}
                className={`border rounded-lg p-3 min-h-[200px] ${
                  isToday
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background"
                }`}
              >
                <div className="text-center mb-3">
                  <div className="text-xs font-medium text-muted-foreground">
                    {day.dayName}
                  </div>
                  <div
                    className={`text-lg font-bold ${
                      isToday ? "text-primary" : ""
                    }`}
                  >
                    {dayDate.getDate()}
                  </div>
                </div>
                <div className="space-y-1.5">
                  {day.bookings.map((booking) => (
                    <div
                      key={booking.id}
                      onClick={() => navigate(`/freelancer/bookings/${booking.id}`)}
                      className={`text-xs p-2 rounded cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      <div className="font-medium truncate">
                        {formatTime(booking.startDatetime)}
                      </div>
                      <div className="truncate opacity-90">
                        {booking.serviceTitle}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
