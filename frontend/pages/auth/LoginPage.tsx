import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import backend from "@/lib/backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { AlertTriangle, Loader2, Mail, RefreshCw, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
  });
  
  // State for unverified user flow
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowVerificationPrompt(false);
    setResendSuccess(false);

    try {
      const response = await backend.auth.login({
        emailOrPhone: formData.emailOrPhone,
        password: formData.password,
      });

      localStorage.setItem("authToken", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      toast({
        title: "Login successful",
        description: `Welcome back, ${response.user.firstName}!`,
      });

      if (response.user.role === "CLIENT") {
        navigate("/client/discover");
      } else if (response.user.role === "FREELANCER") {
        navigate("/freelancer/dashboard");
      } else if (response.user.role === "ADMIN") {
        navigate("/admin/dashboard");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Check if the error is about verification
      const errorMessage = error?.message?.toLowerCase() || "";
      if (errorMessage.includes("verify") || errorMessage.includes("verification")) {
        setShowVerificationPrompt(true);
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message || "Invalid credentials",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!formData.emailOrPhone.trim()) {
      toast({
        variant: "destructive",
        title: "Email required",
        description: "Please enter your email address above.",
      });
      return;
    }

    setResendLoading(true);

    try {
      await backend.auth.resendVerification({ emailOrPhone: formData.emailOrPhone });
      setResendSuccess(true);
      toast({
        title: "Verification email sent!",
        description: "Please check your inbox for the verification link.",
      });
    } catch (error: any) {
      console.error("Resend error:", error);
      
      if (error?.message?.includes("already verified")) {
        toast({
          title: "Already Verified",
          description: "Your account is already verified. Please try logging in again.",
        });
        setShowVerificationPrompt(false);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50/50 via-background to-amber-50/30 p-4">
      <Card className="w-full max-w-md border-2">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-amber-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="font-bold text-2xl">Braida</span>
          </div>
          <CardTitle className="text-xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          {showVerificationPrompt ? (
            <div className="space-y-6">
              {/* Verification Required Alert */}
              <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-800">Email Verification Required</h3>
                    <p className="text-sm text-amber-700 mt-1">
                      Please verify your email address before signing in. Check your inbox for the verification link.
                    </p>
                  </div>
                </div>
              </div>

              {resendSuccess ? (
                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mail className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-green-800">Verification Email Sent!</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Check your inbox at <strong>{formData.emailOrPhone}</strong>
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    Don't see it? Check your spam folder.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Didn't receive the verification email?
                  </p>
                  <Button 
                    className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
                    onClick={handleResendVerification}
                    disabled={resendLoading}
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
              )}

              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => {
                  setShowVerificationPrompt(false);
                  setResendSuccess(false);
                }}
              >
                ← Back to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email or Phone</label>
                <Input
                  value={formData.emailOrPhone}
                  onChange={(e) => setFormData({ ...formData, emailOrPhone: e.target.value })}
                  placeholder="Enter your email or phone number"
                  required
                  className="border-2 focus:border-orange-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                  className="border-2 focus:border-orange-600"
                />
              </div>

              <div className="text-right">
                <Link to="/auth/forgot-password" className="text-sm text-orange-600 hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">New to Braida?</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link to="/auth/register/client">
                  <Button type="button" variant="outline" className="w-full border-2 hover:border-orange-600 hover:text-orange-600">
                    Book Services
                  </Button>
                </Link>
                <Link to="/auth/register/freelancer">
                  <Button type="button" variant="outline" className="w-full border-2 hover:border-orange-600 hover:text-orange-600">
                    Offer Services
                  </Button>
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
