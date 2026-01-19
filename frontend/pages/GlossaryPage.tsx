import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
  relatedTerms?: string[];
}

const GLOSSARY: GlossaryTerm[] = [
  {
    term: "4C Hair",
    definition: "The tightest curl pattern in the hair typing system, characterized by very tight, springy coils. Often appears dense and can shrink up to 75% of its actual length.",
    category: "Hair Types",
    relatedTerms: ["Natural Hair", "Shrinkage", "Coils"]
  },
  {
    term: "Baby Hairs",
    definition: "Short, fine hairs along the hairline that are often styled separately. Also known as edges, these delicate hairs frame the face and can be laid down for a polished look.",
    category: "Styling",
    relatedTerms: ["Edge Control", "Laid Edges"]
  },
  {
    term: "Big Chop",
    definition: "The act of cutting off chemically processed or heat-damaged hair to embrace natural hair texture. Often marks the beginning of a natural hair journey.",
    category: "Natural Hair",
    relatedTerms: ["Transitioning", "Natural Hair"]
  },
  {
    term: "Box Braids",
    definition: "Individual plaits divided into square-shaped sections. A popular protective style that can last 4-8 weeks with proper care.",
    category: "Braids",
    relatedTerms: ["Knotless Braids", "Protective Styling"]
  },
  {
    term: "Cornrows",
    definition: "Traditional African braiding style where hair is braided very close to the scalp in straight lines or intricate patterns. Also called canerows.",
    category: "Braids",
    relatedTerms: ["Feed-in Braids", "Goddess Braids"]
  },
  {
    term: "Co-wash",
    definition: "Washing hair with conditioner only, skipping shampoo. Helps maintain moisture in dry or curly hair types.",
    category: "Hair Care",
    relatedTerms: ["Deep Condition", "Moisture"]
  },
  {
    term: "Deep Condition",
    definition: "Intensive conditioning treatment that penetrates the hair shaft to restore moisture and repair damage. Usually applied with heat for 20-30 minutes.",
    category: "Hair Care",
    relatedTerms: ["Co-wash", "Protein Treatment"]
  },
  {
    term: "Edge Control",
    definition: "Styling product used to smooth and hold baby hairs in place. Creates sleek, polished edges around the hairline.",
    category: "Products",
    relatedTerms: ["Baby Hairs", "Laid Edges"]
  },
  {
    term: "Faux Locs",
    definition: "Temporary protective style that mimics the appearance of dreadlocks without the long-term commitment. Can be installed with various techniques.",
    category: "Locs",
    relatedTerms: ["Starter Locs", "Protective Styling"]
  },
  {
    term: "Feed-in Braids",
    definition: "Braiding technique where hair extensions are gradually added as the braid progresses, creating a natural-looking taper from thin at the roots to thicker at the ends.",
    category: "Braids",
    relatedTerms: ["Knotless Braids", "Cornrows"]
  },
  {
    term: "Finger Coils",
    definition: "Styling technique where small sections of hair are twisted around a finger to create defined spiral curls. Popular for short to medium-length natural hair.",
    category: "Styling",
    relatedTerms: ["Coils", "Twist Out"]
  },
  {
    term: "Goddess Braids",
    definition: "Larger, thicker cornrows often styled in elegant patterns. May include loose, curly ends for a softer look.",
    category: "Braids",
    relatedTerms: ["Cornrows", "Feed-in Braids"]
  },
  {
    term: "Hot Comb",
    definition: "Metal comb heated on a stove or electric base used to temporarily straighten natural hair. Traditional heat styling tool.",
    category: "Tools",
    relatedTerms: ["Silk Press", "Heat Damage"]
  },
  {
    term: "Knotless Braids",
    definition: "Braiding method that starts with your natural hair and gradually feeds in extensions, eliminating the knot at the base. Gentler on the scalp and edges than traditional box braids.",
    category: "Braids",
    relatedTerms: ["Box Braids", "Feed-in Braids"]
  },
  {
    term: "Lace Front",
    definition: "Wig with a sheer lace panel at the front that creates a natural-looking hairline. The lace can be cut and blended with the skin.",
    category: "Wigs",
    relatedTerms: ["Lace Melting", "Wig Install"]
  },
  {
    term: "Lace Melting",
    definition: "Technique of blending lace front wigs with the skin using makeup, adhesive, or both to create an undetectable hairline.",
    category: "Wigs",
    relatedTerms: ["Lace Front", "Wig Install"]
  },
  {
    term: "Laid Edges",
    definition: "Smoothly styled baby hairs that frame the face, often created with edge control gel and a small brush or toothbrush.",
    category: "Styling",
    relatedTerms: ["Baby Hairs", "Edge Control"]
  },
  {
    term: "Leave-in Conditioner",
    definition: "Moisturizing product applied to damp hair and left in without rinsing. Provides ongoing hydration and detangling benefits.",
    category: "Products",
    relatedTerms: ["Deep Condition", "Moisture"]
  },
  {
    term: "LOC Method",
    definition: "Moisturizing technique: Liquid (water/leave-in), Oil, Cream. Applied in this order to seal in maximum moisture.",
    category: "Hair Care",
    relatedTerms: ["LCO Method", "Moisture"]
  },
  {
    term: "Natural Hair",
    definition: "Hair that hasn't been chemically altered by relaxers, texturizers, or permanent straightening treatments. Retains its natural curl pattern.",
    category: "Hair Types",
    relatedTerms: ["4C Hair", "Big Chop"]
  },
  {
    term: "Passion Twists",
    definition: "Protective style created with bohemian/water wave hair that's twisted to create a textured, flowing look. Lighter than traditional Senegalese twists.",
    category: "Twists",
    relatedTerms: ["Senegalese Twists", "Spring Twists"]
  },
  {
    term: "Protective Styling",
    definition: "Hairstyles that tuck away or minimize manipulation of hair ends to promote growth and prevent damage. Examples include braids, twists, and wigs.",
    category: "Styling",
    relatedTerms: ["Box Braids", "Faux Locs", "Weave"]
  },
  {
    term: "Senegalese Twists",
    definition: "Two-strand twists created with synthetic or human hair extensions. Sleek, rope-like protective style that can last 4-8 weeks.",
    category: "Twists",
    relatedTerms: ["Passion Twists", "Marley Twists"]
  },
  {
    term: "Shrinkage",
    definition: "When natural hair appears much shorter when dry than when wet or stretched, due to tight curl patterns. Can be 50-75% of actual length.",
    category: "Hair Types",
    relatedTerms: ["4C Hair", "Natural Hair"]
  },
  {
    term: "Silk Press",
    definition: "Heat styling method that straightens natural hair using a flat iron after blow-drying, creating a smooth, silky finish without chemicals. Temporary and reversible.",
    category: "Styling",
    relatedTerms: ["Hot Comb", "Heat Damage"]
  },
  {
    term: "Starter Locs",
    definition: "The initial stage of forming permanent locs. Can be started with two-strand twists, coils, braids, or interlocking methods.",
    category: "Locs",
    relatedTerms: ["Faux Locs", "Retwist"]
  },
  {
    term: "Taper Fade",
    definition: "Gradual hair length transition on the sides and back, fading from longer on top to very short or skin at the bottom. Popular in barbering.",
    category: "Barbering",
    relatedTerms: ["Skin Fade", "Line Up"]
  },
  {
    term: "Twist Out",
    definition: "Styling method where two-strand twists are unraveled after drying to reveal defined, voluminous curls.",
    category: "Styling",
    relatedTerms: ["Braid Out", "Finger Coils"]
  },
  {
    term: "Weave",
    definition: "Hair extensions sewn onto cornrowed natural hair to add length, volume, or color. Can be human or synthetic hair.",
    category: "Extensions",
    relatedTerms: ["Sew-in", "Protective Styling"]
  },
];

const CATEGORIES = [
  "All",
  "Hair Types",
  "Hair Care",
  "Styling",
  "Braids",
  "Locs",
  "Twists",
  "Wigs",
  "Extensions",
  "Barbering",
  "Products",
  "Tools"
];

export default function GlossaryPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const filteredTerms = GLOSSARY.filter((item) => {
    const matchesSearch = item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesLetter = !selectedLetter || item.term.toUpperCase().startsWith(selectedLetter);
    return matchesSearch && matchesCategory && matchesLetter;
  }).sort((a, b) => a.term.localeCompare(b.term));

  const groupedTerms = filteredTerms.reduce((acc, term) => {
    const firstLetter = term.term[0].toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(term);
    return acc;
  }, {} as Record<string, GlossaryTerm[]>);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Beauty Glossary</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <p className="text-lg text-muted-foreground mb-6">
            Your complete guide to Afro and Caribbean beauty terminology. Learn the language of natural hair, 
            braiding, locs, and more.
          </p>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search terms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-4">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => {
                  setSelectedCategory(category);
                  setSelectedLetter(null);
                }}
                className="whitespace-nowrap"
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-1 justify-center mb-6">
            {alphabet.map((letter) => {
              const hasTerms = filteredTerms.some(term => term.term.toUpperCase().startsWith(letter));
              return (
                <Button
                  key={letter}
                  variant={selectedLetter === letter ? "default" : "ghost"}
                  onClick={() => setSelectedLetter(selectedLetter === letter ? null : letter)}
                  disabled={!hasTerms}
                  className="w-8 h-8 p-0 text-xs"
                  size="sm"
                >
                  {letter}
                </Button>
              );
            })}
          </div>
        </div>

        {filteredTerms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No terms found matching your search.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedTerms).map(([letter, terms]) => (
              <div key={letter} id={letter}>
                <h2 className="text-2xl font-bold mb-4 text-orange-500">{letter}</h2>
                <div className="space-y-4">
                  {terms.map((term) => (
                    <Card key={term.term} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold">{term.term}</h3>
                            <span className="text-xs font-medium text-orange-500 uppercase tracking-wide">
                              {term.category}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {term.definition}
                          </p>
                          {term.relatedTerms && term.relatedTerms.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              <span className="text-xs text-muted-foreground">Related:</span>
                              {term.relatedTerms.map((related) => (
                                <span
                                  key={related}
                                  className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full"
                                >
                                  {related}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Can't find what you're looking for? Check our Treatment Guide or contact our support team.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate("/treatment-guide")}>
              Treatment Guide
            </Button>
            <Button variant="outline" onClick={() => navigate("/contact")}>
              Contact Us
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
