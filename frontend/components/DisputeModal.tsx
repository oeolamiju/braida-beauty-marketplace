import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { X, Upload, AlertTriangle } from "lucide-react";
import backend from "@/lib/backend";
import type { DisputeCategory } from "~backend/disputes/types";

interface DisputeModalProps {
  bookingId: string;
  scheduledEnd: Date;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DisputeModal({ bookingId, scheduledEnd, open, onClose, onSuccess }: DisputeModalProps) {
  const [category, setCategory] = useState<DisputeCategory>("other");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const disputeWindowHours = 48;
  const now = new Date();
  const windowEnd = new Date(new Date(scheduledEnd).getTime() + disputeWindowHours * 60 * 60 * 1000);
  const isWithinWindow = now <= windowEnd;
  const hoursRemaining = Math.max(0, Math.floor((windowEnd.getTime() - now.getTime()) / (60 * 60 * 1000)));

  const categories: { value: DisputeCategory; label: string; description: string }[] = [
    { value: "no-show", label: "No-Show", description: "Freelancer did not show up for the appointment" },
    { value: "quality", label: "Quality Issue", description: "Service quality did not meet expectations" },
    { value: "safety", label: "Safety Concern", description: "Safety or professionalism concerns" },
    { value: "other", label: "Other", description: "Other issues not listed above" },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(f => {
        const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
        const maxSize = 10 * 1024 * 1024;
        return validTypes.includes(f.type) && f.size <= maxSize;
      });
      setFiles(prev => [...prev, ...validFiles].slice(0, 5));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast({
        title: "Description Required",
        description: "Please provide details about the issue",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await backend.disputes.create({
        booking_id: bookingId,
        category,
        description: description.trim(),
      });

      for (const file of files) {
        const uploadResponse = await backend.disputes.uploadAttachment({
          dispute_id: response.dispute_id,
          file_name: file.name,
          content_type: file.type,
        });

        const uploadResult = await fetch(uploadResponse.upload_url, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        if (!uploadResult.ok) {
          console.error("Failed to upload file:", file.name);
        }
      }

      toast({
        title: "Dispute Submitted",
        description: "Your dispute has been submitted and will be reviewed by our team",
      });
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Failed to submit dispute:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit dispute",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
          <div className="flex items-center justify-between p-4 md:p-6 border-b">
            <div>
              <h2 className="text-lg md:text-xl font-semibold">Raise a Dispute</h2>
              {isWithinWindow && (
                <p className="text-sm text-muted-foreground mt-1">
                  Disputes must be raised within {disputeWindowHours} hours ({hoursRemaining}h remaining)
                </p>
              )}
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>

          {!isWithinWindow ? (
            <div className="p-4 md:p-6">
              <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Dispute Window Closed</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    The {disputeWindowHours}-hour window to raise a dispute has expired. 
                    Please contact support for assistance.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 md:mb-3">Issue Category</label>
                <div className="grid gap-2 md:gap-3">
                  {categories.map((cat) => (
                    <label
                      key={cat.value}
                      className={`flex items-start gap-2 md:gap-3 p-3 md:p-4 border rounded-lg cursor-pointer transition-colors ${
                        category === cat.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="category"
                        value={cat.value}
                        checked={category === cat.value}
                        onChange={(e) => setCategory(e.target.value as DisputeCategory)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{cat.label}</div>
                        <div className="text-sm text-muted-foreground">{cat.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide detailed information about the issue..."
                  rows={6}
                  className="resize-none"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Be specific and include relevant details
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Attachments (Optional)</label>
                <div className="space-y-3">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  {files.length < 5 && (
                    <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Upload images or PDF (max 10MB, up to 5 files)
                      </span>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        multiple
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Once submitted, our team will review your dispute and contact you within 24-48 hours. 
                  Payment will remain held until the dispute is resolved.
                </p>
              </div>

              <div className="flex gap-3">
                <Button onClick={onClose} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !description.trim()}
                  className="flex-1"
                >
                  {submitting ? "Submitting..." : "Submit Dispute"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
