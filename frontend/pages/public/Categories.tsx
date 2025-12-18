import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Palette, ChevronRight, Scissors, Sparkles, Crown, Shirt, ScissorsLineDashed } from "lucide-react";
import backend from "@/lib/backend";
import { useToast } from "@/components/ui/use-toast";
import TopNav from "@/components/navigation/TopNav";

interface Category {
  name: string;
  displayName: string;
  description: string;
  styleCount: number;
  imageUrl: string | null;
}

const categoryIcons: Record<string, typeof Scissors> = {
  hair: Scissors,
  makeup: Sparkles,
  gele: Crown,
  tailoring: Shirt,
  barbering: ScissorsLineDashed,
};

const categoryColors: Record<string, string> = {
  hair: "from-purple-100 to-pink-100",
  makeup: "from-rose-100 to-orange-100",
  gele: "from-amber-100 to-yellow-100",
  tailoring: "from-blue-100 to-indigo-100",
  barbering: "from-slate-100 to-gray-100",
};

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await backend.styles.listCategories();
      setCategories(response.categories);
    } catch (error: any) {
      console.error("Failed to load categories:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto px-4 py-8 max-w-6xl pt-24">
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
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Palette className="h-8 w-8 text-orange-600" />
            <h1 className="text-3xl font-bold">Browse Styles</h1>
          </div>
          <p className="text-muted-foreground">
            Explore our collection of beauty service categories
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-16">
            <Palette className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Categories Available</h3>
            <p className="text-muted-foreground">Check back soon for new categories</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const Icon = categoryIcons[category.name] || Palette;
              const colorClass = categoryColors[category.name] || "from-gray-100 to-slate-100";
              
              return (
                <Card
                  key={category.name}
                  className="group hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                  onClick={() => navigate(`/styles/category/${category.name}`)}
                >
                  <div className={`aspect-[4/3] bg-gradient-to-br ${colorClass} flex flex-col items-center justify-center p-6`}>
                    <Icon className="h-20 w-20 text-foreground/80 mb-4" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground/60">
                        {category.styleCount} {category.styleCount === 1 ? 'style' : 'styles'}
                      </p>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold">{category.displayName}</h3>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-orange-600 transition-colors" />
                    </div>
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {category.description}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
