import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  Phone,
  Share2,
  Shield,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import backend from "@/lib/backend";

interface SafetyPanelProps {
  bookingId: number;
  showShareOption?: boolean;
}

export function SafetyPanel({ bookingId, showShareOption = true }: SafetyPanelProps) {
  const [emergencyDialogOpen, setEmergencyDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [recipientContact, setRecipientContact] = useState("");
  const { toast } = useToast();

  const emergencyNumbers = [
    { name: "Emergency Services", number: "999", description: "Police, Fire, Ambulance" },
    { name: "Non-Emergency Police", number: "101", description: "Non-urgent police matters" },
    { name: "NHS Direct", number: "111", description: "Medical advice" },
    { name: "Domestic Abuse Helpline", number: "0808 2000 247", description: "24-hour support" },
  ];

  const handleEmergencyAlert = async () => {
    try {
      // Get user's location if available
      let latitude, longitude;
      if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        }).catch(() => null);
        
        if (position) {
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        }
      }

      await backend.safety.triggerEmergencyAlert({
        bookingId,
        latitude,
        longitude,
      });

      toast({
        title: "Alert Sent",
        description: "Braida support has been notified and will reach out shortly.",
      });
    } catch (error) {
      console.error("Failed to send emergency alert:", error);
    }
  };

  const handleShare = async () => {
    if (!recipientName) {
      toast({
        variant: "destructive",
        title: "Name Required",
        description: "Please enter the recipient's name",
      });
      return;
    }

    setSharing(true);
    try {
      const isEmail = recipientContact.includes("@");
      const response = await backend.bookings.shareBooking({
        bookingId,
        recipientName,
        recipientEmail: isEmail ? recipientContact : undefined,
        recipientPhone: !isEmail && recipientContact ? recipientContact : undefined,
      });

      setShareLink(response.shareLink);
      toast({
        title: "Booking Shared",
        description: "Share link created successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to share",
        description: error.message || "Could not create share link",
      });
    } finally {
      setSharing(false);
    }
  };

  const copyToClipboard = async () => {
    if (shareLink) {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="p-4 border-orange-200 bg-orange-50/50">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-orange-600" />
        <h3 className="font-semibold text-orange-800">Safety Features</h3>
      </div>

      <div className="space-y-3">
        {/* Emergency Button */}
        <Dialog open={emergencyDialogOpen} onOpenChange={setEmergencyDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="w-full gap-2">
              <AlertTriangle className="h-4 w-4" />
              Safety / Help
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Emergency Resources
              </DialogTitle>
              <DialogDescription>
                If you're in immediate danger, call 999 immediately.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {emergencyNumbers.map((item) => (
                <div
                  key={item.number}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <a
                    href={`tel:${item.number}`}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    <Phone className="h-4 w-4" />
                    {item.number}
                  </a>
                </div>
              ))}

              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Need help but not an emergency? Contact Braida support.
                </p>
                <Button onClick={handleEmergencyAlert} className="w-full gap-2">
                  <Shield className="h-4 w-4" />
                  Alert Braida Support
                </Button>
              </div>

              <a
                href="/safety"
                className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                View Safety Resources
              </a>
            </div>
          </DialogContent>
        </Dialog>

        {/* Share Booking */}
        {showShareOption && (
          <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full gap-2">
                <Share2 className="h-4 w-4" />
                Share with Trusted Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Booking Details</DialogTitle>
                <DialogDescription>
                  Share your appointment details with someone you trust. They'll receive
                  a link with the stylist's name, approximate location, and appointment time.
                </DialogDescription>
              </DialogHeader>

              {shareLink ? (
                <div className="space-y-4 mt-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 mb-2">
                      ✓ Share link created for {recipientName}
                    </p>
                    <div className="flex gap-2">
                      <Input value={shareLink} readOnly className="text-sm" />
                      <Button onClick={copyToClipboard} size="sm" variant="outline">
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This link expires in 48 hours. Send it to your trusted contact.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShareLink(null);
                      setRecipientName("");
                      setRecipientContact("");
                    }}
                    className="w-full"
                  >
                    Create Another Link
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Contact's Name *
                    </label>
                    <Input
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. Mum, Friend's name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email or Phone (optional)
                    </label>
                    <Input
                      value={recipientContact}
                      onChange={(e) => setRecipientContact(e.target.value)}
                      placeholder="For your reference"
                    />
                  </div>
                  <Button onClick={handleShare} disabled={sharing} className="w-full">
                    {sharing ? "Creating Link..." : "Create Share Link"}
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Card>
  );
}

