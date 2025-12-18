import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, ChevronRight, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import backend from "@/lib/backend";
import { useApiError } from "@/hooks/useApiError";
import { useToast } from "@/components/ui/use-toast";
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

export default function FreelancerBookings() {
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [decliningId, setDecliningId] = useState<number | null>(null);
  const { showError } = useApiError();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadBookings();
  }, [filter]);

  async function loadBookings() {
    setLoading(true);
    try {
      const data = await backend.bookings.list({ role: "freelancer", status: filter });
      setBookings(data.bookings);
    } catch (error) {
      console.error("Failed to load bookings:", error);
      showError(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(bookingId: number, e: React.MouseEvent) {
    e.stopPropagation();
    
    setAcceptingId(bookingId);
    
    const previousBookings = [...bookings];
    setBookings(bookings.map(b => 
      b.id === bookingId ? { ...b, status: "confirmed" } : b
    ));
    
    toast({
      title: "Booking Accepted",
      description: "The client has been notified",
    });
    
    try {
      await backend.bookings.accept({ id: bookingId });
      await loadBookings();
    } catch (error) {
      console.error("Failed to accept booking:", error);
      showError(error);
      setBookings(previousBookings);
    } finally {
      setAcceptingId(null);
    }
  }

  async function handleDecline(bookingId: number, e: React.MouseEvent) {
    e.stopPropagation();
    
    const reason = prompt("Optional: Provide a reason for declining");
    
    setDecliningId(bookingId);
    
    const previousBookings = [...bookings];
    setBookings(bookings.map(b => 
      b.id === bookingId ? { ...b, status: "cancelled" } : b
    ));
    
    toast({
      title: "Booking Declined",
      description: "The client has been notified",
    });
    
    try {
      await backend.bookings.decline({ id: bookingId, reason: reason || undefined });
      await loadBookings();
    } catch (error) {
      console.error("Failed to decline booking:", error);
      showError(error);
      setBookings(previousBookings);
    } finally {
      setDecliningId(null);
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

  const pendingBookings = bookings.filter(b => b.status === "pending");

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bookings</h1>
        <p className="text-muted-foreground">Manage your client appointments</p>
      </div>

      {pendingBookings.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div className="flex-1">
            <div className="font-medium text-yellow-800 dark:text-yellow-200">
              {pendingBookings.length} pending {pendingBookings.length === 1 ? "request" : "requests"}
            </div>
            <div className="text-sm text-yellow-700 dark:text-yellow-300">
              Please respond within 24 hours to avoid automatic expiration
            </div>
          </div>
        </div>
      )}

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
          <p className="text-muted-foreground">
            {filter ? "Try changing the filter" : "Client bookings will appear here once you start receiving requests"}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card
              key={booking.id}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/freelancer/bookings/${booking.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{booking.serviceTitle}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Client: {booking.otherPartyName}
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

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
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
                        ? "Your Place"
                        : "Client's Address"}
                    </div>
                  </div>
                </div>
              </div>

              {booking.status === "pending" && (
                <div className="pt-4 border-t flex gap-3" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    onClick={(e) => handleAccept(booking.id, e)}
                    disabled={acceptingId === booking.id}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {acceptingId === booking.id ? "Accepting..." : "Accept"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => handleDecline(booking.id, e)}
                    disabled={decliningId === booking.id}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {decliningId === booking.id ? "Declining..." : "Decline"}
                  </Button>
                </div>
              )}

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
