import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MapPin, Star, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import backend from "@/lib/backend";

interface FavoriteFreelancer {
  id: string;
  firstName: string;
  lastName: string;
  profilePhoto: string | null;
  specialties: string[];
  averageRating: number;
  totalReviews: number;
  city: string | null;
  favoritedAt: string;
}

export default function Favorites() {
  const [favorites, setFavorites] = useState<FavoriteFreelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const response = await backend.favorites.listFavoriteFreelancers();
      setFavorites(response.freelancers as any);
    } catch (error: any) {
      console.error("Failed to load favorites:", error);
      toast({
        title: "Error",
        description: "Failed to load favorites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (freelancerId: string) => {
    try {
      await backend.favorites.toggleFavoriteFreelancer({ freelancerId });
      setFavorites(favorites.filter(f => f.id !== freelancerId));
      toast({
        title: "Removed",
        description: "Removed from favorites",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to remove from favorites",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Heart className="h-8 w-8 text-[#E91E63] fill-[#E91E63]" />
        <h1 className="text-2xl font-bold">My Favorites</h1>
      </div>

      {favorites.length === 0 ? (
        <Card className="p-12 text-center">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
          <p className="text-muted-foreground mb-4">
            Start saving your favorite stylists for quick access
          </p>
          <Button onClick={() => navigate("/client/discover")}>
            Discover Stylists
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map(freelancer => (
            <Card key={freelancer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-[4/3] relative bg-gradient-to-br from-pink-100 to-amber-100">
                {freelancer.profilePhoto ? (
                  <img
                    src={freelancer.profilePhoto}
                    alt={`${freelancer.firstName} ${freelancer.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-5xl font-bold text-[#E91E63]">
                      {freelancer.firstName[0]}{freelancer.lastName[0]}
                    </span>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFavorite(freelancer.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              <div className="p-4">
                <h3
                  className="font-bold text-lg cursor-pointer hover:text-[#E91E63]"
                  onClick={() => navigate(`/freelancers/${freelancer.id}`)}
                >
                  {freelancer.firstName} {freelancer.lastName}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Star className="h-4 w-4 fill-[#F4B942] text-[#F4B942]" />
                  <span>{freelancer.averageRating.toFixed(1)}</span>
                  <span>({freelancer.totalReviews} reviews)</span>
                </div>
                {freelancer.city && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{freelancer.city}</span>
                  </div>
                )}
                {freelancer.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {freelancer.specialties.slice(0, 3).map((specialty, i) => (
                      <span key={i} className="text-xs bg-pink-100 text-[#E91E63] px-2 py-1 rounded-full">
                        {specialty}
                      </span>
                    ))}
                  </div>
                )}
                <Button
                  className="w-full mt-4 bg-gradient-to-r from-[#E91E63] to-[#F4B942]"
                  onClick={() => navigate(`/freelancers/${freelancer.id}`)}
                >
                  View Profile
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

