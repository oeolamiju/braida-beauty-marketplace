import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Palette, ChevronRight } from "lucide-react";
import backend from "@/lib/backend";
import { useToast } from "@/components/ui/use-toast";
import TopNav from "@/components/navigation/TopNav";

interface Style {
  id: number;
  name: string;
  description: string | null;
  referenceImageUrl: string | null;
  category: string | null;
}

const categoryDisplayNames: Record<string, string> = {
  hair: "Hair Styling",
  makeup: "Makeup Artistry",
  gele: "Gele & Head Wraps",
  tailoring: "Bespoke Tailoring",
  barbering: "Barbering Services",
};

export default function CategoryStyles() {
  const { category } = useParams<{ category: string }>();
  const [styles, setStyles] = useState<Style[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (category) {
      loadStyles();
    }
  }, [category]);

  const loadStyles = async () => {
    try {
      setLoading(true);
      const response = await backend.styles.list({ category });
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

  const displayName = category ? categoryDisplayNames[category] || category : "";

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto px-4 py-8 max-w-6xl pt-24">
          <Skeleton className="h-10 w-32 mb-8" />
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-48 w-full mb-4 rounded-lg" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="container mx-auto px-4 py-8 max-w-6xl pt-24">
        <Button
          variant="ghost"
          onClick={() => navigate("/styles")}
          className="mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Categories
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
          <p className="text-muted-foreground">
            Browse {styles.length} {styles.length === 1 ? 'style' : 'styles'} in this category
          </p>
        </div>

        {styles.length === 0 ? (
          <div className="text-center py-16">
            <Palette className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Styles Available</h3>
            <p className="text-muted-foreground">Check back soon for new styles in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {styles.map((style) => (
              <Card
                key={style.id}
                className="group hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                onClick={() => navigate(`/styles/${style.id}`)}
              >
                {style.referenceImageUrl ? (
                  <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                    <img
                      src={style.referenceImageUrl}
                      alt={style.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/3] bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                    <Palette className="h-16 w-16 text-orange-600" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold">{style.name}</h3>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-orange-600 transition-colors" />
                  </div>
                  {style.description && (
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {style.description}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
