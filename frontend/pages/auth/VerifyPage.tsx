import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import backend from "@/lib/backend";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle2, Mail, Loader2, AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";

type VerifyState = "loading" | "verified" | "error" | "awaiting" | "resending";

interface ErrorInfo {
  type: "expired" | "invalid" | "already_used" | "unknown";
  message: string;
}

export default function VerifyPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<VerifyState>("awaiting");
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      handleVerify(tokenParam);
    }
  }, [searchParams]);

  const parseError = (error: any): ErrorInfo => {
    const message = error?.message?.toLowerCase() || "";
    
    if (message.includes("expired")) {
      return {
        type: "expired",
        message: "Your verification link has expired. Please request a new one.",
      };
    }
    if (message.includes("already used") || message.includes("already verified")) {
      return {
        type: "already_used",
        message: "This verification link has already been used. Please log in to continue.",
      };
    }
    if (message.includes("invalid") || message.includes("not found")) {
      return {
        type: "invalid",
        message: "This verification link is invalid. Please request a new one.",
      };
    }
    return {
      type: "unknown",
      message: error?.message || "Verification failed. Please try again.",
    };
  };

  const handleVerify = async (token: string) => {
    setState("loading");

    try {
      const decodedToken = decodeURIComponent(token);
      console.log("Original token:", token);
      console.log("Decoded token:", decodedToken);
      
      const response = await backend.auth.verify({ token: decodedToken });

      localStorage.setItem("authToken", response.authToken);
      localStorage.setItem("user", JSON.stringify(response.user));

      setState("verified");

      toast({
        title: "Account Verified!",
        description: "Your account has been successfully verified.",
      });

      setTimeout(() => {
        if (response.user.role === "CLIENT") {
          navigate("/client/discover");
        } else if (response.user.role === "FREELANCER") {
          navigate("/freelancer/dashboard");
        } else if (response.user.role === "ADMIN") {
          navigate("/admin/dashboard");
        }
      }, 2000);
    } catch (error: any) {
      console.error("Verification error:", error);
      const errorInfo = parseError(error);
      setErrorInfo(errorInfo);
      setState("error");
    }
  };

  const handleResendVerification = async () => {
    if (!resendEmail.trim()) {
      toast({
        variant: "destructive",
        title: "Email required",
        description: "Please enter your email address.",
      });
      return;
    }

    setResendLoading(true);

    try {
      await backend.auth.resendVerification({ emailOrPhone: resendEmail });
      setResendSuccess(true);
      toast({
        title: "Verification email sent!",
        description: "Please check your inbox for the new verification link.",
      });
    } catch (error: any) {
      console.error("Resend error:", error);
      
      if (error?.message?.includes("already verified")) {
        toast({
          title: "Already Verified",
          description: "Your account is already verified. Please log in.",
        });
        setTimeout(() => navigate("/auth/login"), 1500);
      } else if (error?.message?.includes("not found") || error?.message?.includes("account not found")) {
        toast({
          variant: "destructive",
          title: "Account not found",
          description: "No account exists with this email. Please register first or check if you used a different email.",
        });
        setErrorInfo({
          type: "invalid",
          message: "No account found with this email address."
        });
      } else {
        toast({
          variant: "destructive",
          title: "Failed to resend",
          description: error?.message || "Could not send verification email. Please try again.",
        });
      }
    } finally {
      setResendLoading(false);
    }
  };

  // Loading state
  if (state === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50/50 via-background to-amber-50/30 p-4">
        <Card className="w-full max-w-md border-2">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-4">
              <div className="relative mx-auto w-20 h-20">
                <div className="absolute inset-0 bg-orange-100 rounded-full animate-ping opacity-75"></div>
                <div className="relative bg-gradient-to-br from-orange-500 to-amber-500 rounded-full w-20 h-20 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                </div>
              </div>
              <h2 className="text-2xl font-bold">Verifying your account...</h2>
              <p className="text-muted-foreground">Please wait a moment</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verified success state
  if (state === "verified") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50/50 via-background to-emerald-50/30 p-4">
        <Card className="w-full max-w-md border-2 border-green-200">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-green-700">Account Verified!</h2>
              <p className="text-muted-foreground">
                Your email has been successfully verified.<br />
                Redirecting you to your dashboard...
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state with resend option
  if (state === "error" && errorInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50/50 via-background to-amber-50/30 p-4">
        <Card className="w-full max-w-md border-2">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
            <CardTitle className="text-xl">
              {errorInfo.type === "expired" && "Link Expired"}
              {errorInfo.type === "invalid" && "Invalid Link"}
              {errorInfo.type === "already_used" && "Already Verified"}
              {errorInfo.type === "unknown" && "Verification Failed"}
            </CardTitle>
            <CardDescription className="text-base">
              {errorInfo.message}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {errorInfo.type === "already_used" ? (
              <div className="space-y-4">
                <Button 
                  className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700" 
                  onClick={() => navigate("/auth/login")}
                >
                  Go to Login
                </Button>
              </div>
            ) : errorInfo.type === "invalid" && errorInfo.message.includes("No account found") ? (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800 mb-3">
                    It looks like you don't have an account yet. Here's what you can do:
                  </p>
                  <ul className="text-xs text-amber-700 space-y-2 list-disc list-inside">
                    <li>Register for a new account using the button below</li>
                    <li>Check if you used a different email address</li>
                    <li>Try using your phone number instead if you registered with that</li>
                  </ul>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700" 
                  onClick={() => navigate("/auth/register")}
                >
                  Register a New Account
                </Button>
                <Button 
                  variant="outline"
                  className="w-full border-2"
                  onClick={() => {
                    setErrorInfo(null);
                    setState("awaiting");
                    setResendEmail("");
                  }}
                >
                  Try a Different Email
                </Button>
              </div>
            ) : resendSuccess ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-700">Email Sent!</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Check your inbox for the new verification link.
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Didn't receive it? Check your spam folder or{" "}
                  <button 
                    onClick={() => setResendSuccess(false)} 
                    className="text-orange-600 hover:underline"
                  >
                    try again
                  </button>
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h3 className="font-semibold text-sm mb-2 text-orange-800">Request a new verification link</h3>
                  <p className="text-xs text-orange-700 mb-3">
                    Enter the email address you used to register
                  </p>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="mb-3"
                    disabled={resendLoading}
                  />
                  <Button 
                    className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
                    onClick={handleResendVerification}
                    disabled={resendLoading || !resendEmail.trim()}
                  >
                    {resendLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Resend Verification Email
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
            
            <div className="pt-4 border-t text-center">
              <Link 
                to="/auth/login" 
                className="text-sm text-muted-foreground hover:text-orange-600 inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default awaiting state (no token in URL)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50/50 via-background to-amber-50/30 p-4">
      <Card className="w-full max-w-md border-2">
        <CardHeader className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-10 h-10 text-orange-600" />
          </div>
          <CardTitle className="text-2xl">Check Your Email</CardTitle>
          <CardDescription className="text-base">
            We've sent a verification link to your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 text-center">
            <p className="text-sm text-muted-foreground">
              Click the link in the email to verify your account and start using Braida.
            </p>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-800">
                <strong>Tip:</strong> If you don't see the email, check your spam or junk folder. 
                The link expires in 24 hours.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Didn't receive the email?</span>
              </div>
            </div>

            <div className="space-y-3">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                disabled={resendLoading}
              />
              <Button 
                variant="outline"
                className="w-full border-2 hover:border-orange-600 hover:text-orange-600"
                onClick={handleResendVerification}
                disabled={resendLoading || !resendEmail.trim()}
              >
                {resendLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Resend Verification Email
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="text-center text-sm">
            <Link to="/auth/login" className="text-orange-600 hover:underline inline-flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" />
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
