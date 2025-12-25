import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, MapPin, Camera, Loader2, Upload, Check, Shield, Star, 
  Calendar, CreditCard, ChevronRight, LogOut, 
  Briefcase, TrendingUp, Eye, BadgeCheck, Clock
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import backend from "@/lib/backend";
import type { FreelancerProfile as FreelancerProfileType } from "~backend/profiles/get_profile";
import type { PortfolioItem } from "~backend/profiles/list_portfolio";
import { ImageUploader } from "@/components/ImageUploader";
import { ProfilePhotoUploader } from "@/components/ProfilePhotoUploader";
import { PortfolioGallery } from "@/components/PortfolioGallery";

const TRAVEL_RADIUS_OPTIONS = [5, 10, 15, 20, 30];
const CATEGORY_OPTIONS = [
  { value: "hair", label: "Hair", icon: "💇‍♀️" },
  { value: "makeup", label: "Makeup", icon: "💄" },
  { value: "gele", label: "Gele", icon: "👑" },
  { value: "tailoring", label: "Tailoring", icon: "✂️" },
  { value: "barbering", label: "Barbering", icon: "💈" },
  { value: "nails", label: "Nails", icon: "💅" },
];

interface Style {
  id: number;
  name: string;
  description: string | null;
  referenceImageUrl: string | null;
  isActive: boolean;
}

interface StylesByCategory {
  [key: string]: Style[];
}

interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  role: string;
  isVerified: boolean;
  status: string;
}

export default function FreelancerProfile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [profile, setProfile] = useState<FreelancerProfileType | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [allStyles, setAllStyles] = useState<Style[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>("basic");

  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    profilePhotoUrl: "",
    locationArea: "",
    postcode: "",
    travelRadiusMiles: 10,
    categories: [] as string[],
    defaultStudioFeePence: 0,
    defaultMobileFeePence: 0,
  });

  const [portfolioCaption, setPortfolioCaption] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const userData = await backend.auth.me();
      setUser(userData);
      
      const [profileData, portfolioData, stylesData] = await Promise.all([
        backend.profiles.getProfile({ userId: userData.id }),
        backend.profiles.listPortfolio({ userId: userData.id }),
        backend.styles.list({}),
      ]);

      setProfile(profileData);
      setPortfolio(portfolioData.items);
      setAllStyles(stylesData.styles);
      setSelectedStyles(profileData.styleIds || []);
      
      // Ensure categories is always an array (Postgres might return it as a string)
      let categories: string[] = [];
      const rawCategories = profileData.categories as unknown;
      if (Array.isArray(rawCategories)) {
        categories = rawCategories;
      } else if (typeof rawCategories === 'string') {
        // Handle Postgres array string format like "{hair,makeup}" or "hair,makeup"
        const cleanStr = (rawCategories as string).replace(/^\{|\}$/g, '');
        categories = cleanStr ? cleanStr.split(',').map((s: string) => s.trim()) : [];
      }
      
      setFormData({
        displayName: profileData.displayName || "",
        bio: profileData.bio || "",
        profilePhotoUrl: profileData.profilePhotoUrl || "",
        locationArea: profileData.locationArea || "",
        postcode: profileData.postcode || "",
        travelRadiusMiles: profileData.travelRadiusMiles || 10,
        categories,
        defaultStudioFeePence: (profileData.defaultStudioFeePence || 0) / 100,
        defaultMobileFeePence: (profileData.defaultMobileFeePence || 0) / 100,
      });
    } catch (error: any) {
      console.error("Failed to load profile:", error);
      
      if (error.code === "unauthenticated") {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        window.location.href = "/auth/login";
        return;
      }
      
      // Handle case where user is not a freelancer
      if (error.code === "invalid_argument" && error.message?.includes("not a freelancer")) {
        toast({
          title: "Not a Freelancer",
          description: "You need to become a freelancer to access this page",
          variant: "destructive",
        });
        navigate("/become-freelancer");
        return;
      }
      
      toast({
        title: "Error",
        description: error.message || "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await backend.profiles.updateProfile({
        ...formData,
        defaultStudioFeePence: Math.round(formData.defaultStudioFeePence * 100),
        defaultMobileFeePence: Math.round(formData.defaultMobileFeePence * 100),
        styleIds: selectedStyles,
      });
      toast({
        title: "Profile updated",
        description: "Your changes have been saved successfully",
      });
      loadProfile();
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePhotoUpload = async (photoId: string) => {
    try {
      setUploadingPhoto(true);
      const photoUrl = await backend.profiles.confirmProfilePhoto({ photoId });
      await backend.profiles.updateProfile({
        profilePhotoUrl: photoUrl.url,
      });
      toast({
        title: "Success",
        description: "Profile photo updated",
      });
      loadProfile();
    } catch (error) {
      console.error("Failed to save profile photo:", error);
      toast({
        title: "Error",
        description: "Failed to update profile photo",
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePortfolioUpload = async (imageId: string) => {
    try {
      await backend.profiles.savePortfolioItem({
        imageId,
        caption: portfolioCaption || undefined,
      });
      setPortfolioCaption("");
      toast({
        title: "Success",
        description: "Portfolio image added",
      });
      loadProfile();
    } catch (error) {
      console.error("Failed to save portfolio item:", error);
      toast({
        title: "Error",
        description: "Failed to add portfolio image",
        variant: "destructive",
      });
    }
  };

  const handleDeletePortfolio = async (itemId: number) => {
    try {
      await backend.profiles.deletePortfolioItem({ itemId });
      toast({ title: "Portfolio image deleted" });
      loadProfile();
    } catch (error) {
      console.error("Failed to delete portfolio item:", error);
      toast({
        title: "Error",
        description: "Failed to delete portfolio image",
        variant: "destructive",
      });
    }
  };

  const toggleCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const toggleStyle = (styleId: number) => {
    setSelectedStyles((prev) =>
      prev.includes(styleId)
        ? prev.filter((id) => id !== styleId)
        : [...prev, styleId]
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/auth/login");
    toast({ title: "Logged out successfully" });
  };

  const getStylesByCategory = (): StylesByCategory => {
    const stylesByCategory: StylesByCategory = {};
    CATEGORY_OPTIONS.forEach(cat => {
      stylesByCategory[cat.value] = [];
    });

    allStyles.forEach((style) => {
      const name = style.name.toLowerCase();
      if (name.includes('braid') || name.includes('loc') || name.includes('wig') || name.includes('hair') || name.includes('weave')) {
        stylesByCategory.hair.push(style);
      } else if (name.includes('makeup') || name.includes('glam')) {
        stylesByCategory.makeup.push(style);
      } else if (name.includes('gele')) {
        stylesByCategory.gele.push(style);
      } else if (name.includes('tailor') || name.includes('aso') || name.includes('garment')) {
        stylesByCategory.tailoring.push(style);
      } else if (name.includes('nail')) {
        stylesByCategory.nails?.push(style);
      } else if (name.includes('barber') || name.includes('fade') || name.includes('cut')) {
        stylesByCategory.barbering?.push(style);
      }
    });

    return stylesByCategory;
  };

  const stylesByCategory = getStylesByCategory();
  const verificationStatus = profile?.verificationStatus || "not_started";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-gray-500">Manage your professional profile and settings</p>
        </div>

        <div className="grid gap-6">
          {/* Profile Header Card */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                {formData.profilePhotoUrl ? (
                  <img
                    src={formData.profilePhotoUrl}
                    alt="Profile"
                    className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-pink-100 to-amber-100 flex items-center justify-center border-4 border-white shadow-lg">
                    <span className="text-2xl font-bold text-pink-600">
                      {formData.displayName?.charAt(0) || user?.firstName?.charAt(0) || "?"}
                    </span>
                  </div>
                )}
                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  </div>
                )}
              </div>
              
              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold">{formData.displayName || "Your Business Name"}</h2>
                    <p className="text-gray-500 text-sm">{user?.email}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        <Briefcase className="h-3 w-3 mr-1" />
                        Freelancer
                      </Badge>
                      {verificationStatus === "approved" ? (
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          <BadgeCheck className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : verificationStatus === "pending" ? (
                        <Badge className="bg-amber-100 text-amber-700 text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending Verification
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-gray-500">
                          <Shield className="h-3 w-3 mr-1" />
                          Not Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/freelancers/${user?.id}`)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {profile?.totalReviews || 0}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center justify-center">
                      <Star className="h-3 w-3 mr-1 text-amber-500" />
                      Reviews
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{formData.categories.length}</p>
                    <p className="text-xs text-gray-500">Categories</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{portfolio.length}</p>
                    <p className="text-xs text-gray-500">Portfolio</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="divide-y">
            <button 
              onClick={() => navigate("/freelancer/services")}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-pink-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">My Services</p>
                  <p className="text-sm text-gray-500">Manage your service listings</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>

            <button 
              onClick={() => navigate("/freelancer/availability")}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Availability</p>
                  <p className="text-sm text-gray-500">Set your working hours</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>

            <button 
              onClick={() => navigate("/freelancer/earnings")}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Earnings</p>
                  <p className="text-sm text-gray-500">View your income and payouts</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>

            <button 
              onClick={() => navigate("/freelancer/verification")}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-amber-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Verification</p>
                  <p className="text-sm text-gray-500">
                    {verificationStatus === "approved" 
                      ? "Your profile is verified" 
                      : "Get verified to build trust"}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>

            <button 
              onClick={() => navigate("/freelancer/payout-setup")}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Payout Settings</p>
                  <p className="text-sm text-gray-500">Bank account and payments</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          </Card>

          {/* Profile Photo Section */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Camera className="h-5 w-5 mr-2" />
              Profile Photo
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                {formData.profilePhotoUrl ? (
                  <img
                    src={formData.profilePhotoUrl}
                    alt="Profile"
                    className="h-32 w-32 rounded-full object-cover border-4 border-gray-100"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-50">
                    <User className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-3">
                  Upload a professional photo to help clients recognize you
                </p>
                <ProfilePhotoUploader
                  onUploadComplete={handleProfilePhotoUpload}
                  onError={(error) =>
                    toast({
                      title: "Upload Error",
                      description: error,
                      variant: "destructive",
                    })
                  }
                />
              </div>
            </div>
          </Card>

          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Display Name *</label>
                <Input
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="Your professional name (e.g., Sarah's Braids)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell clients about yourself and your experience..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Location Area *
                  </label>
                  <Input
                    value={formData.locationArea}
                    onChange={(e) => setFormData({ ...formData, locationArea: e.target.value })}
                    placeholder="e.g. Peckham, South London"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Postcode *</label>
                  <Input
                    value={formData.postcode}
                    onChange={(e) => setFormData({ ...formData, postcode: e.target.value.toUpperCase() })}
                    placeholder="e.g. SE15 4QZ"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Travel Radius</label>
                <div className="flex flex-wrap gap-2">
                  {TRAVEL_RADIUS_OPTIONS.map((radius) => (
                    <Button
                      key={radius}
                      type="button"
                      variant={formData.travelRadiusMiles === radius ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData({ ...formData, travelRadiusMiles: radius })}
                    >
                      {radius} miles
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Service Categories */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-2">Service Categories</h2>
            <p className="text-sm text-gray-500 mb-4">Select the categories you offer (choose at least one)</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => toggleCategory(cat.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    formData.categories.includes(cat.value)
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-200 hover:border-pink-300"
                  }`}
                >
                  <span className="text-2xl mb-1 block">{cat.icon}</span>
                  <span className="text-sm font-medium">{cat.label}</span>
                  {formData.categories.includes(cat.value) && (
                    <Check className="h-4 w-4 text-pink-500 float-right" />
                  )}
                </button>
              ))}
            </div>
          </Card>

          {/* Default Pricing */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-2">Default Pricing</h2>
            <p className="text-sm text-gray-500 mb-4">Set default fees. Customize pricing for individual services later.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Studio Fee (£)</label>
                <p className="text-xs text-gray-500 mb-2">When client travels to you</p>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.defaultStudioFeePence}
                  onChange={(e) => setFormData({ ...formData, defaultStudioFeePence: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Mobile Fee (£)</label>
                <p className="text-xs text-gray-500 mb-2">When you travel to client</p>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.defaultMobileFeePence}
                  onChange={(e) => setFormData({ ...formData, defaultMobileFeePence: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
            </div>
          </Card>

          {/* Styles Offered */}
          {formData.categories.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-2">Styles Offered</h2>
              <p className="text-sm text-gray-500 mb-4">Select the specific styles you can deliver</p>
              
              <div className="space-y-6">
                {formData.categories.map((category) => {
                  const categoryData = CATEGORY_OPTIONS.find(c => c.value === category);
                  const stylesInCategory = stylesByCategory[category] || [];
                  
                  if (stylesInCategory.length === 0) return null;
                  
                  return (
                    <div key={category}>
                      <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <span>{categoryData?.icon}</span>
                        {categoryData?.label} Styles
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {stylesInCategory.map((style) => (
                          <button
                            key={style.id}
                            type="button"
                            onClick={() => toggleStyle(style.id)}
                            className={`p-3 rounded-lg border text-left transition-all ${
                              selectedStyles.includes(style.id)
                                ? 'border-pink-500 bg-pink-50'
                                : 'border-gray-200 hover:border-pink-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{style.name}</span>
                              {selectedStyles.includes(style.id) && (
                                <Check className="h-4 w-4 text-pink-500" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Save Button */}
          <Card className="p-6">
            <Button onClick={handleSaveProfile} disabled={saving} className="w-full sm:w-auto">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save All Changes
                </>
              )}
            </Button>
          </Card>

          {/* Portfolio Section */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Portfolio
                </h2>
                <p className="text-sm text-gray-500">Showcase your best work ({portfolio.length}/20)</p>
              </div>
            </div>

            <div className="space-y-6">
              {portfolio.length < 20 && (
                <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg">
                  <h3 className="text-sm font-medium mb-3">Add New Image</h3>
                  <div className="space-y-3">
                    <Input
                      value={portfolioCaption}
                      onChange={(e) => setPortfolioCaption(e.target.value)}
                      placeholder="Optional caption (e.g., 'Bridal makeup for outdoor wedding')"
                    />
                    <ImageUploader
                      onUploadComplete={handlePortfolioUpload}
                      onError={(error) =>
                        toast({
                          title: "Upload Error",
                          description: error,
                          variant: "destructive",
                        })
                      }
                    />
                  </div>
                </div>
              )}

              <PortfolioGallery
                items={portfolio}
                editable
                onDelete={handleDeletePortfolio}
              />
            </div>
          </Card>

          {/* Account Info */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 text-gray-900">Account Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Account ID</span>
                <span className="font-mono text-gray-700">{user?.id?.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span className="text-gray-700">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Verification Status</span>
                <span className="text-gray-700 capitalize">{verificationStatus.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Account Status</span>
                <span className="text-gray-700 capitalize">{user?.status?.toLowerCase() || "Active"}</span>
              </div>
            </div>
          </Card>

          {/* Logout */}
          <Button 
            variant="outline" 
            className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}
