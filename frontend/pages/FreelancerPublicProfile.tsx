import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  MapPin, Star, Loader2, CheckCircle2, Flag, Heart, Share2, Calendar,
  Globe2, Clock, Briefcase, ChevronRight, Plus, Info
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import backend from "@/lib/backend";
import type { FreelancerProfile } from "~backend/profiles/get_profile";
import type { PortfolioItem } from "~backend/profiles/list_portfolio";
import { PortfolioGallery } from "@/components/PortfolioGallery";
import { ReviewsSection } from "@/components/ReviewsSection";
import { ReportModal } from "@/components/ReportModal";
import { FavoriteButton } from "@/components/FavoriteButton";
import TopNav from "@/components/navigation/TopNav";

const CATEGORY_LABELS: Record<string, string> = {
  hair: "Hair",
  makeup: "Makeup",
  gele: "Gele",
  tailoring: "Tailoring",
  barbering: "Barbering",
};

interface Service {
  id: number;
  title: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  basePricePence: number;
  durationMinutes: number;
  materialsPolicy: string;
  locationTypes: string[];
  isActive: boolean;
}

export default function FreelancerPublicProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showAllServices, setShowAllServices] = useState(false);
  const [serviceFilter, setServiceFilter] = useState<"all" | "hair_included" | "mobile">("all");
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
  }, []);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const [profileData, portfolioData] = await Promise.all([
        backend.profiles.getProfile({ userId }),
        backend.profiles.listPortfolio({ userId }),
      ]);

      setProfile(profileData);
      setPortfolio(portfolioData.items);

      // Load services for this freelancer
      try {
        const servicesData = await backend.services.list({ freelancerId: userId });
        setServices(servicesData.services.filter((s: Service) => s.isActive));
      } catch (e) {
        console.error("Failed to load services:", e);
      }

      // Check if favorited
      if (localStorage.getItem("authToken")) {
        try {
          const favStatus = await backend.favorites.checkFavorite({ freelancerId: userId });
          setIsFavorited(favStatus.isFavorite);
        } catch (e) {
          console.error("Failed to check favorite status:", e);
        }
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.displayName} on Braida`,
          text: `Check out ${profile?.displayName}'s services on Braida Beauty Marketplace`,
          url,
        });
      } catch (e) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Profile link copied to clipboard",
      });
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save freelancers to your favorites",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await backend.favorites.toggleFavoriteFreelancer({ freelancerId: userId! });
      setIsFavorited(result.isFavorite);
      toast({ title: result.message });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update favorites",
        variant: "destructive",
      });
    }
  };

  const filteredServices = services.filter((service) => {
    if (serviceFilter === "hair_included") {
      return service.materialsPolicy === "stylist_provides" || service.materialsPolicy === "both";
    }
    if (serviceFilter === "mobile") {
      return service.locationTypes.includes("stylist_travels_to_client");
    }
    return true;
  });

  const displayedServices = showAllServices ? filteredServices : filteredServices.slice(0, 3);
  const hasMoreServices = filteredServices.length > 3;

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} mins`;
    if (mins === 0) return `${hours} hr${hours > 1 ? "s" : ""}`;
    return `${hours} hr ${mins} mins`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
        <Card className="p-8 text-center bg-[#2a2a2a] border-[#3a3a3a]">
          <h2 className="text-xl font-semibold mb-2 text-white">Profile Not Found</h2>
          <p className="text-gray-400">
            The freelancer profile you're looking for doesn't exist.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <TopNav />
      
      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            {/* Left Sidebar */}
            <div className="space-y-6">
              {/* Profile Card */}
              <Card className="p-6 bg-[#2a2a2a] border-[#3a3a3a]">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
              {profile.profilePhotoUrl ? (
                <img
                  src={profile.profilePhotoUrl}
                  alt={profile.displayName}
                        className="w-28 h-28 rounded-full object-cover border-4 border-[#3a3a3a]"
                />
              ) : (
                      <div className="w-28 h-28 rounded-full bg-[#3a3a3a] flex items-center justify-center">
                        <span className="text-3xl font-bold text-gray-400">
                    {profile.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
                    {profile.verificationStatus === "verified" && (
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-[#2a2a2a]">
                        <CheckCircle2 className="h-4 w-4 text-white" />
            </div>
                )}
              </div>

                  <h1 className="text-xl font-bold text-white mb-1">{profile.displayName}</h1>
                  
                  <div className="flex items-center gap-1 text-gray-400 text-sm mb-4">
                <MapPin className="h-4 w-4" />
                <span>{profile.locationArea}</span>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                {profile.categories.map((category) => (
                      <Badge 
                        key={category} 
                        variant="secondary" 
                        className="bg-[#3a3a3a] text-gray-300 hover:bg-[#4a4a4a]"
                      >
                    {CATEGORY_LABELS[category] || category}
                  </Badge>
                ))}
              </div>

                  <Button 
                    onClick={() => navigate(`/services?freelancer=${userId}`)}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white mb-3"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Request Booking
                  </Button>

                  <div className="flex gap-2 w-full">
                    <Button
                      variant="outline"
                      className="flex-1 border-[#3a3a3a] bg-transparent text-white hover:bg-[#3a3a3a]"
                      onClick={handleToggleFavorite}
                    >
                      <Heart className={`h-4 w-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-[#3a3a3a] bg-transparent text-white hover:bg-[#3a3a3a]"
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Rating */}
                  {(profile.avgRating || profile.totalReviews > 0) && (
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#3a3a3a] w-full justify-center">
                      <span className="text-2xl font-bold text-orange-500">
                        {profile.avgRating?.toFixed(1) || "New"}
                      </span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= (profile.avgRating || 0)
                                ? "fill-orange-500 text-orange-500"
                                : "text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-blue-400 cursor-pointer hover:underline">
                        {profile.totalReviews} reviews
                      </span>
                    </div>
              )}
            </div>
              </Card>

              {/* Details Card */}
              <Card className="p-6 bg-[#2a2a2a] border-[#3a3a3a]">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="h-5 w-5 text-blue-400" />
                  <h3 className="font-semibold text-white">Details</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Travel Radius</p>
                    <p className="text-sm text-gray-300">Mobile up to {profile.travelRadiusMiles} miles</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Languages</p>
                    <p className="text-sm text-gray-300">English</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Experience</p>
                    <p className="text-sm text-gray-300">Professional</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Availability</p>
                    <p className="text-sm text-green-400 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      Taking new clients
                    </p>
                  </div>
                </div>
              </Card>

            {isAuthenticated && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setReportModalOpen(true)}
                  className="w-full text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                >
                  <Flag className="h-4 w-4 mr-2" />
                  Report this profile
                </Button>
              )}
            </div>

            {/* Main Content */}
            <div className="space-y-8">
              {/* About Section */}
              <div>
                <h2 className="text-xl font-bold mb-4 text-white">About {profile.displayName.split(" ")[0]}</h2>
                <p className="text-gray-300 leading-relaxed">
                  {profile.bio || `Welcome to my profile! I specialize in ${profile.categories.map(c => CATEGORY_LABELS[c] || c).join(", ")}. Based in ${profile.locationArea}, I'm passionate about helping you look and feel your best. Book a service to get started!`}
                </p>
              </div>

              {/* Portfolio Section */}
              {portfolio.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">Portfolio</h2>
                    <Button variant="link" className="text-orange-500 hover:text-orange-400 p-0">
                      View all work
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {portfolio.slice(0, 3).map((item) => (
                      <div key={item.id} className="aspect-square rounded-xl overflow-hidden bg-[#3a3a3a]">
                        <img
                          src={item.imageUrl}
                          alt={item.caption || "Portfolio"}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Services Menu */}
              {services.length > 0 && (
                <Card className="p-6 bg-[#2a2a2a] border-[#3a3a3a]">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Services Menu</h2>
                    <div className="flex gap-2">
                      <Button
                        variant={serviceFilter === "hair_included" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setServiceFilter(serviceFilter === "hair_included" ? "all" : "hair_included")}
                        className={serviceFilter === "hair_included" 
                          ? "bg-orange-600 text-white" 
                          : "border-[#3a3a3a] text-gray-300 hover:bg-[#3a3a3a]"}
                      >
                        Hair Included
                      </Button>
                      <Button
                        variant={serviceFilter === "mobile" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setServiceFilter(serviceFilter === "mobile" ? "all" : "mobile")}
                        className={serviceFilter === "mobile" 
                          ? "bg-orange-600 text-white" 
                          : "border-[#3a3a3a] text-gray-300 hover:bg-[#3a3a3a]"}
                      >
                        Mobile
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {displayedServices.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-start justify-between p-4 rounded-xl bg-[#1a1a1a] hover:bg-[#252525] transition-colors cursor-pointer"
                        onClick={() => navigate(`/services/${service.id}`)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white">{service.title}</h3>
                            {service.materialsPolicy === "stylist_provides" && (
                              <span className="w-2 h-2 bg-blue-400 rounded-full" title="Hair included" />
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                            {service.description || `Professional ${service.category} service`}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{formatDuration(service.durationMinutes)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xl font-bold text-orange-500">
                            £{(service.basePricePence / 100).toFixed(0)}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {hasMoreServices && !showAllServices && (
                    <Button
                      variant="link"
                      className="w-full mt-4 text-orange-500 hover:text-orange-400"
                      onClick={() => setShowAllServices(true)}
                    >
                      Show {filteredServices.length - 3} more services
                    </Button>
                  )}
                </Card>
              )}

              {/* Client Reviews */}
              <div>
                <h2 className="text-xl font-bold mb-4 text-white">Client Reviews</h2>
                <ReviewsSection freelancerId={userId!} darkMode />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#3a3a3a] py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          © 2024 Braida. Connecting beauty professionals with clients.
        </div>
      </footer>

      {isAuthenticated && (
        <ReportModal
          open={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          reportedUserId={userId!}
          context="Freelancer Profile"
        />
      )}
    </div>
  );
}
