import { useState } from "react";
import { Briefcase, ArrowRight, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";

interface BecomeFreelancerCardProps {
  onSuccess?: () => void;
}

const categories = [
  { value: "hair", label: "Hair Styling" },
  { value: "makeup", label: "Makeup" },
  { value: "gele", label: "Gele" },
  { value: "tailoring", label: "Tailoring" },
];

export function BecomeFreelancerCard({ onSuccess }: BecomeFreelancerCardProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    locationArea: "",
    postcode: "",
    travelRadiusMiles: 10,
    categories: [] as string[],
  });

  const handleCategoryToggle = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleSubmit = async () => {
    if (!formData.displayName.trim()) {
      toast({
        title: "Display name required",
        description: "Please enter a display name for your freelancer profile",
        variant: "destructive",
      });
      return;
    }

    if (!formData.locationArea.trim() || !formData.postcode.trim()) {
      toast({
        title: "Location required",
        description: "Please enter your location area and postcode",
        variant: "destructive",
      });
      return;
    }

    if (formData.categories.length === 0) {
      toast({
        title: "Categories required",
        description: "Please select at least one service category",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await backend.auth.becomeFreelancer(formData);

      localStorage.setItem("authToken", response.token);
      
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const updatedUser = {
          ...user,
          roles: response.roles,
          activeRole: response.activeRole,
          role: response.activeRole,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      toast({
        title: "Success!",
        description: response.message,
      });

      setShowDialog(false);
      
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.href = "/freelancer/dashboard";
      }
    } catch (error: any) {
      console.error("Failed to become freelancer:", error);
      toast({
        title: "Failed to upgrade account",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <Briefcase className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Become a Freelancer</CardTitle>
              <CardDescription>Start offering your services on Braida</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Expand your account to offer professional beauty services. You'll be able to:
          </p>
          <ul className="space-y-2">
            {[
              "List your services and set your own prices",
              "Manage bookings and availability",
              "Build your client base",
              "Earn money doing what you love",
            ].map((benefit, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full bg-purple-600 hover:bg-purple-700"
            onClick={() => setShowDialog(true)}
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Become a Freelancer</DialogTitle>
            <DialogDescription>
              Fill in your details to start offering services on Braida
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Display Name *</label>
              <Input
                placeholder="How you want clients to see you"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bio</label>
              <Textarea
                placeholder="Tell clients about yourself and your experience"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Location Area *</label>
                <Input
                  placeholder="e.g., South London"
                  value={formData.locationArea}
                  onChange={(e) => setFormData({ ...formData, locationArea: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Postcode *</label>
                <Input
                  placeholder="e.g., SW1A 1AA"
                  value={formData.postcode}
                  onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Travel Radius (miles)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.travelRadiusMiles}
                onChange={(e) => setFormData({ ...formData, travelRadiusMiles: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Service Categories *</label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.value}
                    type="button"
                    variant={formData.categories.includes(category.value) ? "default" : "outline"}
                    onClick={() => handleCategoryToggle(category.value)}
                    className="justify-start"
                  >
                    {formData.categories.includes(category.value) && (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    {category.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? "Creating Profile..." : "Become a Freelancer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
