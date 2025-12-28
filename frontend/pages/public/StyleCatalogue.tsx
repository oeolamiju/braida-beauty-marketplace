import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, Star, TrendingUp, Clock, ChevronRight, 
  Sparkles, Heart, Users, Scissors, Crown, Palette
} from "lucide-react";
import backend from "@/lib/backend";
import { useToast } from "@/components/ui/use-toast";
import TopNav from "@/components/navigation/TopNav";

interface Style {
  id: number;
  name: string;
  description: string | null;
  referenceImageUrl: string | null;
  category: string | null;
  providerCount?: number;
  avgPricePence?: number;
}

interface Category {
  name: string;
  displayName: string;
  description: string;
  styleCount: number;
  imageUrl: string | null;
}

// Popular style images
const STYLE_IMAGES: Record<string, string> = {
  "Knotless Braids": "https://images.unsplash.com/photo-1688592969417-953dd3c2b9d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
  "Box Braids": "https://images.unsplash.com/photo-1595959183082-7b570b7e1dfa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
  "Faux Locs": "https://images.unsplash.com/photo-1625536658679-42d76fd167c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
  "Sew-in Weave": "https://images.unsplash.com/photo-1586583226186-19fa230641a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
  "Cornrows": "https://images.unsplash.com/photo-1603384699007-50799748fc45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
  "Twist Out": "https://images.unsplash.com/photo-1763742936992-cac96be031b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
  "Fade Haircut": "https://images.unsplash.com/photo-1633990700440-30a1f452a95b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
  "Bridal Gele": "https://images.unsplash.com/photo-1588080270689-73eead74fa18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
  "Glam Makeup": "https://images.unsplash.com/photo-1692094998669-062c639d3703?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
};

// Featured/trending styles
const FEATURED_STYLES = [
  { name: "Knotless Braids Mid-Back", tag: "Trending", category: "hair" },
  { name: "Goddess Locs Waist Length", tag: "Popular", category: "hair" },
  { name: "Low Fade with Design", tag: "Hot", category: "barbering" },
  { name: "Bridal Gele & Makeup", tag: "Premium", category: "gele" },
];

const categoryIcons: Record<string, any> = {
  hair: Scissors,
  makeup: Sparkles,
  gele: Crown,
  barbering: Scissors,
  tailoring: Palette,
};

const categoryColors: Record<string, string> = {
  hair: "bg-purple-100 text-purple-700",
  makeup: "bg-rose-100 text-rose-700",
  gele: "bg-amber-100 text-amber-700",
  barbering: "bg-slate-100 text-slate-700",
  tailoring: "bg-blue-100 text-blue-700",
};

export default function StyleCatalogue() {
  const [styles, setStyles] = useState<Style[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stylesRes, categoriesRes] = await Promise.all([
        backend.styles.list(),
        backend.styles.listCategories(),
      ]);
      setStyles(stylesRes.styles as any);
      setCategories(categoriesRes.categories);
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

  // Filter styles based on search and category
  const filteredStyles = styles.filter((style) => {
    const matchesSearch = !searchQuery || 
      style.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      style.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || style.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group styles by category
  const stylesByCategory = filteredStyles.reduce((acc, style) => {
    const cat = style.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(style);
    return acc;
  }, {} as Record<string, Style[]>);

  const getStyleImage = (style: Style) => {
    // Try to match style name to our images
    for (const [key, url] of Object.entries(STYLE_IMAGES)) {
      if (style.name.toLowerCase().includes(key.toLowerCase())) {
        return url;
      }
    }
    return style.referenceImageUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-background to-amber-50/20">
        <TopNav />
        <div className="container mx-auto px-4 py-8 max-w-7xl pt-24">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-6 w-96 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="aspect-[3/4]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-background to-amber-50/20">
      <TopNav />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-600 via-orange-500 to-amber-600 text-white">
        <div className="container mx-auto px-4 py-12 md:py-16 max-w-7xl pt-24">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4">
            Style Catalogue
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mb-8">
            Browse our curated collection of Afro & Caribbean beauty styles. 
            Find inspiration and book your perfect look today.
          </p>
          
          {/* Search */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search styles (e.g., 'knotless braids', 'fade', 'gele')"
              className="pl-12 h-14 text-lg bg-white text-gray-900 border-0 rounded-xl shadow-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Featured Styles */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-orange-600" />
            Trending Styles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURED_STYLES.map((featured, idx) => (
              <Card 
                key={idx}
                className="group relative overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-orange-400"
                onClick={() => setSearchQuery(featured.name.split(" ")[0])}
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={STYLE_IMAGES[featured.name.split(" ")[0] + " " + (featured.name.split(" ")[1] || "")] || 
                         Object.values(STYLE_IMAGES)[idx % Object.values(STYLE_IMAGES).length]}
                    alt={featured.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <Badge className="absolute top-2 right-2 bg-orange-600 hover:bg-orange-700">
                    {featured.tag}
                  </Badge>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-bold text-sm line-clamp-1">{featured.name}</h3>
                    <p className="text-white/80 text-xs mt-1">
                      View stylists →
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Browse by Category</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className={selectedCategory === null ? "bg-orange-600 hover:bg-orange-700" : "border-2"}
            >
              All Styles
            </Button>
            {categories.map((cat) => {
              const Icon = categoryIcons[cat.name] || Palette;
              return (
                <Button
                  key={cat.name}
                  variant={selectedCategory === cat.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`gap-2 ${selectedCategory === cat.name ? "bg-orange-600 hover:bg-orange-700" : "border-2"}`}
                >
                  <Icon className="h-4 w-4" />
                  {cat.displayName}
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {cat.styleCount}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Styles Grid */}
        {filteredStyles.length === 0 ? (
          <Card className="p-12 text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold mb-2">No styles found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or browse all categories
            </p>
            <Button onClick={() => { setSearchQuery(""); setSelectedCategory(null); }}>
              Clear Filters
            </Button>
          </Card>
        ) : selectedCategory ? (
          // Single category view
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredStyles.map((style) => (
              <StyleCard key={style.id} style={style} image={getStyleImage(style)} navigate={navigate} />
            ))}
          </div>
        ) : (
          // All categories view
          Object.entries(stylesByCategory).map(([category, categoryStyles]) => (
            <div key={category} className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  {React.createElement(categoryIcons[category] || Palette, { className: "h-5 w-5 text-orange-600" })}
                  {categories.find(c => c.name === category)?.displayName || category}
                </h2>
                <Button
                  variant="link"
                  onClick={() => setSelectedCategory(category)}
                  className="text-orange-600"
                >
                  View all {categoryStyles.length}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {categoryStyles.slice(0, 5).map((style) => (
                  <StyleCard key={style.id} style={style} image={getStyleImage(style)} navigate={navigate} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16 mt-12">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to book your style?
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Find talented stylists near you who specialize in your chosen look.
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-lg px-8"
            onClick={() => navigate("/discover")}
          >
            Find Stylists
            <ChevronRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Style Card Component
function StyleCard({ 
  style, 
  image, 
  navigate 
}: { 
  style: Style; 
  image: string | null; 
  navigate: (path: string) => void;
}) {
  const categoryColor = style.category ? categoryColors[style.category] : "bg-gray-100 text-gray-700";
  
  return (
    <Card
      className="group overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-orange-400"
      onClick={() => navigate(`/styles/${style.id}`)}
    >
      <div className="aspect-[3/4] relative overflow-hidden bg-gray-100">
        {image ? (
          <img
            src={image}
            alt={style.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100">
            <Palette className="h-12 w-12 text-orange-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
          <Button size="sm" className="w-full bg-white/90 text-gray-900 hover:bg-white">
            Find Stylists
          </Button>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-bold text-sm line-clamp-1 mb-1">{style.name}</h3>
        {style.category && (
          <Badge variant="secondary" className={`text-xs ${categoryColor}`}>
            {style.category}
          </Badge>
        )}
      </div>
    </Card>
  );
}


