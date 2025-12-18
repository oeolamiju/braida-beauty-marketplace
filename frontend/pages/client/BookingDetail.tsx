import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, MapPin, Package, Phone, Mail, User, AlertCircle, Star, Flag } from "lucide-react";
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
      <Button variant="ghost" onClick={() => navigate("/client/bookings")} className="mb-6">
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
                {booking.paymentStatus && (
                  <Badge variant={booking.paymentStatus === 'paid' ? 'default' : 'outline'}>
                    {booking.paymentStatus === 'paid' ? 'Paid' : 
                     booking.paymentStatus === 'payment_pending' ? 'Payment Pending' :
                     booking.paymentStatus === 'payment_failed' ? 'Payment Failed' :
                     booking.paymentStatus === 'refunded' ? 'Refunded' :
                     booking.paymentStatus === 'partially_refunded' ? 'Partially Refunded' : 
                     'Unpaid'}
                  </Badge>
                )}
                <span className="text-sm text-muted-foreground">
                  Booking #{booking.id}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {formatPrice(booking.totalPricePence)}
              </div>
              {booking.payment && booking.payment.refundAmountPence && (
                <div className="text-sm text-muted-foreground mt-1">
                  Refunded: {formatPrice(booking.payment.refundAmountPence)}
                </div>
              )}
            </div>
          </div>

          {booking.status === "pending" && booking.expiresAt && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-yellow-800 dark:text-yellow-200">Awaiting Confirmation</div>
                <div className="text-yellow-700 dark:text-yellow-300">
                  This booking will expire if not confirmed by {formatDateTime(booking.expiresAt)}
                </div>
              </div>
            </div>
          )}

          {booking.status === "cancelled" && booking.declinedReason && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="font-medium text-red-800 dark:text-red-200 mb-1">Declined Reason</div>
              <div className="text-sm text-red-700 dark:text-red-300">{booking.declinedReason}</div>
            </div>
          )}

          {booking.autoConfirmAt && booking.status === 'confirmed' && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-blue-800 dark:text-blue-200">Auto-Confirmation Scheduled</div>
                <div className="text-blue-700 dark:text-blue-300">
                  Service will be automatically confirmed on {formatDateTime(booking.autoConfirmAt)} unless you report an issue.
                </div>
              </div>
            </div>
          )}

          {booking.payment && (
            <Card className="p-4 mb-6">
              <h3 className="font-semibold mb-3">Payment Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Status:</span>
                  <Badge variant={booking.payment.status === 'succeeded' ? 'default' : 'outline'}>
                    {booking.payment.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Escrow Status:</span>
                  <Badge variant={
                    booking.payment.escrowStatus === 'held' ? 'secondary' :
                    booking.payment.escrowStatus === 'released' ? 'default' :
                    'outline'
                  }>
                    {booking.payment.escrowStatus}
                  </Badge>
                </div>
                {booking.payment.escrowStatus === 'held' && (
                  <div className="text-muted-foreground text-xs pt-2 border-t">
                    Funds are held in escrow until service completion is confirmed or 24 hours after the scheduled end time.
                  </div>
                )}
                {booking.payment.escrowReleasedAt && (
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-muted-foreground">Released to Freelancer:</span>
                    <span>{formatDateTime(booking.payment.escrowReleasedAt)}</span>
                  </div>
                )}
              </div>
            </Card>
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
                        ? `Freelancer's Location (${booking.freelancerArea})`
                        : "Your Address"}
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
              <h3 className="font-semibold mb-3">Freelancer</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">{booking.freelancerName}</div>
                    <div className="text-sm text-muted-foreground">{booking.freelancerArea}</div>
                  </div>
                </div>
                {booking.status === "confirmed" && booking.freelancerEmail && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div className="font-medium">{booking.freelancerEmail}</div>
                    </div>
                  </div>
                )}
                {booking.status === "confirmed" && booking.freelancerPhone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div className="font-medium">{booking.freelancerPhone}</div>
                    </div>
                  </div>
                )}
                {booking.status !== "confirmed" && (
                  <div className="text-sm text-muted-foreground italic">
                    Contact details will be shown once booking is confirmed
                  </div>
                )}
              </div>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setReportModalOpen(true)}
                  className="w-full"
                >
                  <Flag className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
              </div>
            </div>
          </div>

          {booking.notes && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Notes</h3>
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

          {canReview && !hasReview && (
            <div className="mt-6 pt-6 border-t">
              <Button onClick={() => setReviewModalOpen(true)} className="w-full">
                <Star className="size-4 mr-2" />
                Write a Review
              </Button>
            </div>
          )}

          {hasReview && (
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="size-4 fill-yellow-400 text-yellow-400" />
                You have reviewed this booking
              </div>
            </div>
          )}

          {(booking.status === "confirmed" || booking.status === "completed") && (
            <div className="mt-6 pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={() => setDisputeModalOpen(true)} 
                className="w-full mb-3"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Raise a Dispute
              </Button>
            </div>
          )}

          {(booking.status === "pending" || booking.status === "confirmed") && (
            <div className={booking.status === "confirmed" ? "" : "mt-6 pt-6 border-t"}>
              <Button variant="destructive" onClick={handleCancel} disabled={cancelling} className="w-full">
                {cancelling ? "Cancelling..." : "Cancel Booking"}
              </Button>
            </div>
          )}
        </Card>

        {/* Safety Panel for Active Bookings */}
        {(booking.status === "confirmed" || booking.status === "pending") && (
          <SafetyPanel bookingId={booking.id} />
        )}

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

        {booking.auditLog.length > 0 && (
          <Card className="p-6">
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
    </div>
  );
}
