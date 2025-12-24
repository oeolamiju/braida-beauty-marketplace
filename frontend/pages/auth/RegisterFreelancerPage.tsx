import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import backend from "@/lib/backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { TrendingUp, Calendar, CreditCard, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { BraidaLogoLight } from "@/components/BraidaLogo";

export default function RegisterFreelancerPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match",
      });
      return;
    }

    if (!formData.email && !formData.phone) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide either email or phone",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await backend.auth.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        password: formData.password,
        role: "FREELANCER",
      });

      toast({
        title: "Success",
        description: response.message,
      });

      if (response.message.includes("auto-verified") || response.message.includes("can now log in")) {
        setTimeout(() => navigate("/auth/login"), 2000);
      } else {
        navigate("/auth/verify", { 
          state: { 
            emailOrPhone: formData.email || formData.phone,
            role: "FREELANCER"
          } 
        });
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-600 via-orange-500 to-amber-600">
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/90 hover:text-white mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 items-start max-w-6xl mx-auto">
          <div className="space-y-6 text-white">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                Grow Your Beauty Business with <span className="text-white/90">Braida</span>
              </h1>
              <p className="text-lg text-white/90">
                Join the UK's leading platform for Afro & Caribbean beauty professionals
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Grow Your Client Base</h3>
                  <p className="text-sm text-white/80">Reach thousands of clients looking for your expertise</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Manage Bookings</h3>
                  <p className="text-sm text-white/80">Easy scheduling with automated calendar management</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Get Paid Securely</h3>
                  <p className="text-sm text-white/80">Secure payment processing with protection on every booking</p>
                </div>
              </div>
            </div>

            <div className="hidden lg:block p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold mb-1">1000+</div>
                  <div className="text-sm text-white/80">Active Stylists</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-1">10k+</div>
                  <div className="text-sm text-white/80">Bookings Made</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-1">4.9★</div>
                  <div className="text-sm text-white/80">Average Rating</div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <p className="text-sm italic mb-2">
                "Braida has transformed my business. I'm fully booked every week and my income has doubled!" - Amara O.
              </p>
              <p className="text-xs text-white/70">Professional Braider, South London</p>
            </div>
          </div>

          <Card className="shadow-2xl border-2">
            <CardHeader>
              <CardTitle>Create Professional Account</CardTitle>
              <CardDescription>Start accepting bookings in minutes</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone (optional)</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Must be 8+ characters with uppercase, lowercase, number, and special character
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm Password</label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>

                <div className="text-center text-sm space-y-2">
                  <div>
                    Already have an account?{" "}
                    <Link to="/auth/login" className="text-orange-600 hover:underline font-medium">
                      Login
                    </Link>
                  </div>
                  <div>
                    Looking to book services?{" "}
                    <Link to="/auth/register/client" className="text-orange-600 hover:underline font-medium">
                      Register as a Client
                    </Link>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
