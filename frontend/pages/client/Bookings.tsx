import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, ChevronRight } from "lucide-react";
import backend from "@/lib/backend";
import { useApiError } from "@/hooks/useApiError";
import { BookingCardSkeleton } from "@/components/BookingCardSkeleton";

interface BookingSummary {
  id: number;
  serviceTitle: string;
  startDatetime: string;
  endDatetime: string;
  locationType: string;
  totalPricePence: number;
  status: string;
  expiresAt: string | null;
  otherPartyName: string;
  createdAt: string;
}

export default function ClientBookings() {
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const { showError } = useApiError();
  const navigate = useNavigate();

  useEffect(() => {
    loadBookings();
  }, [filter]);

  async function loadBookings() {
    setLoading(true);
    try {
      const data = await backend.bookings.list({ role: "client", status: filter });
      setBookings(data.bookings);
    } catch (error) {
      console.error("Failed to load bookings:", error);
      showError(error);
    } finally {
      setLoading(false);
    }
  }

  function formatPrice(pence: number): string {
    return `£${(pence / 100).toFixed(2)}`;
  }

  function formatDate(datetime: string): string {
    const date = new Date(datetime);
    return date.toLocaleDateString("en-GB", { 
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  function formatTime(datetime: string): string {
    const date = new Date(datetime);
    return date.toLocaleTimeString("en-GB", { 
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function getStatusBadge(status: string) {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending: { variant: "secondary", label: "Pending" },
      confirmed: { variant: "default", label: "Confirmed" },
      cancelled: { variant: "destructive", label: "Cancelled" },
      completed: { variant: "outline", label: "Completed" },
      disputed: { variant: "destructive", label: "Disputed" },
      expired: { variant: "outline", label: "Expired" },
    };
    const config = variants[status] || { variant: "outline" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  }

  const filters = [
    { label: "All", value: undefined },
    { label: "Pending", value: "pending" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
        <p className="text-muted-foreground">View and manage your appointments</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {filters.map((f) => (
          <Button
            key={f.label}
            variant={filter === f.value ? "default" : "outline"}
            onClick={() => setFilter(f.value)}
            size="sm"
          >
            {f.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <BookingCardSkeleton key={i} />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
          <p className="text-muted-foreground mb-6">
            {filter ? "Try changing the filter" : "Your bookings will appear here"}
          </p>
          {!filter && (
            <Button onClick={() => navigate("/client/discover")}>
              Browse Services
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card
              key={booking.id}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/client/bookings/${booking.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{booking.serviceTitle}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    with {booking.otherPartyName}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {getStatusBadge(booking.status)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-primary mb-1">
                    {formatPrice(booking.totalPricePence)}
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto" />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    <div className="text-muted-foreground">Date</div>
                    <div className="font-medium">{formatDate(booking.startDatetime)}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    <div className="text-muted-foreground">Time</div>
                    <div className="font-medium">
                      {formatTime(booking.startDatetime)}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    <div className="text-muted-foreground">Location</div>
                    <div className="font-medium">
                      {booking.locationType === "client_travels_to_freelancer" 
                        ? "Freelancer's Place"
                        : "Your Address"}
                    </div>
                  </div>
                </div>
              </div>

              {booking.status === "pending" && booking.expiresAt && (
                <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                  Expires: {formatDate(booking.expiresAt)} at {formatTime(booking.expiresAt)}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
