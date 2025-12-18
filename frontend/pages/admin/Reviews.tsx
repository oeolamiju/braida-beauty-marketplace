import { useEffect, useState } from "react";
import { Star, User, Eye, Trash2, RotateCcw, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import backend from "@/lib/backend";

interface Review {
  id: number;
  bookingId: number;
  clientId: string;
  freelancerId: string;
  rating: number;
  reviewText?: string;
  photoUrl?: string;
  createdAt: string;
  isRemoved: boolean;
  removedAt?: string;
  removedBy?: string;
  removalReason?: string;
  clientName?: string;
  clientPhotoUrl?: string;
}

interface ModerationLog {
  id: number;
  reviewId: number;
  adminId: string;
  action: string;
  reason?: string;
  createdAt: string;
  adminName?: string;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [includeRemoved, setIncludeRemoved] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [removeReason, setRemoveReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadReviews();
  }, [includeRemoved]);

  async function loadReviews() {
    try {
      setLoading(true);
      const data = await backend.reviews.adminListAll({ includeRemoved });
      setReviews(data.reviews);
    } catch (error) {
      console.error("Failed to load reviews:", error);
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadLogs(reviewId: number) {
    try {
      setLogsLoading(true);
      const data = await backend.reviews.adminGetLogs({ reviewId });
      setLogs(data.logs);
    } catch (error) {
      console.error("Failed to load logs:", error);
      toast({
        title: "Error",
        description: "Failed to load moderation logs",
        variant: "destructive",
      });
    } finally {
      setLogsLoading(false);
    }
  }

  function handleViewDetails(review: Review) {
    setSelectedReview(review);
    loadLogs(review.id);
  }

  function handleRemoveClick(review: Review) {
    setSelectedReview(review);
    setRemoveReason("");
    setRemoveDialogOpen(true);
  }

  async function handleRemove() {
    if (!selectedReview || !removeReason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for removing this review",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await backend.reviews.adminRemove({
        reviewId: selectedReview.id,
        reason: removeReason,
      });

      toast({
        title: "Review removed",
        description: "The review has been removed successfully",
      });

      setRemoveDialogOpen(false);
      setSelectedReview(null);
      setRemoveReason("");
      loadReviews();
    } catch (error) {
      console.error("Failed to remove review:", error);
      toast({
        title: "Failed to remove review",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRestore(review: Review) {
    if (!confirm("Are you sure you want to restore this review?")) return;

    try {
      await backend.reviews.adminRestore({ reviewId: review.id });

      toast({
        title: "Review restored",
        description: "The review has been restored successfully",
      });

      loadReviews();
      if (selectedReview?.id === review.id) {
        loadLogs(review.id);
      }
    } catch (error) {
      console.error("Failed to restore review:", error);
      toast({
        title: "Failed to restore review",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-32" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Review Moderation</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Show Removed</label>
          <Switch checked={includeRemoved} onCheckedChange={setIncludeRemoved} />
        </div>
      </div>

      <Card className="p-6">
        {reviews.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No reviews found</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className={`border rounded-lg p-4 ${review.isRemoved ? "bg-red-50 dark:bg-red-950/20" : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="size-10 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                      {review.clientPhotoUrl ? (
                        <img
                          src={review.clientPhotoUrl}
                          alt={review.clientName}
                          className="size-full object-cover"
                        />
                      ) : (
                        <User className="size-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{review.clientName || "Anonymous"}</span>
                        <Badge variant="outline">#{review.id}</Badge>
                        {review.isRemoved && (
                          <Badge variant="destructive">Removed</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`size-4 ${
                                star <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      {review.reviewText && (
                        <p className="text-sm mb-2">{review.reviewText}</p>
                      )}
                      {review.photoUrl && (
                        <img
                          src={review.photoUrl}
                          alt="Review"
                          className="rounded-lg max-w-xs w-full h-auto mt-2"
                        />
                      )}
                      {review.isRemoved && review.removalReason && (
                        <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="size-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                            <div>
                              <div className="text-sm font-medium text-red-800 dark:text-red-200">
                                Removal Reason
                              </div>
                              <div className="text-sm text-red-700 dark:text-red-300">
                                {review.removalReason}
                              </div>
                              {review.removedAt && (
                                <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                                  Removed on {formatDate(review.removedAt)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(review)}
                    >
                      <Eye className="size-4" />
                    </Button>
                    {review.isRemoved ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(review)}
                      >
                        <RotateCcw className="size-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveClick(review)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Dialog open={!!selectedReview && !removeDialogOpen} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Details & Moderation Logs</DialogTitle>
            <DialogDescription>
              Review #{selectedReview?.id} - Booking #{selectedReview?.bookingId}
            </DialogDescription>
          </DialogHeader>

          {logsLoading ? (
            <div className="py-8 text-center">
              <div className="animate-pulse">Loading logs...</div>
            </div>
          ) : logs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No moderation actions yet</p>
          ) : (
            <div className="space-y-3">
              <h3 className="font-semibold">Moderation History</h3>
              {logs.map((log) => (
                <div key={log.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant={log.action === "removed" ? "destructive" : "default"}>
                        {log.action}
                      </Badge>
                      <div className="text-sm mt-1">
                        by {log.adminName || `Admin #${log.adminId}`}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDate(log.createdAt)}
                      </div>
                    </div>
                  </div>
                  {log.reason && (
                    <div className="mt-2 text-sm text-muted-foreground">{log.reason}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setSelectedReview(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Review</DialogTitle>
            <DialogDescription>
              Provide a reason for removing this review. The review will be hidden but retained
              for audit purposes.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            placeholder="Enter removal reason..."
            value={removeReason}
            onChange={(e) => setRemoveReason(e.target.value)}
            rows={4}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemove} disabled={submitting}>
              {submitting ? "Removing..." : "Remove Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
