import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import backend from "@/lib/backend";

interface FavoriteButtonProps {
  freelancerId: string;
  initialFavorited?: boolean;
  size?: "sm" | "default" | "lg";
  variant?: "icon" | "text";
  className?: string;
}

export function FavoriteButton({
  freelancerId,
  initialFavorited = false,
  size = "default",
  variant = "icon",
  className = "",
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save freelancers to your favorites",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await backend.favorites.toggleFavoriteFreelancer({ freelancerId });
      setIsFavorited(result.isFavorite);
      toast({ title: result.message });
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

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size={size}
        onClick={handleToggle}
        disabled={loading}
        className={`p-2 hover:bg-transparent ${className}`}
      >
        <Heart
          className={`h-5 w-5 transition-colors ${
            isFavorited
              ? "fill-red-500 text-red-500"
              : "text-gray-400 hover:text-red-400"
          }`}
        />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleToggle}
      disabled={loading}
      className={className}
    >
      <Heart
        className={`h-4 w-4 mr-2 ${
          isFavorited ? "fill-red-500 text-red-500" : ""
        }`}
      />
      {isFavorited ? "Saved" : "Save"}
    </Button>
  );
}
