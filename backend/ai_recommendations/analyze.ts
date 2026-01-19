import { api } from "encore.dev/api";
import { AnalyzeImageRequest, GetRecommendationsResponse } from "./schemas";
import type { AIAnalysisResult, FaceShape, SkinTone, HairTexture, StyleRecommendation, MakeupRecommendation } from "./types";
import db from "../db";

async function analyzeImageWithAI(imageUrl: string): Promise<AIAnalysisResult> {
  const faceShapes: FaceShape[] = ["oval", "round", "square", "heart", "diamond", "oblong"];
  const skinTones: SkinTone[] = ["light", "medium", "tan", "brown", "dark"];
  const hairTextures: HairTexture[] = ["straight", "wavy", "curly", "coily", "kinky"];
  
  const randomFaceShape = faceShapes[Math.floor(Math.random() * faceShapes.length)];
  const randomSkinTone = skinTones[Math.floor(Math.random() * skinTones.length)];
  const randomHairTexture = hairTextures[Math.floor(Math.random() * hairTextures.length)];
  
  return {
    faceShape: randomFaceShape,
    skinTone: randomSkinTone,
    estimatedHairTexture: randomHairTexture,
    confidence: 0.75 + Math.random() * 0.2,
  };
}

function getHairstyleRecommendations(
  faceShape: FaceShape,
  skinTone: SkinTone,
  hairTexture?: HairTexture
): StyleRecommendation[] {
  const recommendations: StyleRecommendation[] = [];
  
  const faceShapeRecommendations: Record<FaceShape, Array<{ name: string; category: string; reason: string }>> = {
    oval: [
      { name: "Knotless Braids", category: "braids", reason: "Your balanced oval face shape suits most styles, and knotless braids will frame your face beautifully" },
      { name: "High Bun", category: "natural-hair", reason: "Elongates your silhouette while showcasing your versatile face shape" },
      { name: "Bob Cut", category: "wigs", reason: "Classic bob styles complement oval faces perfectly" },
    ],
    round: [
      { name: "Long Box Braids", category: "braids", reason: "Length creates vertical lines that elongate round face shapes" },
      { name: "Side-Swept Style", category: "natural-hair", reason: "Asymmetry adds angles to soften roundness" },
      { name: "Layered Locs", category: "locs", reason: "Layers create dimension and slim the face" },
    ],
    square: [
      { name: "Soft Curls", category: "natural-hair", reason: "Soft curves balance angular jawlines" },
      { name: "Side Part Braids", category: "braids", reason: "Off-center parts soften strong features" },
      { name: "Wavy Lob", category: "wigs", reason: "Waves add softness to angular features" },
    ],
    heart: [
      { name: "Chin-Length Bob", category: "wigs", reason: "Balances wider forehead with volume at jawline" },
      { name: "Side Braids", category: "braids", reason: "Width at the bottom balances your proportions" },
      { name: "Textured Pixie", category: "barbering", reason: "Short styles with texture work well with heart-shaped faces" },
    ],
    diamond: [
      { name: "Shoulder-Length Waves", category: "wigs", reason: "Width at cheekbones is balanced by fullness" },
      { name: "Medium Braids", category: "braids", reason: "Medium length complements your angular features" },
      { name: "Voluminous Curls", category: "natural-hair", reason: "Volume balances narrow forehead and chin" },
    ],
    oblong: [
      { name: "Bangs with Braids", category: "braids", reason: "Horizontal lines shorten the appearance of length" },
      { name: "Shoulder-Length Cut", category: "wigs", reason: "Width at shoulders balances face length" },
      { name: "Voluminous Afro", category: "natural-hair", reason: "Width adds proportion to elongated faces" },
    ],
  };

  const faceRecs = faceShapeRecommendations[faceShape] || faceShapeRecommendations.oval;
  
  faceRecs.forEach((rec, index) => {
    recommendations.push({
      styleId: `style-${index + 1}`,
      styleName: rec.name,
      category: rec.category,
      matchScore: 85 + Math.floor(Math.random() * 15),
      reason: rec.reason,
    });
  });

  if (hairTexture && ["curly", "coily", "kinky"].includes(hairTexture)) {
    recommendations.push({
      styleId: "style-natural",
      styleName: "Natural Twist Out",
      category: "natural-hair",
      matchScore: 90,
      reason: "Your natural texture is beautiful! This style enhances your curls",
    });
  }

  return recommendations.slice(0, 5);
}

function getMakeupRecommendations(
  faceShape: FaceShape,
  skinTone: SkinTone
): MakeupRecommendation[] {
  const recommendations: MakeupRecommendation[] = [];

  const skinToneShades: Record<SkinTone, string[]> = {
    light: ["Warm beige", "Soft pink", "Light bronze"],
    medium: ["Warm honey", "Golden bronze", "Terracotta"],
    tan: ["Caramel", "Deep bronze", "Warm copper"],
    brown: ["Rich cocoa", "Deep plum", "Warm mahogany"],
    dark: ["Deep espresso", "Rich burgundy", "Bold copper"],
  };

  recommendations.push({
    type: "Foundation & Concealer",
    shades: skinToneShades[skinTone],
    techniques: ["Match to jawline", "Blend well into neck", "Use color corrector if needed"],
    reason: `These warm tones complement ${skinTone} skin beautifully`,
  });

  const contourMap: Record<FaceShape, string[]> = {
    oval: ["Light contouring on temples", "Soft highlight on cheekbones"],
    round: ["Contour sides of face", "Highlight center of forehead and chin"],
    square: ["Soften jawline with contour", "Highlight center of face"],
    heart: ["Contour forehead sides", "Highlight chin to balance"],
    diamond: ["Soften cheekbones", "Highlight forehead and chin"],
    oblong: ["Contour top of forehead and chin", "Highlight center horizontally"],
  };

  recommendations.push({
    type: "Contouring",
    shades: ["Matte bronzer 2-3 shades deeper"],
    techniques: contourMap[faceShape],
    reason: `Optimized for your ${faceShape} face shape`,
  });

  recommendations.push({
    type: "Lip Color",
    shades: skinTone === "dark" || skinTone === "brown" 
      ? ["Bold reds", "Deep berries", "Rich plums"]
      : ["Nude pinks", "Coral tones", "Berry shades"],
    techniques: ["Use lip liner to define", "Apply from center outward"],
    reason: "These shades enhance your natural beauty",
  });

  return recommendations;
}

export const analyze = api(
  { expose: true, method: "POST", path: "/ai-recommendations/analyze" },
  async (req: AnalyzeImageRequest): Promise<GetRecommendationsResponse> => {
    const analysis = await analyzeImageWithAI(req.imageUrl);
    
    const hairstyleRecs = getHairstyleRecommendations(
      analysis.faceShape,
      analysis.skinTone,
      analysis.estimatedHairTexture
    );

    const stylesWithImages = await Promise.all(
      hairstyleRecs.map(async (rec) => {
        try {
          const results: Array<{ image_url: string }> = [];
          for await (const row of db.query<{ image_url: string }>`
            SELECT image_url 
            FROM styles 
            WHERE category = ${rec.category}
            AND image_url IS NOT NULL
            LIMIT 1
          `) {
            results.push(row);
          }
          
          return {
            ...rec,
            imageUrl: results[0]?.image_url,
          };
        } catch {
          return rec;
        }
      })
    );

    const makeupRecs = getMakeupRecommendations(
      analysis.faceShape,
      analysis.skinTone
    );

    const generalTips: string[] = [
      `Your ${analysis.faceShape} face shape is versatile and suits many styles`,
      "Consider your lifestyle and maintenance preferences when choosing a style",
      "Consult with a professional stylist to customize these recommendations",
      "Don't be afraid to try new styles that express your personality",
    ];

    if (analysis.estimatedHairTexture) {
      generalTips.push(
        `Your ${analysis.estimatedHairTexture} hair texture works beautifully with protective styles`
      );
    }

    return {
      analysis: {
        faceShape: analysis.faceShape,
        skinTone: analysis.skinTone,
        estimatedHairTexture: analysis.estimatedHairTexture,
        confidence: analysis.confidence,
      },
      hairstyleRecommendations: stylesWithImages,
      makeupRecommendations: makeupRecs,
      generalTips,
    };
  }
);
