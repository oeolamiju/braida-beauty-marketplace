import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import backend from "@/lib/backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Calendar, Shield, Star, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { BraidaLogoLight } from "@/components/BraidaLogo";

export default function RegisterClientPage() {
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
        role: "CLIENT",
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
            role: "CLIENT"
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50/80 via-amber-50/40 to-background">
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 items-start max-w-6xl mx-auto">
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                Join Braida as a <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">Client</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Discover and book verified Afro & Caribbean beauty professionals across the UK
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Easy Booking</h3>
                  <p className="text-sm text-muted-foreground">Browse stylists, view availability, and book instantly</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Secure Payments</h3>
                  <p className="text-sm text-muted-foreground">Pay securely through the platform with payment protection</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Verified Professionals</h3>
                  <p className="text-sm text-muted-foreground">All stylists undergo identity verification and quality checks</p>
                </div>
              </div>
            </div>

            <div className="hidden lg:block p-6 bg-white rounded-2xl border shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-white fill-white" />
                </div>
                <div>
                  <div className="font-bold text-2xl">4.9 Rating</div>
                  <div className="text-sm text-muted-foreground">1200+ reviews</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground italic">
                "Found my go-to stylist on Braida. Booking is so easy and I always get amazing results!" - Sarah M.
              </p>
            </div>
          </div>

          <Card className="shadow-2xl border-2">
            <CardHeader>
              <CardTitle>Create Client Account</CardTitle>
              <CardDescription>Start booking amazing stylists today</CardDescription>
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
                    Want to offer services?{" "}
                    <Link to="/auth/register/freelancer" className="text-orange-600 hover:underline font-medium">
                      Register as a Professional
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
