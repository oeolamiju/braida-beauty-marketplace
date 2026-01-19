export type FaceShape = "oval" | "round" | "square" | "heart" | "diamond" | "oblong";
export type HairTexture = "straight" | "wavy" | "curly" | "coily" | "kinky";
export type SkinTone = "light" | "medium" | "tan" | "brown" | "dark";

export interface AIAnalysisResult {
  faceShape: FaceShape;
  skinTone: SkinTone;
  estimatedHairTexture?: HairTexture;
  confidence: number;
}

export interface StyleRecommendation {
  styleId: string;
  styleName: string;
  category: string;
  matchScore: number;
  reason: string;
  imageUrl?: string;
}

export interface MakeupRecommendation {
  type: string;
  shades: string[];
  techniques: string[];
  reason: string;
}

export interface RecommendationResponse {
  analysis: AIAnalysisResult;
  hairstyleRecommendations: StyleRecommendation[];
  makeupRecommendations: MakeupRecommendation[];
  generalTips: string[];
}
