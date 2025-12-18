import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Upload, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import backend from "@/lib/backend";

type ReportIssueType = "safety" | "quality" | "payment" | "harassment" | "fraud" | "other";

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  reportedUserId: string;
  freelancerId?: string;
  bookingId?: string;
  context?: string;
}

const issueTypes: { value: ReportIssueType; label: string; description: string }[] = [
  { value: "safety", label: "Safety Concerns", description: "Unsafe practices or dangerous behavior" },
  { value: "quality", label: "Quality Issues", description: "Poor service quality or unprofessional work" },
  { value: "payment", label: "Payment Problems", description: "Payment disputes or fraudulent charges" },
  { value: "harassment", label: "Harassment", description: "Inappropriate or abusive behavior" },
  { value: "fraud", label: "Fraud", description: "Scam, fake identity, or deceptive practices" },
  { value: "other", label: "Other", description: "Other concerns not listed above" },
];

export function ReportModal({ open, onClose, reportedUserId, freelancerId, bookingId, context }: ReportModalProps) {
  const [selectedType, setSelectedType] = useState<ReportIssueType | null>(null);
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only JPEG, PNG, WebP, and PDF files are allowed",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "File size must not exceed 5MB",
        variant: "destructive",
      });
      return;
    }

    setAttachment(file);
  };

  const handleSubmit = async () => {
    if (!selectedType) {
      toast({
        title: "Issue type required",
        description: "Please select an issue type",
        variant: "destructive",
      });
      return;
    }

    if (description.trim().length < 10) {
      toast({
        title: "Description too short",
        description: "Please provide at least 10 characters",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let attachmentUrl: string | undefined;

      if (attachment) {
        const arrayBuffer = await attachment.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(arrayBuffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );

        const uploadResult = await backend.reports.uploadAttachment({
          fileName: attachment.name,
          contentType: attachment.type,
          fileData: base64,
        });

        attachmentUrl = uploadResult.url;
      }

      await backend.reports.submit({
        reportedUserId,
        freelancerId,
        bookingId,
        issueType: selectedType,
        description: description.trim(),
        attachmentUrl,
      });

      toast({
        title: "Report submitted",
        description: "Thank you for your report. Our team will review it shortly.",
      });

      setSelectedType(null);
      setDescription("");
      setAttachment(null);
      onClose();
    } catch (error: any) {
      console.error("Failed to submit report:", error);
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit report",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Report {context || "User"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 md:space-y-6 pb-2">
          <div>
            <label className="text-sm font-medium mb-2 md:mb-3 block">What type of issue are you reporting?</label>
            <div className="grid gap-2 md:gap-2">
              {issueTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`p-3 md:p-4 rounded-lg border-2 text-left transition-all ${
                    selectedType === type.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="font-medium mb-1">{type.label}</div>
                  <div className="text-sm text-muted-foreground">{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <Textarea
              placeholder="Please provide details about the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Minimum 10 characters. Be specific and factual.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Attachment (Optional)</label>
            {attachment ? (
              <div className="flex items-center gap-2 p-3 border rounded-lg">
                <div className="flex-1 truncate text-sm">{attachment.name}</div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAttachment(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Upload screenshot or document (JPEG, PNG, WebP, PDF, max 5MB)
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-2">
            <p className="font-medium">Before you submit:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Reports are reviewed by our team and do not automatically result in account actions</li>
              <li>False reports may result in action against your account</li>
              <li>All information provided will be kept confidential</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button onClick={onClose} variant="outline" className="flex-1" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
