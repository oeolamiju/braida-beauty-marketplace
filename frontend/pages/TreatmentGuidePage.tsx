import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Search, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface Treatment {
  id: string;
  name: string;
  category: string;
  description: string;
  duration: string;
  priceRange: string;
  image: string;
}

const TREATMENTS: Treatment[] = [
  {
    id: "box-braids",
    name: "Box Braids",
    category: "Braids",
    description: "Classic protective style with individual plaits sectioned into square-shaped divisions. Perfect for low maintenance and versatile styling.",
    duration: "4-8 hours",
    priceRange: "£80-£200",
    image: "https://images.unsplash.com/photo-1763256377422-fec144edeefc?w=400&h=300&fit=crop"
  },
  {
    id: "knotless-braids",
    name: "Knotless Braids",
    category: "Braids",
    description: "Modern braiding technique that's gentler on the scalp and edges. Achieved by gradually feeding in hair instead of knotting at the base.",
    duration: "5-10 hours",
    priceRange: "£100-£250",
    image: "https://images.unsplash.com/photo-1594254773847-9fce26e950bc?w=400&h=300&fit=crop"
  },
  {
    id: "cornrows",
    name: "Cornrows",
    category: "Braids",
    description: "Traditional African style where hair is braided close to the scalp in straight lines or intricate patterns. Versatile and long-lasting.",
    duration: "2-4 hours",
    priceRange: "£40-£120",
    image: "https://images.unsplash.com/photo-1594254773847-9fce26e950bc?w=400&h=300&fit=crop"
  },
  {
    id: "faux-locs",
    name: "Faux Locs",
    category: "Locs",
    description: "Temporary protective style that mimics the look of dreadlocks without the long-term commitment. Can be styled in various ways.",
    duration: "4-8 hours",
    priceRange: "£100-£200",
    image: "https://images.unsplash.com/photo-1711637819201-1f2671641b4e?w=400&h=300&fit=crop"
  },
  {
    id: "starter-locs",
    name: "Starter Locs",
    category: "Locs",
    description: "Initial stage of forming permanent locs. Can be started with two-strand twists, coils, or interlocking method.",
    duration: "2-4 hours",
    priceRange: "£60-£150",
    image: "https://images.unsplash.com/photo-1711637819201-1f2671641b4e?w=400&h=300&fit=crop"
  },
  {
    id: "silk-press",
    name: "Silk Press",
    category: "Natural Hair",
    description: "Heat styling technique that straightens natural hair to a silky smooth finish without chemicals. Temporary and reversible.",
    duration: "2-3 hours",
    priceRange: "£60-£120",
    image: "https://images.unsplash.com/photo-1588527962980-72746d95973e?w=400&h=300&fit=crop"
  },
  {
    id: "twist-out",
    name: "Twist Out",
    category: "Natural Hair",
    description: "Styling method where two-strand twists are unraveled to create defined, voluminous curls. Great for showing off natural texture.",
    duration: "1-2 hours",
    priceRange: "£40-£80",
    image: "https://images.unsplash.com/photo-1588527962980-72746d95973e?w=400&h=300&fit=crop"
  },
  {
    id: "weave-install",
    name: "Weave Install",
    category: "Weaves & Wigs",
    description: "Hair extensions sewn onto cornrowed natural hair. Offers length, volume, and versatility in styling options.",
    duration: "3-5 hours",
    priceRange: "£80-£250",
    image: "https://images.unsplash.com/photo-1511929825537-516974a253df?w=400&h=300&fit=crop"
  },
  {
    id: "wig-install",
    name: "Custom Wig Install",
    category: "Weaves & Wigs",
    description: "Professional fitting and customization of wigs for a natural look. Includes lace melting, plucking, and styling.",
    duration: "2-4 hours",
    priceRange: "£60-£150",
    image: "https://images.unsplash.com/photo-1615453261246-4b32e335a4a0?w=400&h=300&fit=crop"
  },
  {
    id: "skin-fade",
    name: "Skin Fade",
    category: "Barbering",
    description: "Precision haircut where hair gradually fades from longer on top to skin-level on the sides and back. Clean and modern look.",
    duration: "30-60 minutes",
    priceRange: "£20-£40",
    image: "https://images.unsplash.com/photo-1633990700440-30a1f452a95b?w=400&h=300&fit=crop"
  },
  {
    id: "line-up",
    name: "Line Up / Edge Up",
    category: "Barbering",
    description: "Sharp, crisp hairline and edge definition. Often combined with fades for a polished finish.",
    duration: "20-30 minutes",
    priceRange: "£15-£30",
    image: "https://images.unsplash.com/photo-1633990700440-30a1f452a95b?w=400&h=300&fit=crop"
  },
  {
    id: "goddess-braids",
    name: "Goddess Braids",
    category: "Braids",
    description: "Larger, thicker cornrows that create a bold, elegant look. Often styled in various patterns and can include curly ends.",
    duration: "2-4 hours",
    priceRange: "£60-£150",
    image: "https://images.unsplash.com/photo-1763256377422-fec144edeefc?w=400&h=300&fit=crop"
  },
];

const CATEGORIES = [
  { name: "All Treatments", slug: "all" },
  { name: "Braids", slug: "braids" },
  { name: "Locs", slug: "locs" },
  { name: "Natural Hair", slug: "natural-hair" },
  { name: "Weaves & Wigs", slug: "weaves" },
  { name: "Barbering", slug: "barbering" },
];

export default function TreatmentGuidePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredTreatments = TREATMENTS.filter((treatment) => {
    const matchesSearch = treatment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      treatment.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
      treatment.category.toLowerCase().replace(" & ", "-").replace(" ", "-") === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Treatment Guide</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <p className="text-lg text-muted-foreground mb-6">
            Explore our comprehensive guide to Afro and Caribbean beauty treatments. Learn about different styles, 
            what to expect, and find the perfect service for you.
          </p>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search treatments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          {CATEGORIES.map((category) => (
            <Button
              key={category.slug}
              variant={selectedCategory === category.slug ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.slug)}
              className="whitespace-nowrap"
            >
              {category.name}
            </Button>
          ))}
        </div>

        {filteredTreatments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No treatments found matching your search.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredTreatments.map((treatment) => (
              <Card key={treatment.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="flex flex-col sm:flex-row">
                  <div className="w-full sm:w-1/3 h-48 sm:h-auto">
                    <img
                      src={treatment.image}
                      alt={treatment.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-4">
                    <div className="mb-2">
                      <span className="text-xs font-medium text-orange-500 uppercase tracking-wide">
                        {treatment.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-2">{treatment.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {treatment.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <span>⏱️ {treatment.duration}</span>
                      <span className="font-semibold text-foreground">{treatment.priceRange}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(`/discover?keyword=${encodeURIComponent(treatment.name)}`)}
                    >
                      Find Professionals
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-12 bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-3">Not sure what you need?</h2>
          <p className="text-muted-foreground mb-4">
            Browse our style catalogue or search for professionals who can help you find the perfect look.
          </p>
          <div className="flex gap-3">
            <Button asChild>
              <Link to="/styles/catalogue">Browse Styles</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/discover">Find Professionals</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
