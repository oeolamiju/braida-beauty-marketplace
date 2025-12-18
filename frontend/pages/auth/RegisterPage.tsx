import { useState } from "react";
import { useNavigate } from "react-router-dom";
import backend from "@/lib/backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
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
    role: "CLIENT" as "CLIENT" | "FREELANCER",
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
        role: formData.role,
      });

      toast({
        title: "Success",
        description: response.message,
      });

      navigate("/auth/verify", { state: { emailOrPhone: formData.email || formData.phone } });
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>Register for Braida Beauty Marketplace</CardDescription>
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

            <div className="space-y-2">
              <label className="text-sm font-medium">I want to</label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    checked={formData.role === "CLIENT"}
                    onChange={() => setFormData({ ...formData, role: "CLIENT" })}
                  />
                  <span>Book services</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    checked={formData.role === "FREELANCER"}
                    onChange={() => setFormData({ ...formData, role: "FREELANCER" })}
                  />
                  <span>Offer services</span>
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Register"}
            </Button>

            <div className="text-center text-sm">
              Already have an account?{" "}
              <a href="/auth/login" className="text-primary hover:underline">
                Login
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
