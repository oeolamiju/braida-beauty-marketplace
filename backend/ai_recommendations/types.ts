// =============================================================================
// BRAIDA AI RECOMMENDATION SYSTEM - TYPE DEFINITIONS
// =============================================================================

// -----------------------------------------------------------------------------
// SKIN TONE TYPES
// -----------------------------------------------------------------------------

/**
 * Monk Skin Tone Scale (1-10)
 * More inclusive than Fitzpatrick scale, especially for darker skin tones
 */
export type MonkScale = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type SkinUndertone = 'warm' | 'cool' | 'neutral';

export interface SkinToneAnalysis {
  monkScale: MonkScale;
  undertone: SkinUndertone;
  ita: number; // Individual Typology Angle
  hueAngle: number;
  lightness: number;
  confidence: number;
}

export interface SkinToneGroup {
  name: 'very_light' | 'light' | 'light_medium' | 'medium_light' | 'medium' | 
        'medium_tan' | 'tan' | 'brown' | 'dark_brown' | 'deep_brown';
  monkScales: MonkScale[];
}

// -----------------------------------------------------------------------------
// FACE SHAPE TYPES
// -----------------------------------------------------------------------------

export type FaceShape = 'oval' | 'round' | 'square' | 'heart' | 'oblong' | 'diamond';

export interface FacialLandmarks {
  jawWidth: number;
  cheekboneWidth: number;
  foreheadWidth: number;
  faceLength: number;
  chinLength: number;
  cheekboneProminence: number;
}

export interface FaceShapeAnalysis {
  shape: FaceShape;
  landmarks: FacialLandmarks;
  widthToHeightRatio: number;
  foreheadToJawRatio: number;
  confidence: number;
}

// -----------------------------------------------------------------------------
// HAIR TYPE DEFINITIONS
// -----------------------------------------------------------------------------

/**
 * Andre Walker Hair Typing System
 * Type 3: Curly (3A, 3B, 3C)
 * Type 4: Coily/Kinky (4A, 4B, 4C)
 */
export type HairType = '1A' | '1B' | '1C' | '2A' | '2B' | '2C' | 
                       '3A' | '3B' | '3C' | '4A' | '4B' | '4C';

export type HairDensity = 'thin' | 'medium' | 'thick';
export type HairPorosity = 'low' | 'normal' | 'high';
export type HairLength = 'short' | 'medium' | 'long' | 'extra_long';

export interface HairTextureFeatures {
  gaborFeatures: number[];
  lbpHistogram: number[];
  smoothness: number;
  shine: number;
  curlDefinition: number;
  coilTightness: number;
}

export interface HairAnalysis {
  hairType: HairType;
  density: HairDensity;
  porosity: HairPorosity;
  lengthCategory: HairLength;
  textureFeatures: HairTextureFeatures;
  currentStyle?: string;
  confidence: number;
}

// -----------------------------------------------------------------------------
// USER FEATURE PROFILE
// -----------------------------------------------------------------------------

export interface UserFeatures {
  userId: string;
  faceShape?: FaceShapeAnalysis;
  skinTone?: SkinToneAnalysis;
  hairAnalysis?: HairAnalysis;
  analyzedAt?: Date;
  imageUrl?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  preferredStyles?: string[];
  avoidStyles?: string[];
  maintenanceLevel?: 'low' | 'medium' | 'high';
  budgetRange?: { min: number; max: number };
  occasions?: string[];
  allergies?: string[];
  scalpSensitivity?: 'low' | 'normal' | 'high';
}

// -----------------------------------------------------------------------------
// STYLE DEFINITIONS
// -----------------------------------------------------------------------------

export type ServiceCategory = 'hair' | 'makeup' | 'gele' | 'tailoring';

export interface StyleDefinition {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  imageUrls: string[];
  suitableFaceShapes: FaceShape[];
  suitableHairTypes: HairType[];
  suitableSkinTones: MonkScale[];
  maintenanceLevel: 'low' | 'medium' | 'high';
  durationWeeks?: number;
  occasions: string[];
  priceRange: { min: number; max: number };
  tags: string[];
}

// -----------------------------------------------------------------------------
// BRAID & LOC SPECIFIC TYPES
// -----------------------------------------------------------------------------

export interface BraidStyle extends StyleDefinition {
  category: 'hair';
  braidType: 'box_braids' | 'knotless' | 'cornrows' | 'twists' | 'locs' | 
             'passion_twists' | 'senegalese_twists' | 'faux_locs' | 'goddess_locs';
  hairLengthRequired: HairLength[];
  extensionsNeeded: boolean;
  installTime: { min: number; max: number }; // in hours
  scalepFriendly: boolean;
}

// -----------------------------------------------------------------------------
// GELE SPECIFIC TYPES
// -----------------------------------------------------------------------------

export interface GeleStyle extends StyleDefinition {
  category: 'gele';
  geleType: 'butterfly' | 'rose_flower' | 'fan' | 'simple_pleated' | 
            'turban' | 'aso_oke' | 'damask' | 'custom';
  complexity: 'low' | 'medium' | 'high';
  fabricType: string[];
}

// -----------------------------------------------------------------------------
// MAKEUP SPECIFIC TYPES
// -----------------------------------------------------------------------------

export interface MakeupStyle extends StyleDefinition {
  category: 'makeup';
  makeupType: 'soft_glam' | 'full_glam' | 'natural' | 'bridal' | 
              'editorial' | 'evening' | 'everyday';
  colorPalettes: ColorPalette[];
}

export interface ColorPalette {
  name: string;
  suitableMonkScales: MonkScale[];
  suitableUndertones: SkinUndertone[];
  lipColors: string[];
  eyeColors: string[];
  blushColors: string[];
  foundationRange: string;
}

// -----------------------------------------------------------------------------
// RECOMMENDATION TYPES
// -----------------------------------------------------------------------------

export interface StyleRecommendation {
  style: StyleDefinition;
  score: number;
  reasons: string[];
  matchFactors: {
    faceShapeMatch: number;
    skinToneMatch: number;
    hairTypeMatch: number;
    preferenceMatch: number;
    popularityScore: number;
  };
}

export interface FreelancerRecommendation {
  freelancerId: string;
  freelancerName: string;
  score: number;
  reasons: string[];
  matchFactors: {
    expertiseMatch: number;
    styleMatch: number;
    ratingScore: number;
    locationScore: number;
    priceMatch: number;
  };
  specializations: string[];
  averageRating: number;
  completedBookings: number;
  portfolioUrls: string[];
}

export interface RecommendationContext {
  occasion?: string;
  budget?: { min: number; max: number };
  location?: { lat: number; lng: number; radius: number };
  preferredDate?: Date;
  urgency?: 'flexible' | 'within_week' | 'urgent';
}

export interface RecommendationResponse {
  styles: StyleRecommendation[];
  freelancers: FreelancerRecommendation[];
  generatedAt: Date;
  userFeatures: Partial<UserFeatures>;
  context: RecommendationContext;
}

// -----------------------------------------------------------------------------
// IMAGE ANALYSIS REQUEST/RESPONSE
// -----------------------------------------------------------------------------

export interface ImageAnalysisRequest {
  imageUrl?: string;
  imageBase64?: string;
  analysisTypes: ('face_shape' | 'skin_tone' | 'hair_type')[];
}

export interface ImageAnalysisResponse {
  success: boolean;
  faceShape?: FaceShapeAnalysis;
  skinTone?: SkinToneAnalysis;
  hairAnalysis?: HairAnalysis;
  errors?: string[];
  processingTime: number;
}

// -----------------------------------------------------------------------------
// BIAS MONITORING TYPES
// -----------------------------------------------------------------------------

export interface BiasMetrics {
  skinToneDisparity: number;
  hairTypeDisparity: number;
  intersectionalDisparity: number;
  groupPerformance: Record<string, number>;
  timestamp: Date;
}

export interface FairnessAuditResult {
  overallFairness: number;
  skinToneBias: BiasMetrics;
  hairTypeBias: BiasMetrics;
  recommendations: string[];
  auditedAt: Date;
}

// -----------------------------------------------------------------------------
// KNOWLEDGE GRAPH TYPES
// -----------------------------------------------------------------------------

export interface StyleCompatibility {
  styleId: string;
  faceShapeScores: Record<FaceShape, number>;
  hairTypeScores: Record<HairType, number>;
  skinToneScores: Record<MonkScale, number>;
  occasionScores: Record<string, number>;
}

export interface FreelancerCapability {
  freelancerId: string;
  expertiseStyles: string[];
  hairTypeExpertise: HairType[];
  skinToneExperience: MonkScale[];
  certifications: string[];
  portfolioCategories: ServiceCategory[];
}

// -----------------------------------------------------------------------------
// API ENDPOINT TYPES
// -----------------------------------------------------------------------------

export interface GetRecommendationsRequest {
  userId: string;
  category: ServiceCategory;
  context?: RecommendationContext;
  limit?: number;
}

export interface AnalyzeImageRequest {
  userId: string;
  imageUrl?: string;
  imageBase64?: string;
}

export interface UpdatePreferencesRequest {
  userId: string;
  preferences: UserPreferences;
}

export interface GetUserFeaturesRequest {
  userId: string;
}

export interface GetStyleDetailsRequest {
  styleId: string;
}

// -----------------------------------------------------------------------------
// DATABASE SCHEMA TYPES (for migrations)
// -----------------------------------------------------------------------------

export interface UserFeaturesRecord {
  id: string;
  user_id: string;
  face_shape: string | null;
  face_shape_confidence: number | null;
  face_landmarks: object | null;
  monk_scale: number | null;
  skin_undertone: string | null;
  skin_tone_confidence: number | null;
  hair_type: string | null;
  hair_density: string | null;
  hair_porosity: string | null;
  hair_length: string | null;
  hair_confidence: number | null;
  preferences: object | null;
  analyzed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface StyleDefinitionRecord {
  id: string;
  name: string;
  category: string;
  description: string;
  image_urls: string[];
  suitable_face_shapes: string[];
  suitable_hair_types: string[];
  suitable_skin_tones: number[];
  maintenance_level: string;
  duration_weeks: number | null;
  occasions: string[];
  price_range_min: number;
  price_range_max: number;
  tags: string[];
  metadata: object | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface RecommendationLogRecord {
  id: string;
  user_id: string;
  category: string;
  context: object;
  recommendations: object;
  user_features: object;
  clicked_items: string[];
  booked_item: string | null;
  created_at: Date;
}

export interface BiasAuditLogRecord {
  id: string;
  audit_type: string;
  metrics: object;
  recommendations: string[];
  created_at: Date;
}
