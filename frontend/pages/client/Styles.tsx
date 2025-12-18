import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Palette, ChevronRight } from "lucide-react";
import backend from "@/lib/backend";
import { useToast } from "@/components/ui/use-toast";

interface Style {
  id: number;
  name: string;
  description: string | null;
  referenceImageUrl: string | null;
  isActive: boolean;
}

export default function ClientStyles() {
  const [styles, setStyles] = useState<Style[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadStyles();
  }, []);

  const loadStyles = async () => {
    try {
      setLoading(true);
      const response = await backend.styles.list({});
      setStyles(response.styles);
    } catch (error: any) {
      console.error("Failed to load styles:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load styles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Styles</h1>
        <p className="text-muted-foreground">
          Explore popular beauty styles and find services that match your vision
        </p>
      </div>

      {styles.length === 0 ? (
        <Card className="p-12 text-center">
          <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Styles Available</h3>
          <p className="text-muted-foreground">
            Check back soon for new beauty styles
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {styles.map((style) => (
            <Card
              key={style.id}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
              onClick={() => navigate(`/client/styles/${style.id}`)}
            >
              <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                {style.referenceImageUrl ? (
                  <img
                    src={style.referenceImageUrl}
                    alt={style.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Palette className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-xl font-semibold text-white">{style.name}</h3>
                </div>
              </div>
              {style.description && (
                <div className="p-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {style.description}
                  </p>
                </div>
              )}
              <div className="px-4 pb-4">
                <div className="flex items-center text-sm text-primary font-medium group-hover:translate-x-1 transition-transform">
                  View services
                  <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
