export interface AnalyzeImageRequest {
  imageUrl: string;
  analysisType?: "full" | "hairstyle" | "makeup";
}

export interface GetRecommendationsResponse {
  analysis: {
    faceShape: string;
    skinTone: string;
    estimatedHairTexture?: string;
    confidence: number;
  };
  hairstyleRecommendations: Array<{
    styleId: string;
    styleName: string;
    category: string;
    matchScore: number;
    reason: string;
    imageUrl?: string;
  }>;
  makeupRecommendations: Array<{
    type: string;
    shades: string[];
    techniques: string[];
    reason: string;
  }>;
  generalTips: string[];
}
