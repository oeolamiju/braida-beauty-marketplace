import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, MapPin, Package, Phone, Mail, User, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import backend from "@/lib/backend";
import { useApiError } from "@/hooks/useApiError";
import { useToast } from "@/components/ui/use-toast";
import { BookingDetailSkeleton } from "@/components/BookingDetailSkeleton";

interface BookingDetail {
  id: number;
  clientId: string;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  freelancerId: string;
  freelancerName: string;
  freelancerEmail: string | null;
  freelancerPhone: string | null;
  freelancerArea: string;
  serviceId: number;
  serviceTitle: string;
  startDatetime: string;
  endDatetime: string;
  locationType: string;
  clientAddress: {
    line1: string | null;
    postcode: string | null;
    city: string | null;
  };
  notes: string | null;
  priceBasePence: number;
  priceMaterialsPence: number;
  priceTravelPence: number;
  totalPricePence: number;
  status: string;
  declinedReason: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  auditLog: {
    id: number;
    action: string;
    previousStatus: string | null;
    newStatus: string | null;
    userId: string;
    userName: string;
    createdAt: string;
  }[];
}

export default function FreelancerBookingDetail() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const { showError } = useApiError();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadBooking();
  }, [id]);

  async function loadBooking() {
    try {
      const data = await backend.bookings.get({ id: parseInt(id!) });
      setBooking(data);
    } catch (error) {
      console.error("Failed to load booking:", error);
      showError(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept() {
    if (!booking) return;

    setAccepting(true);
    
    const previousBooking = { ...booking };
    setBooking({ ...booking, status: "confirmed" });
    
    toast({
      title: "Booking Accepted",
      description: "The client has been notified",
    });
    
    try {
      await backend.bookings.accept({ id: parseInt(id!) });
      await loadBooking();
    } catch (error) {
      console.error("Failed to accept booking:", error);
      showError(error);
      setBooking(previousBooking);
    } finally {
      setAccepting(false);
    }
  }

  async function handleDecline() {
    if (!booking) return;

    const reason = prompt("Optional: Provide a reason for declining");
    
    setDeclining(true);
    
    const previousBooking = { ...booking };
    setBooking({ ...booking, status: "cancelled", declinedReason: reason || null });
    
    toast({
      title: "Booking Declined",
      description: "The client has been notified",
    });
    
    try {
      await backend.bookings.decline({ id: parseInt(id!), reason: reason || undefined });
      await loadBooking();
    } catch (error) {
      console.error("Failed to decline booking:", error);
      showError(error);
      setBooking(previousBooking);
    } finally {
      setDeclining(false);
    }
  }

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    
    setCancelling(true);
    try {
      await backend.bookings.cancel({ id: parseInt(id!) });
      toast({
        title: "Booking Cancelled",
        description: "The client has been notified",
      });
      await loadBooking();
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      showError(error);
    } finally {
      setCancelling(false);
    }
  }

  function formatPrice(pence: number): string {
    return `£${(pence / 100).toFixed(2)}`;
  }

  function formatDateTime(datetime: string): string {
    const date = new Date(datetime);
    return date.toLocaleString("en-GB", {
      dateStyle: "long",
      timeStyle: "short",
    });
  }

  function formatDate(datetime: string): string {
    const date = new Date(datetime);
    return date.toLocaleDateString("en-GB", { dateStyle: "long" });
  }

  function formatTime(datetime: string): string {
    const date = new Date(datetime);
    return date.toLocaleTimeString("en-GB", { timeStyle: "short" });
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

  if (loading) {
    return <BookingDetailSkeleton />;
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Booking not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate("/freelancer/bookings")} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Bookings
      </Button>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">{booking.serviceTitle}</h1>
              <div className="flex items-center gap-2">
                {getStatusBadge(booking.status)}
                <span className="text-sm text-muted-foreground">
                  Booking #{booking.id}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {formatPrice(booking.totalPricePence)}
              </div>
            </div>
          </div>

          {booking.status === "pending" && booking.expiresAt && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="text-sm flex-1">
                <div className="font-medium text-yellow-800 dark:text-yellow-200">Action Required</div>
                <div className="text-yellow-700 dark:text-yellow-300">
                  Please accept or decline this booking by {formatDateTime(booking.expiresAt)}
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-3">Booking Details</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm text-muted-foreground">Date</div>
                    <div className="font-medium">{formatDate(booking.startDatetime)}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm text-muted-foreground">Time</div>
                    <div className="font-medium">
                      {formatTime(booking.startDatetime)} - {formatTime(booking.endDatetime)}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm text-muted-foreground">Location</div>
                    <div className="font-medium">
                      {booking.locationType === "client_travels_to_freelancer" 
                        ? "Your Location"
                        : "Client's Address"}
                    </div>
                    {booking.locationType === "freelancer_travels_to_client" && booking.clientAddress.line1 && (
                      <div className="text-sm mt-1">
                        {booking.clientAddress.line1}<br />
                        {booking.clientAddress.city}, {booking.clientAddress.postcode}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Client</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">{booking.clientName}</div>
                  </div>
                </div>
                {booking.status === "confirmed" && booking.clientEmail && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div className="font-medium">{booking.clientEmail}</div>
                    </div>
                  </div>
                )}
                {booking.status === "confirmed" && booking.clientPhone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div className="font-medium">{booking.clientPhone}</div>
                    </div>
                  </div>
                )}
                {booking.status !== "confirmed" && (
                  <div className="text-sm text-muted-foreground italic">
                    Contact details will be shown once you accept the booking
                  </div>
                )}
              </div>
            </div>
          </div>

          {booking.notes && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Client Notes</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{booking.notes}</p>
            </div>
          )}

          <div className="p-4 border rounded-lg bg-accent/50">
            <h3 className="font-semibold mb-3">Price Breakdown</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Base Price</span>
                <span>{formatPrice(booking.priceBasePence)}</span>
              </div>
              {booking.priceMaterialsPence > 0 && (
                <div className="flex justify-between">
                  <span>Materials Fee</span>
                  <span>{formatPrice(booking.priceMaterialsPence)}</span>
                </div>
              )}
              {booking.priceTravelPence > 0 && (
                <div className="flex justify-between">
                  <span>Travel Fee</span>
                  <span>{formatPrice(booking.priceTravelPence)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t font-bold text-base">
                <span>Total</span>
                <span className="text-primary">{formatPrice(booking.totalPricePence)}</span>
              </div>
            </div>
          </div>

          {booking.status === "pending" && (
            <div className="mt-6 pt-6 border-t flex gap-3">
              <Button onClick={handleAccept} disabled={accepting} className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                {accepting ? "Accepting..." : "Accept Booking"}
              </Button>
              <Button variant="outline" onClick={handleDecline} disabled={declining} className="flex-1">
                <XCircle className="h-4 w-4 mr-2" />
                {declining ? "Declining..." : "Decline"}
              </Button>
            </div>
          )}

          {booking.status === "confirmed" && (
            <div className="mt-6 pt-6 border-t">
              <Button variant="destructive" onClick={handleCancel} disabled={cancelling} className="w-full">
                {cancelling ? "Cancelling..." : "Cancel Booking"}
              </Button>
            </div>
          )}
        </Card>

        {booking.auditLog.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Activity Log</h3>
            <div className="space-y-3">
              {booking.auditLog.map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1">
                    <div className="font-medium">
                      {log.action === "created" && "Booking request received"}
                      {log.action === "accepted" && "Booking accepted"}
                      {log.action === "declined" && "Booking declined"}
                      {log.action === "cancelled" && "Booking cancelled"}
                      {log.action === "auto_expired" && "Booking automatically expired"}
                    </div>
                    <div className="text-muted-foreground">
                      {log.userName} · {formatDateTime(log.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
