import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MapPin, Star, Loader2, CheckCircle2, Flag } from "lucide-react";
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
import TopNav from "@/components/navigation/TopNav";

const CATEGORY_LABELS: Record<string, string> = {
  hair: "Hair",
  makeup: "Makeup",
  gele: "Gele",
  tailoring: "Tailoring",
};

export default function FreelancerPublicProfile() {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
          <p className="text-muted-foreground">
            The freelancer profile you're looking for doesn't exist.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="bg-gradient-to-b from-primary/10 to-background pb-8 pt-16">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-shrink-0">
              {profile.profilePhotoUrl ? (
                <img
                  src={profile.profilePhotoUrl}
                  alt={profile.displayName}
                  className="w-32 h-32 rounded-full object-cover border-4 border-background shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-background shadow-lg">
                  <span className="text-4xl font-bold text-muted-foreground">
                    {profile.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{profile.displayName}</h1>
                {profile.verificationStatus === "verified" && (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <MapPin className="h-4 w-4" />
                <span>{profile.locationArea}</span>
                <span className="text-sm">
                  • {profile.travelRadiusMiles} miles radius
                </span>
              </div>

              {profile.avgRating && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">
                      {profile.avgRating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-muted-foreground text-sm">
                    ({profile.totalReviews}{" "}
                    {profile.totalReviews === 1 ? "review" : "reviews"})
                  </span>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {profile.categories.map((category) => (
                  <Badge key={category} variant="secondary">
                    {CATEGORY_LABELS[category] || category}
                  </Badge>
                ))}
              </div>

              {profile.bio && (
                <p className="text-foreground leading-relaxed">{profile.bio}</p>
              )}
            </div>

            {isAuthenticated && (
              <div className="ml-auto">
                <Button variant="outline" size="sm" onClick={() => setReportModalOpen(true)}>
                  <Flag className="h-4 w-4 mr-2" />
                  Report
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Portfolio</h2>
            <PortfolioGallery items={portfolio} />
          </div>

          <ReviewsSection freelancerId={parseInt(userId!)} />
        </div>
      </div>

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
