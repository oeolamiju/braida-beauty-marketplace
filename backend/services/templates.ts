import { api } from "encore.dev/api";

export interface ServiceTemplate {
  name: string;
  category: string;
  subcategory: string;
  description: string;
  suggestedDurationMinutes: { min: number; max: number };
  suggestedPricePence: { min: number; max: number };
  materialsPolicy: string;
  suggestedMaterialsFee: number;
  tips: string[];
}

const SERVICE_TEMPLATES: ServiceTemplate[] = [
  // Hair - Braids
  {
    name: "Knotless Box Braids - Short",
    category: "hair",
    subcategory: "Box Braids",
    description: "Knotless box braids installed using the feed-in technique for a natural, tension-free finish. Length: bob to shoulder.",
    suggestedDurationMinutes: { min: 180, max: 300 },
    suggestedPricePence: { min: 8000, max: 15000 },
    materialsPolicy: "freelancer_provides",
    suggestedMaterialsFee: 2000,
    tips: [
      "Specify exact length in title (e.g., 'Bob length', 'Shoulder length')",
      "Mention hair prep requirements (wash, blow dry)",
      "Include information about hair type suitability",
    ],
  },
  {
    name: "Knotless Box Braids - Mid-Back",
    category: "hair",
    subcategory: "Box Braids",
    description: "Medium-length knotless box braids using premium braiding hair. Includes styling options.",
    suggestedDurationMinutes: { min: 300, max: 420 },
    suggestedPricePence: { min: 12000, max: 20000 },
    materialsPolicy: "freelancer_provides",
    suggestedMaterialsFee: 3000,
    tips: [
      "Consider offering size options (small, medium, large)",
      "Specify number of packs of hair typically used",
      "Mention aftercare advice included",
    ],
  },
  {
    name: "Knotless Box Braids - Waist Length",
    category: "hair",
    subcategory: "Box Braids",
    description: "Long knotless box braids reaching waist length. Premium service with extra attention to parting and neatness.",
    suggestedDurationMinutes: { min: 420, max: 540 },
    suggestedPricePence: { min: 18000, max: 28000 },
    materialsPolicy: "freelancer_provides",
    suggestedMaterialsFee: 4500,
    tips: [
      "Long services benefit from break mentions",
      "Specify if client needs to bring food/drinks",
      "Include information about maintenance",
    ],
  },
  {
    name: "Cornrows - Simple Pattern",
    category: "hair",
    subcategory: "Cornrows",
    description: "Classic straight-back cornrows or simple geometric patterns. Clean partings and neat finish.",
    suggestedDurationMinutes: { min: 60, max: 120 },
    suggestedPricePence: { min: 3000, max: 6000 },
    materialsPolicy: "client_provides",
    suggestedMaterialsFee: 0,
    tips: [
      "Offer add-ons for more complex patterns",
      "Mention if you do designs or freestyle",
      "Specify row count ranges",
    ],
  },
  {
    name: "Cornrows - Feed-In/Stitch",
    category: "hair",
    subcategory: "Cornrows",
    description: "Cornrows with added braiding hair for length and fullness. Feed-in or stitch technique for seamless blend.",
    suggestedDurationMinutes: { min: 120, max: 240 },
    suggestedPricePence: { min: 6000, max: 12000 },
    materialsPolicy: "freelancer_provides",
    suggestedMaterialsFee: 1500,
    tips: [
      "Show examples of different patterns in portfolio",
      "Mention thickness options",
      "Include information about longevity",
    ],
  },
  {
    name: "Locs Installation",
    category: "hair",
    subcategory: "Locs",
    description: "Professional loc installation using your preferred method (comb coils, two-strand twist, interlocking).",
    suggestedDurationMinutes: { min: 240, max: 480 },
    suggestedPricePence: { min: 15000, max: 30000 },
    materialsPolicy: "client_provides",
    suggestedMaterialsFee: 0,
    tips: [
      "Specify installation methods you offer",
      "Include consultation for new loc journeys",
      "Mention follow-up maintenance appointments",
    ],
  },
  {
    name: "Loc Retwist/Maintenance",
    category: "hair",
    subcategory: "Locs",
    description: "Regular maintenance retwist for established locs. Includes wash, condition, and style.",
    suggestedDurationMinutes: { min: 90, max: 180 },
    suggestedPricePence: { min: 5000, max: 10000 },
    materialsPolicy: "freelancer_provides",
    suggestedMaterialsFee: 1000,
    tips: [
      "Offer packages for regular clients",
      "Specify products used",
      "Mention additional services (color, repair)",
    ],
  },
  {
    name: "Wig Install - Lace Front",
    category: "hair",
    subcategory: "Wigs",
    description: "Professional lace front wig installation including customization, bleaching knots, and baby hair styling.",
    suggestedDurationMinutes: { min: 90, max: 180 },
    suggestedPricePence: { min: 6000, max: 12000 },
    materialsPolicy: "both",
    suggestedMaterialsFee: 1500,
    tips: [
      "Clarify if wig is client-provided or included",
      "Mention glue/tape options for sensitive skin",
      "Include takedown service pricing",
    ],
  },
  // Makeup
  {
    name: "Natural Glam Makeup",
    category: "makeup",
    subcategory: "Glam",
    description: "Flawless natural-looking glam makeup perfect for everyday events, dates, or professional photos.",
    suggestedDurationMinutes: { min: 45, max: 75 },
    suggestedPricePence: { min: 4000, max: 8000 },
    materialsPolicy: "freelancer_provides",
    suggestedMaterialsFee: 0,
    tips: [
      "Include lash application in description",
      "Specify skin prep included",
      "Mention touch-up kit availability",
    ],
  },
  {
    name: "Bridal Makeup",
    category: "makeup",
    subcategory: "Bridal",
    description: "Complete bridal makeup service including consultation, trial, and day-of application. Long-lasting and photo-ready.",
    suggestedDurationMinutes: { min: 90, max: 150 },
    suggestedPricePence: { min: 15000, max: 35000 },
    materialsPolicy: "freelancer_provides",
    suggestedMaterialsFee: 0,
    tips: [
      "Include trial session in package",
      "Mention early morning availability",
      "Specify travel arrangements for wedding day",
    ],
  },
  {
    name: "Full Glam - Special Occasion",
    category: "makeup",
    subcategory: "Glam",
    description: "Full glamour makeup for special occasions - parties, prom, photoshoots. Includes lashes and setting spray.",
    suggestedDurationMinutes: { min: 60, max: 90 },
    suggestedPricePence: { min: 6000, max: 12000 },
    materialsPolicy: "freelancer_provides",
    suggestedMaterialsFee: 0,
    tips: [
      "Offer add-ons like brow lamination",
      "Include photos of various looks in portfolio",
      "Mention skin type accommodations",
    ],
  },
  // Gele
  {
    name: "Simple Gele Tie",
    category: "gele",
    subcategory: "Traditional",
    description: "Classic gele tying for everyday occasions. Choose from popular styles like fan, bow, or turban.",
    suggestedDurationMinutes: { min: 20, max: 40 },
    suggestedPricePence: { min: 2000, max: 4000 },
    materialsPolicy: "client_provides",
    suggestedMaterialsFee: 0,
    tips: [
      "Show variety of styles you can do",
      "Mention gele fabric recommendations",
      "Include ipele (shoulder piece) if offered",
    ],
  },
  {
    name: "Elaborate Gele - Owambe Style",
    category: "gele",
    subcategory: "Owambe",
    description: "Statement gele for aso-ebi and special celebrations. Intricate folds, embellishments, and dramatic styling.",
    suggestedDurationMinutes: { min: 30, max: 60 },
    suggestedPricePence: { min: 4000, max: 8000 },
    materialsPolicy: "client_provides",
    suggestedMaterialsFee: 500,
    tips: [
      "Offer embellishment options (beads, brooches)",
      "Include matching ipele styling",
      "Mention head shape accommodations",
    ],
  },
  {
    name: "Bridal Gele Package",
    category: "gele",
    subcategory: "Bridal",
    description: "Premium bridal gele service including trial, custom styling, and secure pinning for all-day wear.",
    suggestedDurationMinutes: { min: 45, max: 90 },
    suggestedPricePence: { min: 8000, max: 15000 },
    materialsPolicy: "client_provides",
    suggestedMaterialsFee: 1000,
    tips: [
      "Include pre-wedding trial in package",
      "Specify complementary veil styling",
      "Offer touch-up services during reception",
    ],
  },
  // Tailoring
  {
    name: "Basic Alterations",
    category: "tailoring",
    subcategory: "Alterations",
    description: "Simple alterations including hemming, taking in/letting out seams, and basic repairs.",
    suggestedDurationMinutes: { min: 30, max: 60 },
    suggestedPricePence: { min: 1500, max: 4000 },
    materialsPolicy: "freelancer_provides",
    suggestedMaterialsFee: 500,
    tips: [
      "Specify turnaround time",
      "List specific alterations with pricing",
      "Mention rush service availability",
    ],
  },
  {
    name: "Custom Aso-Ebi Outfit",
    category: "tailoring",
    subcategory: "Custom",
    description: "Bespoke aso-ebi outfit creation from your fabric. Includes measurement, design consultation, and fittings.",
    suggestedDurationMinutes: { min: 120, max: 240 },
    suggestedPricePence: { min: 15000, max: 40000 },
    materialsPolicy: "client_provides",
    suggestedMaterialsFee: 2000,
    tips: [
      "Specify number of fittings included",
      "Show portfolio of previous work",
      "Mention lead time required",
    ],
  },
];

export const getServiceTemplates = api(
  { method: "GET", path: "/services/templates", expose: true },
  async (req: { category?: string }): Promise<{ templates: ServiceTemplate[] }> => {
    let templates = SERVICE_TEMPLATES;
    
    if (req.category) {
      templates = templates.filter((t) => t.category === req.category);
    }

    return { templates };
  }
);

export const getServiceTemplate = api(
  { method: "GET", path: "/services/templates/:name", expose: true },
  async (req: { name: string }): Promise<ServiceTemplate> => {
    const template = SERVICE_TEMPLATES.find(
      (t) => t.name.toLowerCase().replace(/\s+/g, "-") === req.name.toLowerCase()
    );

    if (!template) {
      throw new Error("Template not found");
    }

    return template;
  }
);

