import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import backend from "@/lib/backend";

interface FavoriteButtonProps {
  freelancerId: string;
  size?: "sm" | "md" | "lg";
  variant?: "icon" | "button";
  className?: string;
}

export default function FavoriteButton({
  freelancerId,
  size = "md",
  variant = "icon",
  className = "",
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkFavoriteStatus();
  }, [freelancerId]);

  const checkFavoriteStatus = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await backend.favorites.checkFavorite({ freelancerId });
      setIsFavorite(response.isFavorite);
    } catch (error) {
      // Silently fail for non-authenticated users
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await backend.favorites.toggleFavoriteFreelancer({ freelancerId });
      setIsFavorite(response.isFavorite);
      toast({
        title: response.isFavorite ? "Added to favorites" : "Removed from favorites",
        description: response.message,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update favorites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  if (variant === "button") {
    return (
      <Button
        variant="outline"
        onClick={toggleFavorite}
        disabled={loading}
        className={`gap-2 ${isFavorite ? "text-[#E91E63] border-[#E91E63]" : ""} ${className}`}
      >
        <Heart className={`${iconSizes[size]} ${isFavorite ? "fill-[#E91E63]" : ""}`} />
        {isFavorite ? "Saved" : "Save"}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleFavorite}
      disabled={loading}
      className={`${sizeClasses[size]} rounded-full bg-white/80 hover:bg-white ${className}`}
    >
      <Heart
        className={`${iconSizes[size]} transition-colors ${
          isFavorite ? "fill-[#E91E63] text-[#E91E63]" : "text-gray-600"
        }`}
      />
    </Button>
  );
}

