// =============================================================================
// BRAIDA AI - REACT HOOKS FOR RECOMMENDATIONS
// Custom hooks for integrating AI features into the frontend
// =============================================================================

import { useState, useCallback, useEffect } from 'react';
import backend from '~backend/client';

// =============================================================================
// TYPES
// =============================================================================

export type FaceShape = 'oval' | 'round' | 'square' | 'heart' | 'oblong' | 'diamond';
export type HairType = '3A' | '3B' | '3C' | '4A' | '4B' | '4C';
export type MonkScale = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type SkinUndertone = 'warm' | 'cool' | 'neutral';
export type ServiceCategory = 'hair' | 'makeup' | 'gele' | 'tailoring';

export interface UserFeatures {
  faceShape?: {
    shape: FaceShape;
    confidence: number;
  };
  skinTone?: {
    monkScale: MonkScale;
    undertone: SkinUndertone;
    confidence: number;
  };
  hairAnalysis?: {
    hairType: HairType;
    density: 'thin' | 'medium' | 'thick';
    confidence: number;
  };
  analyzedAt?: Date;
}

export interface StyleRecommendation {
  style: {
    id: string;
    name: string;
    category: ServiceCategory;
    description: string;
    imageUrls: string[];
    maintenanceLevel: 'low' | 'medium' | 'high';
    durationWeeks?: number;
    occasions: string[];
    priceRange: { min: number; max: number };
  };
  score: number;
  reasons: string[];
  matchFactors: {
    faceShapeMatch: number;
    skinToneMatch: number;
    hairTypeMatch: number;
    preferenceMatch: number;
  };
}

export interface FreelancerRecommendation {
  freelancerId: string;
  freelancerName: string;
  score: number;
  reasons: string[];
  specializations: string[];
  averageRating: number;
  completedBookings: number;
  portfolioUrls: string[];
}

// =============================================================================
// useUserFeatures HOOK
// =============================================================================

export function useUserFeatures() {
  const [features, setFeatures] = useState<UserFeatures | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeatures = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await backend.ai.getUserFeaturesEndpoint();
      if (response.features) {
        setFeatures(response.features as UserFeatures);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch features');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFeatures = useCallback(async (updates: Partial<{
    faceShape: string;
    skinTone: number;
    undertone: string;
    hairType: string;
    hairDensity: string;
    hairPorosity: string;
    hairLength: string;
  }>) => {
    setLoading(true);
    setError(null);
    try {
      await backend.ai.updateUserFeaturesEndpoint(updates);
      await fetchFeatures();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update features');
    } finally {
      setLoading(false);
    }
  }, [fetchFeatures]);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  return {
    features,
    loading,
    error,
    refetch: fetchFeatures,
    updateFeatures,
    hasAnalysis: !!(features?.faceShape || features?.skinTone || features?.hairAnalysis),
  };
}

// =============================================================================
// useImageAnalysis HOOK
// =============================================================================

export function useImageAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    faceShape?: { shape: FaceShape; confidence: number };
    skinTone?: { monkScale: MonkScale; undertone: SkinUndertone; confidence: number };
    hairAnalysis?: { hairType: HairType; confidence: number };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeImage = useCallback(async (imageData: string | File) => {
    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      let imageBase64: string | undefined;
      let imageUrl: string | undefined;

      if (typeof imageData === 'string') {
        if (imageData.startsWith('http')) {
          imageUrl = imageData;
        } else {
          imageBase64 = imageData;
        }
      } else {
        imageBase64 = await fileToBase64(imageData);
      }

      const response = await backend.ai.analyzeImage({
        imageUrl,
        imageBase64,
        analysisTypes: ['face_shape', 'skin_tone', 'hair_type'],
      });

      if (response.success) {
        setResult({
          faceShape: response.faceShape ? {
            shape: response.faceShape.shape as FaceShape,
            confidence: response.faceShape.confidence,
          } : undefined,
          skinTone: response.skinTone ? {
            monkScale: response.skinTone.monkScale as MonkScale,
            undertone: response.skinTone.undertone as SkinUndertone,
            confidence: response.skinTone.confidence,
          } : undefined,
          hairAnalysis: response.hairAnalysis ? {
            hairType: response.hairAnalysis.hairType as HairType,
            confidence: response.hairAnalysis.confidence,
          } : undefined,
        });
      } else {
        throw new Error('Image analysis failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
    } finally {
      setAnalyzing(false);
    }
  }, []);

  return {
    analyzing,
    result,
    error,
    analyzeImage,
    reset: () => {
      setResult(null);
      setError(null);
    },
  };
}

// =============================================================================
// useRecommendations HOOK
// =============================================================================

interface RecommendationOptions {
  category: ServiceCategory;
  occasion?: string;
  budgetMin?: number;
  budgetMax?: number;
  location?: { lat: number; lng: number; radius?: number };
  styleLimit?: number;
  freelancerLimit?: number;
}

export function useRecommendations() {
  const [loading, setLoading] = useState(false);
  const [styles, setStyles] = useState<StyleRecommendation[]>([]);
  const [freelancers, setFreelancers] = useState<FreelancerRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);

  const getRecommendations = useCallback(async (options: RecommendationOptions) => {
    setLoading(true);
    setError(null);

    try {
      const response = await backend.ai.getRecommendations({
        category: options.category,
        occasion: options.occasion,
        budgetMin: options.budgetMin,
        budgetMax: options.budgetMax,
        latitude: options.location?.lat,
        longitude: options.location?.lng,
        radius: options.location?.radius,
        styleLimit: options.styleLimit,
        freelancerLimit: options.freelancerLimit,
      });

      setStyles(response.styles as StyleRecommendation[]);
      setFreelancers(response.freelancers as FreelancerRecommendation[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  }, []);

  const getPreviewRecommendations = useCallback(async (options: {
    category: ServiceCategory;
    faceShape?: FaceShape;
    skinTone?: MonkScale;
    undertone?: SkinUndertone;
    hairType?: HairType;
    occasion?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await backend.ai.getRecommendationsPreview({
        category: options.category,
        faceShape: options.faceShape,
        skinTone: options.skinTone,
        undertone: options.undertone,
        hairType: options.hairType,
        occasion: options.occasion,
      });

      const previewStyles = response.styles.map(s => ({
        style: {
          id: s.id,
          name: s.name,
          category: options.category,
          description: '',
          imageUrls: [],
          maintenanceLevel: 'medium' as const,
          occasions: [],
          priceRange: { min: 0, max: 0 },
        },
        score: s.score,
        reasons: s.reasons,
        matchFactors: {
          faceShapeMatch: 0.5,
          skinToneMatch: 0.5,
          hairTypeMatch: 0.5,
          preferenceMatch: 0.5,
        },
      }));

      setStyles(previewStyles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get preview recommendations');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    styles,
    freelancers,
    error,
    getRecommendations,
    getPreviewRecommendations,
    clearRecommendations: () => {
      setStyles([]);
      setFreelancers([]);
      setError(null);
    },
  };
}

// =============================================================================
// useStyleCatalog HOOK
// =============================================================================

export function useStyleCatalog() {
  const [styles, setStyles] = useState<StyleRecommendation['style'][]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchStyles = useCallback(async (options?: {
    category?: ServiceCategory;
    limit?: number;
    offset?: number;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await backend.ai.getStyles({
        category: options?.category,
        limit: options?.limit,
        offset: options?.offset,
      });

      setStyles(response.styles as StyleRecommendation['style'][]);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch styles');
    } finally {
      setLoading(false);
    }
  }, []);

  const getStyleById = useCallback(async (styleId: string) => {
    try {
      const response = await backend.ai.getStyleById({ styleId });
      return response.style as StyleRecommendation['style'] | null;
    } catch (err) {
      console.error('Failed to fetch style:', err);
      return null;
    }
  }, []);

  return {
    styles,
    loading,
    error,
    total,
    fetchStyles,
    getStyleById,
  };
}

// =============================================================================
// useInteractionTracking HOOK
// =============================================================================

export function useInteractionTracking() {
  const trackView = useCallback(async (styleId: string, duration?: number) => {
    try {
      await backend.ai.trackInteraction({
        styleId,
        interactionType: 'view',
        duration,
      });
    } catch (err) {
      console.error('Failed to track view:', err);
    }
  }, []);

  const trackClick = useCallback(async (styleId: string) => {
    try {
      await backend.ai.trackInteraction({
        styleId,
        interactionType: 'click',
      });
    } catch (err) {
      console.error('Failed to track click:', err);
    }
  }, []);

  const trackSave = useCallback(async (styleId: string) => {
    try {
      await backend.ai.trackInteraction({
        styleId,
        interactionType: 'save',
      });
    } catch (err) {
      console.error('Failed to track save:', err);
    }
  }, []);

  const trackBook = useCallback(async (styleId: string, rating?: number) => {
    try {
      await backend.ai.trackInteraction({
        styleId,
        interactionType: 'book',
        rating,
      });
    } catch (err) {
      console.error('Failed to track booking:', err);
    }
  }, []);

  return { trackView, trackClick, trackSave, trackBook };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// =============================================================================
// DESCRIPTIONS
// =============================================================================

export const MONK_SCALE_NAMES: Record<MonkScale, string> = {
  1: 'Very Light',
  2: 'Light',
  3: 'Light Medium',
  4: 'Medium Light',
  5: 'Medium',
  6: 'Medium Tan',
  7: 'Tan',
  8: 'Brown',
  9: 'Dark Brown',
  10: 'Deep Brown',
};

export const HAIR_TYPE_DESCRIPTIONS: Record<HairType, string> = {
  '3A': 'Loose curls with an S-pattern',
  '3B': 'Medium springy curls',
  '3C': 'Tight corkscrew curls',
  '4A': 'Defined S-pattern coils',
  '4B': 'Z-pattern coils with sharp angles',
  '4C': 'Tight, densely packed coils',
};

export const FACE_SHAPE_DESCRIPTIONS: Record<FaceShape, string> = {
  oval: 'Balanced proportions with a slightly narrower forehead and jaw',
  round: 'Full cheeks with similar width and length',
  square: 'Strong jawline with similar width across face',
  heart: 'Wide forehead tapering to a narrow chin',
  oblong: 'Longer than wide with balanced features',
  diamond: 'Narrow forehead and jaw with prominent cheekbones',
};

export const UNDERTONE_DESCRIPTIONS: Record<SkinUndertone, string> = {
  warm: 'Golden, peachy, or yellow undertones',
  cool: 'Pink, red, or blue undertones',
  neutral: 'Mix of warm and cool undertones',
};
