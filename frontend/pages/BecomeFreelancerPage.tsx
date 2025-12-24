import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Check, MapPin, Scissors, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { BraidaLogoLight } from "@/components/BraidaLogo";
import backend from "@/lib/backend";

const SERVICE_CATEGORIES = [
  { id: "hair", label: "Hair Styling", icon: "💇‍♀️", description: "Braids, locs, weaves, natural styles" },
  { id: "makeup", label: "Makeup", icon: "💄", description: "Bridal, editorial, everyday glam" },
  { id: "gele", label: "Gele Tying", icon: "👑", description: "Traditional head wraps" },
  { id: "tailoring", label: "Tailoring", icon: "✂️", description: "African fashion, alterations" },
  { id: "barbering", label: "Barbering", icon: "💈", description: "Cuts, fades, grooming" },
];

export default function BecomeFreelancerPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    locationArea: "",
    postcode: "",
    travelRadiusMiles: 10,
    categories: [] as string[],
  });

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/auth/login");
    }
  }, [navigate]);

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(c => c !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const handleSubmit = async () => {
    if (!formData.displayName.trim()) {
      toast({ variant: "destructive", title: "Please enter your display name" });
      return;
    }
    if (!formData.locationArea.trim()) {
      toast({ variant: "destructive", title: "Please enter your location area" });
      return;
    }
    if (!formData.postcode.trim()) {
      toast({ variant: "destructive", title: "Please enter your postcode" });
      return;
    }
    if (formData.categories.length === 0) {
      toast({ variant: "destructive", title: "Please select at least one service category" });
      return;
    }

    setLoading(true);
    try {
      const response = await backend.auth.becomeFreelancer({
        displayName: formData.displayName.trim(),
        bio: formData.bio.trim() || undefined,
        locationArea: formData.locationArea.trim(),
        postcode: formData.postcode.trim(),
        travelRadiusMiles: formData.travelRadiusMiles,
        categories: formData.categories,
      });

      // Update stored auth data
      if (response.token) {
        localStorage.setItem("authToken", response.token);
      }
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        user.roles = response.roles || [...(user.roles || []), "FREELANCER"];
        user.activeRole = response.activeRole || "FREELANCER";
        user.role = response.activeRole || "FREELANCER";
        user.hasFreelancerProfile = true;
        localStorage.setItem("user", JSON.stringify(user));
      }

      toast({
        title: "🎉 Welcome, Freelancer!",
        description: response.message || "Your freelancer profile has been created!",
      });

      // Navigate to freelancer dashboard
      navigate("/freelancer/dashboard");
    } catch (error: any) {
      console.error("Failed to create freelancer profile:", error);
      toast({
        variant: "destructive",
        title: "Failed to create profile",
        description: error.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-amber-400 mb-4">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Tell us about yourself</h2>
        <p className="text-gray-600 mt-2">This information will be shown to clients browsing for services</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Display Name *
          </label>
          <Input
            placeholder="e.g., Sarah's Braids, Beauty by Lola"
            value={formData.displayName}
            onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
            className="h-12"
          />
          <p className="text-xs text-gray-500 mt-1">This is how clients will see you</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio (Optional)
          </label>
          <Textarea
            placeholder="Tell clients about your experience, specialties, and what makes your services unique..."
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            rows={4}
          />
        </div>
      </div>

      <Button 
        onClick={() => setStep(2)} 
        disabled={!formData.displayName.trim()}
        className="w-full h-12 bg-gradient-to-r from-pink-500 to-amber-400 hover:from-pink-600 hover:to-amber-500"
      >
        Continue
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );

  const renderStep2 = () => {
    const canContinue = formData.postcode.trim().length >= 5;
    
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-amber-400 mb-4">
            <MapPin className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Where do you work?</h2>
          <p className="text-gray-600 mt-2">Help clients find you based on location</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Postcode *
            </label>
            <Input
              placeholder="e.g., M29 8GQ"
              value={formData.postcode}
              onChange={(e) => {
                const value = e.target.value.toUpperCase();
                setFormData(prev => ({ 
                  ...prev, 
                  postcode: value,
                  // Auto-set location area from postcode region
                  locationArea: prev.locationArea || (value.length >= 2 ? value.slice(0, 2) + " Area" : "")
                }));
              }}
              className="h-12 text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              How far will you travel? (miles)
            </label>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                min={1}
                max={50}
                value={formData.travelRadiusMiles}
                onChange={(e) => setFormData(prev => ({ ...prev, travelRadiusMiles: parseInt(e.target.value) || 10 }))}
                className="h-12 w-24 text-lg"
              />
              <span className="text-sm text-gray-500">miles from your postcode</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => setStep(1)}
            className="flex-1 h-12"
            type="button"
          >
            Back
          </Button>
          <Button 
            onClick={() => {
              console.log("[BecomeFreelancer] Continue clicked, postcode:", formData.postcode);
              if (canContinue) {
                // Ensure locationArea has a value
                if (!formData.locationArea.trim()) {
                  setFormData(prev => ({ ...prev, locationArea: formData.postcode.slice(0, 2) + " Area" }));
                }
                setStep(3);
              }
            }} 
            disabled={!canContinue}
            className={`flex-1 h-12 ${canContinue 
              ? "bg-gradient-to-r from-pink-500 to-amber-400 hover:from-pink-600 hover:to-amber-500" 
              : "bg-gray-300 cursor-not-allowed"}`}
            type="button"
          >
            Continue
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-amber-400 mb-4">
          <Scissors className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">What services do you offer?</h2>
        <p className="text-gray-600 mt-2">Select all categories that apply</p>
      </div>

      <div className="space-y-3">
        {SERVICE_CATEGORIES.map((category) => (
          <Card
            key={category.id}
            onClick={() => handleCategoryToggle(category.id)}
            className={`p-4 cursor-pointer transition-all ${
              formData.categories.includes(category.id)
                ? "border-pink-500 bg-pink-50 ring-2 ring-pink-200"
                : "border-gray-200 hover:border-pink-300 hover:bg-pink-25"
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">{category.icon}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{category.label}</h3>
                <p className="text-sm text-gray-500">{category.description}</p>
              </div>
              {formData.categories.includes(category.id) && (
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={() => setStep(2)}
          className="flex-1 h-12"
        >
          Back
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={formData.categories.length === 0 || loading}
          className="flex-1 h-12 bg-gradient-to-r from-pink-500 to-amber-400 hover:from-pink-600 hover:to-amber-500"
        >
          {loading ? (
            "Creating Profile..."
          ) : (
            <>
              Complete Setup
              <Sparkles className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-amber-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <BraidaLogoLight size="sm" />
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Progress indicator */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  s === step
                    ? "w-8 bg-gradient-to-r from-pink-500 to-amber-400"
                    : s < step
                    ? "w-2 bg-pink-500"
                    : "w-2 bg-gray-200"
                }`}
              />
            ))}
          </div>
          <p className="text-center text-xs text-gray-500 mt-1">Step {step} of 3</p>
        </div>
      </div>

      {/* Main content */}
      <main className="pt-32 pb-12 px-4">
        <div className="max-w-md mx-auto">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>
      </main>

      {/* Benefits footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-4">
        <div className="container mx-auto flex items-center justify-center gap-6 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Check className="h-3 w-3 text-green-500" /> Free to join
          </span>
          <span className="flex items-center gap-1">
            <Check className="h-3 w-3 text-green-500" /> Set your own prices
          </span>
          <span className="flex items-center gap-1">
            <Check className="h-3 w-3 text-green-500" /> Get paid securely
          </span>
        </div>
      </div>
    </div>
  );
}

