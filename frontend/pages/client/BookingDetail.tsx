import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Calendar, Clock, MapPin, Package, Phone, Mail, User, 
  AlertCircle, Star, Flag, Printer, HelpCircle, CalendarPlus,
  MessageSquare, Navigation, Eye, EyeOff, CheckCircle2, RefreshCw
} from "lucide-react";
import backend from "@/lib/backend";
import { useApiError } from "@/hooks/useApiError";
import { useToast } from "@/components/ui/use-toast";
import { BookingDetailSkeleton } from "@/components/BookingDetailSkeleton";
import { ReviewModal } from "@/components/ReviewModal";
import { ReportModal } from "@/components/ReportModal";
import { DisputeModal } from "@/components/DisputeModal";
import { SafetyPanel } from "@/components/SafetyPanel";

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
  freelancerPhoto?: string | null;
  serviceId: number;
  serviceTitle: string;
  serviceCategory?: string;
  serviceDurationMinutes?: number;
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
  depositPaidPence?: number;
  status: string;
  paymentStatus: string;
  declinedReason: string | null;
  expiresAt: string | null;
  completedAt: string | null;
  autoConfirmAt: string | null;
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
  payment?: {
    id: number;
    status: string;
    escrowStatus: string;
    amountPence: number;
    platformFeePence: number;
    freelancerPayoutPence: number | null;
    refundId: string | null;
    refundAmountPence: number | null;
    createdAt: string;
    escrowReleasedAt: string | null;
  };
}

export default function ClientBookingDetail() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [hasReview, setHasReview] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const { showError } = useApiError();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadBooking();
    loadReviewStatus();
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

  async function loadReviewStatus() {
    try {
      const data = await backend.reviews.getBookingReview({ bookingId: parseInt(id!) });
      setCanReview(data.canReview);
      setHasReview(!!data.review);
    } catch (error) {
      console.error("Failed to load review status:", error);
    }
  }

  async function handleCancel() {
    if (!booking) return;
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    
    setCancelling(true);
    
    const previousBooking = { ...booking };
    setBooking({ ...booking, status: "cancelled" });
    
    toast({
      title: "Booking Cancelled",
      description: "Your booking has been cancelled successfully",
    });
    
    try {
      await backend.bookings.cancel({ id: parseInt(id!) });
      await loadBooking();
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      showError(error);
      setBooking(previousBooking);
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
    return date.toLocaleDateString("en-GB", { 
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  function formatTime(datetime: string): string {
    const date = new Date(datetime);
    return date.toLocaleTimeString("en-GB", { timeStyle: "short" });
  }

  function maskValue(value: string, type: "phone" | "email"): string {
    if (type === "phone") {
      // Show first 4 and last 3 chars: +44 7•• ••• 892
      if (value.length < 7) return "•••••••••";
      return value.slice(0, 4) + " " + "•".repeat(2) + "• ••• " + value.slice(-3);
    }
    // Email: show first char and domain hint: g•••@braida.com
    const [user, domain] = value.split("@");
    return user.charAt(0) + "•••@" + domain;
  }

  function handlePrintReceipt() {
    window.print();
  }

  function handleAddToCalendar() {
    if (!booking) return;
    
    const start = new Date(booking.startDatetime);
    const end = new Date(booking.endDatetime);
    
    // Create Google Calendar URL
    const googleUrl = new URL("https://calendar.google.com/calendar/render");
    googleUrl.searchParams.set("action", "TEMPLATE");
    googleUrl.searchParams.set("text", `${booking.serviceTitle} with ${booking.freelancerName}`);
    googleUrl.searchParams.set("dates", 
      start.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z/" +
      end.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    );
    googleUrl.searchParams.set("details", `Booking Reference: BR-${booking.id}\n\nService: ${booking.serviceTitle}\nProvider: ${booking.freelancerName}`);
    if (booking.locationType === "freelancer_travels_to_client" && booking.clientAddress.line1) {
      googleUrl.searchParams.set("location", `${booking.clientAddress.line1}, ${booking.clientAddress.city}, ${booking.clientAddress.postcode}`);
    } else {
      googleUrl.searchParams.set("location", booking.freelancerArea);
    }
    
    window.open(googleUrl.toString(), "_blank");
  }

  function handleGetDirections() {
    if (!booking) return;
    
    let address = "";
    if (booking.locationType === "freelancer_travels_to_client" && booking.clientAddress.line1) {
      address = `${booking.clientAddress.line1}, ${booking.clientAddress.city}, ${booking.clientAddress.postcode}`;
    } else {
      address = booking.freelancerArea;
    }
    
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(mapsUrl, "_blank");
  }

  function getStatusBadge(status: string) {
    const variants: Record<string, { className: string; icon: React.ReactNode; label: string }> = {
      pending: { className: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: <Clock className="h-3 w-3" />, label: "Pending" },
      confirmed: { className: "bg-green-100 text-green-800 border-green-200", icon: <CheckCircle2 className="h-3 w-3" />, label: "Confirmed" },
      cancelled: { className: "bg-red-100 text-red-800 border-red-200", icon: <AlertCircle className="h-3 w-3" />, label: "Cancelled" },
      completed: { className: "bg-blue-100 text-blue-800 border-blue-200", icon: <CheckCircle2 className="h-3 w-3" />, label: "Completed" },
      disputed: { className: "bg-orange-100 text-orange-800 border-orange-200", icon: <AlertCircle className="h-3 w-3" />, label: "Disputed" },
      expired: { className: "bg-gray-100 text-gray-800 border-gray-200", icon: <Clock className="h-3 w-3" />, label: "Expired" },
    };
    const config = variants[status] || variants.pending;
    return (
      <Badge className={`flex items-center gap-1.5 ${config.className}`}>
        {config.icon}
        {config.label}
      </Badge>
    );
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

  const bookingRef = `#BR-${booking.id.toString().padStart(4, "0")}`;
  const depositPaid = booking.depositPaidPence || Math.round(booking.totalPricePence * 0.3);
  const balanceDue = booking.totalPricePence - depositPaid;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl print:p-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <Button variant="ghost" onClick={() => navigate("/client/bookings")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bookings
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrintReceipt}>
            <Printer className="h-4 w-4 mr-2" />
            Print Receipt
          </Button>
          <Button variant="outline" onClick={() => toast({ title: "Help", description: "Contact support at support@braida.uk" })}>
            <HelpCircle className="h-4 w-4 mr-2" />
            Help
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Header */}
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              {getStatusBadge(booking.status)}
              <span className="text-sm text-muted-foreground">{bookingRef}</span>
            </div>
            
            <h1 className="text-2xl font-bold mb-4">Booking Details</h1>

            {/* Service Info */}
            <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg mb-6">
              {booking.freelancerPhoto ? (
                <img
                  src={booking.freelancerPhoto}
                  alt={booking.freelancerName}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                  <User className="h-8 w-8 text-orange-600" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1">{booking.serviceTitle}</h2>
                <p className="text-muted-foreground mb-2">
                  Service by <span className="text-orange-600 font-medium">{booking.freelancerName}</span>
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {booking.serviceCategory && (
                    <span>Category: {booking.serviceCategory}</span>
                  )}
                  {booking.serviceDurationMinutes && (
                    <span>• Duration: {Math.floor(booking.serviceDurationMinutes / 60)}h {booking.serviceDurationMinutes % 60}m</span>
                  )}
                </div>
              </div>
              <Button 
                variant="outline"
                onClick={() => navigate(`/messages?userId=${booking.freelancerId}`)}
                className="bg-[#2a4a3a] text-white border-[#3a5a4a] hover:bg-[#3a5a4a]"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Message Stylist
              </Button>
            </div>

            {/* When & Where */}
            <div className="border rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">When & Where</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Date</div>
                    <div className="font-medium">{formatDate(booking.startDatetime)}</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Time</div>
                    <div className="font-medium">
                      {formatTime(booking.startDatetime)} - {formatTime(booking.endDatetime)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg md:col-span-2">
                  <MapPin className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Location</div>
                    <div className="font-medium">
                      {booking.locationType === "freelancer_travels_to_client" && booking.clientAddress.line1 ? (
                        <>
                          {booking.clientAddress.city}, {booking.clientAddress.postcode}
                          <p className="text-sm text-muted-foreground mt-1">
                            Exact address is hidden for privacy. It will be revealed 24h before your appointment.
                          </p>
                        </>
                      ) : (
                        `${booking.freelancerName}'s Studio, ${booking.freelancerArea}`
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleGetDirections}
                  >
                    Get Directions
                  </Button>
                </div>
              </div>

              <Button 
                variant="link" 
                className="text-orange-600 hover:text-orange-700 p-0 mt-4"
                onClick={handleAddToCalendar}
              >
                <CalendarPlus className="h-4 w-4 mr-1" />
                Add to Calendar
              </Button>
            </div>

            {/* Booking Policies */}
            <div className="space-y-3">
              <h3 className="font-semibold">Booking Policies</h3>
              
              <details className="border rounded-lg">
                <summary className="p-4 cursor-pointer flex items-center justify-between hover:bg-muted/50">
                  <span>Cancellation Policy</span>
                </summary>
                <div className="p-4 pt-0 text-sm text-muted-foreground">
                  <p>• Free cancellation up to 48 hours before your appointment</p>
                  <p>• 50% refund for cancellations within 24-48 hours</p>
                  <p>• No refund for cancellations within 24 hours</p>
                </div>
              </details>

              <details className="border rounded-lg">
                <summary className="p-4 cursor-pointer flex items-center justify-between hover:bg-muted/50">
                  <span>Lateness & No-Show</span>
                </summary>
                <div className="p-4 pt-0 text-sm text-muted-foreground">
                  <p>• Please arrive on time for your appointment</p>
                  <p>• More than 15 minutes late may result in a shortened service</p>
                  <p>• No-shows may be charged the full appointment fee</p>
                </div>
              </details>
            </div>
          </Card>

          {/* Activity Log - only show if has entries */}
          {booking.auditLog.length > 0 && (
            <Card className="p-6 print:hidden">
              <h3 className="font-semibold mb-4">Activity Log</h3>
              <div className="space-y-3">
                {booking.auditLog.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 text-sm">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <div className="font-medium">
                        {log.action === "created" && "Booking created"}
                        {log.action === "accepted" && "Booking confirmed by freelancer"}
                        {log.action === "declined" && "Booking declined by freelancer"}
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Payment Summary</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Booking Reference: BR-{booking.id.toString().padStart(4, "0")}
            </p>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>{booking.serviceTitle}</span>
                <span>{formatPrice(booking.priceBasePence)}</span>
              </div>
              {booking.priceMaterialsPence > 0 && (
                <div className="flex justify-between">
                  <span>Extensions (Add-on)</span>
                  <span>{formatPrice(booking.priceMaterialsPence)}</span>
                </div>
              )}
              {booking.priceTravelPence > 0 && (
                <div className="flex justify-between">
                  <span>Service Fee</span>
                  <span>{formatPrice(booking.priceTravelPence)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t">
                <span>Total</span>
                <span className="font-semibold">{formatPrice(booking.totalPricePence)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Deposit Paid</span>
                <span>-{formatPrice(depositPaid)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t font-bold text-lg">
                <span className="text-orange-600">Balance Due</span>
                <span className="text-orange-600">{formatPrice(balanceDue)}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Please pay the remaining balance to the stylist upon completion of the service.
            </p>
          </Card>

          {/* Contact Info */}
          <Card className="p-6">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
              Contact Info
            </h3>

            {booking.status === "confirmed" ? (
              <div className="space-y-4">
                {booking.freelancerPhone && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Phone Number</p>
                        <p className="font-medium">
                          {showPhone ? booking.freelancerPhone : maskValue(booking.freelancerPhone, "phone")}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-orange-600"
                      onClick={() => setShowPhone(!showPhone)}
                    >
                      {showPhone ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                      {showPhone ? "Hide" : "Reveal"}
                    </Button>
                  </div>
                )}

                {booking.freelancerEmail && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email Address</p>
                        <p className="font-medium">
                          {showEmail ? booking.freelancerEmail : maskValue(booking.freelancerEmail, "email")}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-orange-600"
                      onClick={() => setShowEmail(!showEmail)}
                    >
                      {showEmail ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                      {showEmail ? "Hide" : "Reveal"}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Contact details will be shown once booking is confirmed
              </p>
            )}
          </Card>

          {/* Actions */}
          <Card className="p-6 space-y-3 print:hidden">
            {booking.status === "confirmed" && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate(`/client/bookings/${id}/reschedule`)}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reschedule Booking
              </Button>
            )}

            {(booking.status === "pending" || booking.status === "confirmed") && (
              <Button 
                variant="outline" 
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleCancel} 
                disabled={cancelling}
              >
                {cancelling ? "Cancelling..." : "Cancel Booking"}
              </Button>
            )}

            {canReview && !hasReview && (
              <Button 
                onClick={() => setReviewModalOpen(true)} 
                className="w-full bg-gradient-to-r from-orange-600 to-amber-600"
              >
                <Star className="h-4 w-4 mr-2" />
                Write a Review
              </Button>
            )}

            {(booking.status === "confirmed" || booking.status === "completed") && (
              <Button 
                variant="outline" 
                onClick={() => setDisputeModalOpen(true)} 
                className="w-full"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Raise a Dispute
              </Button>
            )}
          </Card>

          {/* Safety Panel */}
          {(booking.status === "confirmed" || booking.status === "pending") && (
            <SafetyPanel bookingId={booking.id} />
          )}
        </div>
      </div>

      {/* Modals */}
      <ReviewModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        bookingId={parseInt(id!)}
        onSuccess={loadReviewStatus}
      />

      <ReportModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        reportedUserId={booking.freelancerId}
        bookingId={booking.id.toString()}
        context="Booking"
      />

      <DisputeModal
        open={disputeModalOpen}
        onClose={() => setDisputeModalOpen(false)}
        bookingId={booking.id.toString()}
        scheduledEnd={new Date(booking.endDatetime)}
        onSuccess={loadBooking}
      />
    </div>
  );
}
