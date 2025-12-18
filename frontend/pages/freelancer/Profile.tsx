import { useState, useEffect } from "react";
import { User, MapPin, Camera, Loader2, Upload, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import backend from "@/lib/backend";
import type { FreelancerProfile } from "~backend/profiles/get_profile";
import type { PortfolioItem } from "~backend/profiles/list_portfolio";
import { ImageUploader } from "@/components/ImageUploader";
import { ProfilePhotoUploader } from "@/components/ProfilePhotoUploader";
import { PortfolioGallery } from "@/components/PortfolioGallery";
const TRAVEL_RADIUS_OPTIONS = [5, 10, 20];
const CATEGORY_OPTIONS = [
  { value: "hair", label: "Hair" },
  { value: "makeup", label: "Makeup" },
  { value: "gele", label: "Gele" },
  { value: "tailoring", label: "Tailoring" },
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

export default function FreelancerProfile() {
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [allStyles, setAllStyles] = useState<Style[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    profilePhotoUrl: "",
    locationArea: "",
    postcode: "",
    travelRadiusMiles: 5,
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
      const user = await backend.auth.me();
      
      const [profileData, portfolioData, stylesData] = await Promise.all([
        backend.profiles.getProfile({ userId: user.id }),
        backend.profiles.listPortfolio({ userId: user.id }),
        backend.styles.list({}),
      ]);

      setProfile(profileData);
      setPortfolio(portfolioData.items);
      setAllStyles(stylesData.styles);
      setSelectedStyles(profileData.styleIds || []);
      setFormData({
        displayName: profileData.displayName,
        bio: profileData.bio || "",
        profilePhotoUrl: profileData.profilePhotoUrl || "",
        locationArea: profileData.locationArea,
        postcode: profileData.postcode,
        travelRadiusMiles: profileData.travelRadiusMiles,
        categories: profileData.categories,
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
        title: "Success",
        description: "Profile updated successfully",
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
      toast({
        title: "Success",
        description: "Portfolio image deleted",
      });
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

  const getStylesByCategory = (): StylesByCategory => {
    const stylesByCategory: StylesByCategory = {
      hair: [],
      makeup: [],
      gele: [],
      tailoring: [],
    };

    allStyles.forEach((style) => {
      const name = style.name.toLowerCase();
      if (name.includes('braid') || name.includes('loc') || name.includes('wig') || name.includes('hair')) {
        stylesByCategory.hair.push(style);
      } else if (name.includes('makeup') || name.includes('glam')) {
        stylesByCategory.makeup.push(style);
      } else if (name.includes('gele')) {
        stylesByCategory.gele.push(style);
      } else if (name.includes('tailor') || name.includes('aso') || name.includes('garment')) {
        stylesByCategory.tailoring.push(style);
      }
    });

    return stylesByCategory;
  };

  const stylesByCategory = getStylesByCategory();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">Manage your professional profile</p>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Camera className="h-5 w-5 mr-2" />
            Profile Photo
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              {formData.profilePhotoUrl ? (
                <img
                  src={formData.profilePhotoUrl}
                  alt="Profile"
                  className="h-32 w-32 rounded-full object-cover border-4 border-border"
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center border-4 border-border">
                  <User className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
              {uploadingPhoto && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-3">
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

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Display Name
              </label>
              <Input
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                placeholder="Your professional name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                className="w-full min-h-24 px-3 py-2 border border-border rounded-md bg-background text-foreground"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Tell clients about yourself and your experience"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Location Area/City
                </label>
                <Input
                  value={formData.locationArea}
                  onChange={(e) =>
                    setFormData({ ...formData, locationArea: e.target.value })
                  }
                  placeholder="e.g. Central London"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Postcode
                </label>
                <Input
                  value={formData.postcode}
                  onChange={(e) =>
                    setFormData({ ...formData, postcode: e.target.value })
                  }
                  placeholder="e.g. SW1A 1AA"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Travel Radius
              </label>
              <div className="flex gap-2">
                {TRAVEL_RADIUS_OPTIONS.map((radius) => (
                  <Button
                    key={radius}
                    variant={
                      formData.travelRadiusMiles === radius
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      setFormData({ ...formData, travelRadiusMiles: radius })
                    }
                  >
                    {radius} miles
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Service Categories
              </label>
              <p className="text-sm text-muted-foreground mb-3">
                Select the categories you offer (choose at least one)
              </p>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map((cat) => (
                  <Badge
                    key={cat.value}
                    variant={
                      formData.categories.includes(cat.value)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer px-4 py-2 text-sm"
                    onClick={() => toggleCategory(cat.value)}
                  >
                    {formData.categories.includes(cat.value) && (
                      <Check className="h-4 w-4 mr-1" />
                    )}
                    {cat.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <label className="block text-sm font-medium mb-2">
                Default Pricing
              </label>
              <p className="text-sm text-muted-foreground mb-4">
                Set default fees for studio and mobile services. You can customize pricing for individual services later.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Studio Service Fee (£)
                  </label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Default fee when client travels to your location
                  </p>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.defaultStudioFeePence}
                    onChange={(e) =>
                      setFormData({ ...formData, defaultStudioFeePence: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mobile Service Fee (£)
                  </label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Default fee when you travel to client's location
                  </p>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.defaultMobileFeePence}
                    onChange={(e) =>
                      setFormData({ ...formData, defaultMobileFeePence: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Styles Offered</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Select the specific styles you can deliver within your chosen categories
          </p>
          
          <div className="space-y-6">
            {formData.categories.map((category) => {
              const categoryData = CATEGORY_OPTIONS.find(c => c.value === category);
              const stylesInCategory = stylesByCategory[category] || [];
              
              if (stylesInCategory.length === 0) return null;
              
              return (
                <div key={category}>
                  <h3 className="text-base font-medium mb-3">
                    {categoryData?.label} Styles
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {stylesInCategory.map((style) => (
                      <div
                        key={style.id}
                        onClick={() => toggleStyle(style.id)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedStyles.includes(style.id)
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{style.name}</h4>
                            {style.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {style.description}
                              </p>
                            )}
                          </div>
                          {selectedStyles.includes(style.id) && (
                            <Check className="h-5 w-5 text-primary flex-shrink-0 ml-2" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {formData.categories.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                <p className="text-muted-foreground">
                  Please select service categories above to see available styles
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Portfolio
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Upload images of your past work to showcase your skills (up to 20 images)
          </p>

          <div className="space-y-6">
            {portfolio.length < 20 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Add New Image</h3>
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

            <div>
              <h3 className="text-sm font-medium mb-3">
                Your Portfolio ({portfolio.length}/20)
              </h3>
              <PortfolioGallery
                items={portfolio}
                editable
                onDelete={handleDeletePortfolio}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
