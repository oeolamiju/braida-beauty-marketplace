import { useState } from "react";
import { Star, Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import backend from "@/lib/backend";

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  bookingId: number;
  onSuccess?: () => void;
}

export function ReviewModal({ open, onClose, bookingId, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const review = await backend.reviews.create({
        bookingId,
        rating,
        reviewText: reviewText.trim() || undefined,
      });

      if (image) {
        const { uploadUrl, photoKey } = await backend.reviews.uploadPhoto({
          reviewId: review.id,
        });

        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          body: image,
          headers: {
            "Content-Type": image.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image");
        }

        await backend.reviews.confirmPhoto({
          reviewId: review.id,
          photoKey,
        });
      }

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });

      setRating(0);
      setReviewText("");
      setImage(null);
      setImagePreview(null);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast({
        title: "Failed to submit review",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your experience with this service
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pb-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110 touch-manipulation"
                >
                  <Star
                    className={`w-7 h-7 md:w-8 md:h-8 ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Review (Optional)</label>
            <Textarea
              placeholder="Tell us about your experience..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {reviewText.length}/1000
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Photo (Optional)</label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Review"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                >
                  <X className="size-4 text-white" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                <Upload className="size-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  Click to upload image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || rating === 0}>
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
