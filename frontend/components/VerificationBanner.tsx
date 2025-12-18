import { useState } from "react";
import { AlertCircle, X, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import backend from "@/lib/backend";
import { useToast } from "@/components/ui/use-toast";

interface VerificationBannerProps {
  emailOrPhone: string;
}

export default function VerificationBanner({ emailOrPhone }: VerificationBannerProps) {
  const { toast } = useToast();
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);

    try {
      const response = await backend.auth.resendVerification({ emailOrPhone });

      toast({
        title: "Success",
        description: response.message,
      });
    } catch (error: any) {
      console.error("Resend error:", error);
      toast({
        variant: "destructive",
        title: "Resend failed",
        description: error.message || "Failed to resend verification",
      });
    } finally {
      setLoading(false);
    }
  };

  if (dismissed) return null;

  return (
    <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Verify Your Account</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Please verify your account to access all features. Check your email or phone for the verification link.
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleResend}
                disabled={loading}
              >
                <MailCheck className="w-4 h-4 mr-2" />
                {loading ? "Sending..." : "Resend Verification"}
              </Button>
              <Button
                size="sm"
                variant="link"
                onClick={() => window.location.href = "/auth/verify"}
              >
                Enter Code
              </Button>
            </div>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
