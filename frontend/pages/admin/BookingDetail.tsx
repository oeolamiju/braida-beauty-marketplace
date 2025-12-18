import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import backend from "@/lib/backend";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User, CreditCard, MessageSquare } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { BookingDetailAdminResponse } from "~backend/admin/types";

export default function BookingDetail() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<BookingDetailAdminResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    if (!bookingId) return;
    setLoading(true);
    try {
      const response = await backend.admin.getBooking({ bookingId });
      setData(response);
    } catch (error: any) {
      toast({
        title: "Error loading booking",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!data) {
    return <div className="p-6">Booking not found</div>;
  }

  const { booking, payment, disputes, reviews } = data;

  return (
    <div className="p-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate("/admin/bookings")}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Bookings
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Booking Details</h1>
          <p className="text-muted-foreground mt-1">ID: {booking.id}</p>
        </div>
        <Badge variant={booking.status === "COMPLETED" ? "outline" : "default"}>
          {booking.status}
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Booking Information
          </h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Service:</span>
              <div className="font-medium">{booking.serviceTitle}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Scheduled For:</span>
              <div className="font-medium">{new Date(booking.scheduledFor).toLocaleString()}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Address:</span>
              <div className="font-medium">{booking.address}</div>
            </div>
            {booking.notes && (
              <div>
                <span className="text-muted-foreground">Notes:</span>
                <div className="font-medium">{booking.notes}</div>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Created:</span>
              <div className="font-medium">{new Date(booking.createdAt).toLocaleString()}</div>
            </div>
            {booking.confirmedAt && (
              <div>
                <span className="text-muted-foreground">Confirmed:</span>
                <div className="font-medium">{new Date(booking.confirmedAt).toLocaleString()}</div>
              </div>
            )}
            {booking.completedAt && (
              <div>
                <span className="text-muted-foreground">Completed:</span>
                <div className="font-medium">{new Date(booking.completedAt).toLocaleString()}</div>
              </div>
            )}
            {booking.cancelledAt && (
              <div>
                <span className="text-muted-foreground">Cancelled:</span>
                <div className="font-medium">{new Date(booking.cancelledAt).toLocaleString()}</div>
                {booking.cancellationReason && (
                  <div className="text-xs mt-1">Reason: {booking.cancellationReason}</div>
                )}
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Parties
          </h2>
          <div className="space-y-4 text-sm">
            <div>
              <span className="text-muted-foreground">Freelancer:</span>
              <div className="font-medium">{booking.freelancerName}</div>
              <div className="text-xs text-muted-foreground">ID: {booking.freelancerId}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Client:</span>
              <div className="font-medium">{booking.clientName}</div>
              <div className="text-xs text-muted-foreground">ID: {booking.clientId}</div>
            </div>
          </div>
        </Card>

        {payment && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Amount:</span>
                <div className="font-medium text-lg">£{payment.amount.toFixed(2)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <div>
                  <Badge>{payment.status}</Badge>
                </div>
              </div>
              {payment.escrowReleaseAt && (
                <div>
                  <span className="text-muted-foreground">Escrow Release:</span>
                  <div className="font-medium">{new Date(payment.escrowReleaseAt).toLocaleString()}</div>
                </div>
              )}
              {payment.refundedAmount && payment.refundedAmount > 0 && (
                <div>
                  <span className="text-muted-foreground">Refunded:</span>
                  <div className="font-medium text-red-600">£{payment.refundedAmount.toFixed(2)}</div>
                </div>
              )}
            </div>
          </Card>
        )}

        {(disputes.length > 0 || reviews.length > 0) && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Activity
            </h2>
            <div className="space-y-4 text-sm">
              {disputes.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Disputes:</span>
                  <div className="mt-2 space-y-2">
                    {disputes.map((dispute: any) => (
                      <div key={dispute.id} className="p-2 bg-muted rounded">
                        <div className="flex justify-between items-start">
                          <Badge variant="destructive" className="text-xs">{dispute.status}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(dispute.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mt-1 text-xs">{dispute.reason}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {reviews.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Reviews:</span>
                  <div className="mt-2 space-y-2">
                    {reviews.map((review: any) => (
                      <div key={review.id} className="p-2 bg-muted rounded">
                        <div className="flex justify-between items-start">
                          <span className="text-sm">{"⭐".repeat(review.rating)}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && <div className="mt-1 text-xs">{review.comment}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
