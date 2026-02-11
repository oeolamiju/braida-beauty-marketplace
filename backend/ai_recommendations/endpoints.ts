// =============================================================================
// BRAIDA AI - API ENDPOINTS
// RESTful API for AI-powered recommendations and analysis
// =============================================================================

import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { featureExtractor } from "./feature_extraction";
import { recommendationEngine } from "./recommendation_engine";
import { biasAuditor } from "./bias_monitoring";
import {
  ServiceCategory,
  RecommendationContext,
  RecommendationResponse,
  ImageAnalysisResponse,
  UserFeatures,
  FaceShapeAnalysis,
  SkinToneAnalysis,
  HairAnalysis,
  UserPreferences,
  StyleDefinition,
  FairnessAuditResult,
} from "./types";

// =============================================================================
// IMAGE ANALYSIS ENDPOINTS
// =============================================================================

interface AnalyzeImageRequest {
  imageUrl?: string;
  imageBase64?: string;
  analysisTypes?: ('face_shape' | 'skin_tone' | 'hair_type')[];
}

interface AnalyzeImageResponse {
  success: boolean;
  faceShape?: FaceShapeAnalysis;
  skinTone?: SkinToneAnalysis;
  hairAnalysis?: HairAnalysis;
  processingTime: number;
  savedToProfile: boolean;
}

/**
 * Analyze user's image for facial features, skin tone, and hair type
 * POST /ai/analyze-image
 */
export const analyzeImage = api(
  {
    method: "POST",
    path: "/ai/analyze-image",
    expose: true,
    auth: true,
  },
  async (req: AnalyzeImageRequest): Promise<AnalyzeImageResponse> => {
    const auth = getAuthData();
    if (!auth) {
      throw APIError.unauthenticated("Authentication required");
    }

    if (!req.imageUrl && !req.imageBase64) {
      throw APIError.invalidArgument("Either imageUrl or imageBase64 is required");
    }

    const analysisTypes = req.analysisTypes || ['face_shape', 'skin_tone', 'hair_type'];

    // Perform image analysis
    const result = await featureExtractor.analyzeImage({
      imageUrl: req.imageUrl,
      imageBase64: req.imageBase64,
      analysisTypes,
    });

    if (!result.success) {
      throw APIError.internal("Image analysis failed");
    }

    // Save results to user profile
    let savedToProfile = false;
    try {
      await saveUserFeatures(auth.userID, {
        faceShape: result.faceShape,
        skinTone: result.skinTone,
        hairAnalysis: result.hairAnalysis,
      });
      savedToProfile = true;
    } catch (error) {
      console.error("Failed to save features to profile:", error);
    }

    return {
      success: true,
      faceShape: result.faceShape,
      skinTone: result.skinTone,
      hairAnalysis: result.hairAnalysis,
      processingTime: result.processingTime,
      savedToProfile,
    };
  }
);

// =============================================================================
// RECOMMENDATION ENDPOINTS
// =============================================================================

interface GetRecommendationsRequest {
  category: ServiceCategory;
  occasion?: string;
  budgetMin?: number;
  budgetMax?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
  styleLimit?: number;
  freelancerLimit?: number;
}

/**
 * Get personalized style and freelancer recommendations
 * GET /ai/recommendations
 */
export const getRecommendations = api(
  {
    method: "GET",
    path: "/ai/recommendations",
    expose: true,
    auth: true,
  },
  async (req: GetRecommendationsRequest): Promise<RecommendationResponse> => {
    const auth = getAuthData();
    if (!auth) {
      throw APIError.unauthenticated("Authentication required");
    }

    // Get user features
    const userFeatures = await getUserFeatures(auth.userID);

    // Build context
    const context: RecommendationContext = {};
    if (req.occasion) context.occasion = req.occasion;
    if (req.budgetMin !== undefined && req.budgetMax !== undefined) {
      context.budget = { min: req.budgetMin, max: req.budgetMax };
    }
    if (req.latitude !== undefined && req.longitude !== undefined) {
      context.location = {
        lat: req.latitude,
        lng: req.longitude,
        radius: req.radius || 25,
      };
    }

    // Get recommendations
    const recommendations = await recommendationEngine.getRecommendations(
      auth.userID,
      userFeatures,
      req.category,
      context,
      {
        styleLimit: req.styleLimit,
        freelancerLimit: req.freelancerLimit,
      }
    );

    return recommendations;
  }
);

/**
 * Get style recommendations without authentication (public browsing)
 * POST /ai/recommendations/preview
 */
export const getRecommendationsPreview = api(
  {
    method: "POST",
    path: "/ai/recommendations/preview",
    expose: true,
    auth: false,
  },
  async (req: {
    category: ServiceCategory;
    faceShape?: string;
    skinTone?: number;
    undertone?: string;
    hairType?: string;
    occasion?: string;
  }): Promise<{ styles: Array<{ id: string; name: string; score: number; reasons: string[] }> }> => {
    
    // Build temporary user features from request
    const userFeatures: UserFeatures = {
      userId: 'anonymous',
    };

    if (req.faceShape) {
      userFeatures.faceShape = {
        shape: req.faceShape as any,
        landmarks: {} as any,
        widthToHeightRatio: 0.8,
        foreheadToJawRatio: 1.0,
        confidence: 0.9,
      };
    }

    if (req.skinTone) {
      userFeatures.skinTone = {
        monkScale: req.skinTone as any,
        undertone: (req.undertone || 'neutral') as any,
        ita: 0,
        hueAngle: 0,
        lightness: 50,
        confidence: 0.9,
      };
    }

    if (req.hairType) {
      userFeatures.hairAnalysis = {
        hairType: req.hairType as any,
        density: 'medium',
        porosity: 'normal',
        lengthCategory: 'medium',
        textureFeatures: {} as any,
        confidence: 0.9,
      };
    }

    const context: RecommendationContext = {};
    if (req.occasion) context.occasion = req.occasion;

    const recommendations = await recommendationEngine.getRecommendations(
      'anonymous',
      userFeatures,
      req.category,
      context,
      { styleLimit: 10 }
    );

    return {
      styles: recommendations.styles.map(s => ({
        id: s.style.id,
        name: s.style.name,
        score: s.score,
        reasons: s.reasons,
      })),
    };
  }
);

// =============================================================================
// USER FEATURES ENDPOINTS
// =============================================================================

interface UpdateUserFeaturesRequest {
  faceShape?: string;
  skinTone?: number;
  undertone?: string;
  hairType?: string;
  hairDensity?: string;
  hairPorosity?: string;
  hairLength?: string;
  preferences?: UserPreferences;
}

/**
 * Get user's analyzed features
 * GET /ai/user-features
 */
export const getUserFeaturesEndpoint = api(
  {
    method: "GET",
    path: "/ai/user-features",
    expose: true,
    auth: true,
  },
  async (): Promise<{ features: UserFeatures | null; hasAnalysis: boolean }> => {
    const auth = getAuthData();
    if (!auth) {
      throw APIError.unauthenticated("Authentication required");
    }

    const features = await getUserFeatures(auth.userID);
    
    return {
      features,
      hasAnalysis: !!(features.faceShape || features.skinTone || features.hairAnalysis),
    };
  }
);

/**
 * Manually update user features (without image analysis)
 * PUT /ai/user-features
 */
export const updateUserFeaturesEndpoint = api(
  {
    method: "PUT",
    path: "/ai/user-features",
    expose: true,
    auth: true,
  },
  async (req: UpdateUserFeaturesRequest): Promise<{ success: boolean }> => {
    const auth = getAuthData();
    if (!auth) {
      throw APIError.unauthenticated("Authentication required");
    }

    await db.exec`
      INSERT INTO user_features (user_id, face_shape, monk_scale, skin_undertone, 
        hair_type, hair_density, hair_porosity, hair_length, preferences, updated_at)
      VALUES (
        ${auth.userID},
        ${req.faceShape || null},
        ${req.skinTone || null},
        ${req.undertone || null},
        ${req.hairType || null},
        ${req.hairDensity || null},
        ${req.hairPorosity || null},
        ${req.hairLength || null},
        ${JSON.stringify(req.preferences || {})},
        NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        face_shape = COALESCE(EXCLUDED.face_shape, user_features.face_shape),
        monk_scale = COALESCE(EXCLUDED.monk_scale, user_features.monk_scale),
        skin_undertone = COALESCE(EXCLUDED.skin_undertone, user_features.skin_undertone),
        hair_type = COALESCE(EXCLUDED.hair_type, user_features.hair_type),
        hair_density = COALESCE(EXCLUDED.hair_density, user_features.hair_density),
        hair_porosity = COALESCE(EXCLUDED.hair_porosity, user_features.hair_porosity),
        hair_length = COALESCE(EXCLUDED.hair_length, user_features.hair_length),
        preferences = COALESCE(EXCLUDED.preferences, user_features.preferences),
        updated_at = NOW()
    `;

    return { success: true };
  }
);

/**
 * Update user preferences
 * PUT /ai/user-preferences
 */
export const updateUserPreferences = api(
  {
    method: "PUT",
    path: "/ai/user-preferences",
    expose: true,
    auth: true,
  },
  async (req: { preferences: UserPreferences }): Promise<{ success: boolean }> => {
    const auth = getAuthData();
    if (!auth) {
      throw APIError.unauthenticated("Authentication required");
    }

    await db.exec`
      INSERT INTO user_features (user_id, preferences, updated_at)
      VALUES (${auth.userID}, ${JSON.stringify(req.preferences)}, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        preferences = ${JSON.stringify(req.preferences)},
        updated_at = NOW()
    `;

    return { success: true };
  }
);

// =============================================================================
// STYLE CATALOG ENDPOINTS
// =============================================================================

/**
 * Get all styles in a category
 * GET /ai/styles
 */
export const getStyles = api(
  {
    method: "GET",
    path: "/ai/styles",
    expose: true,
    auth: false,
  },
  async (req: { 
    category?: ServiceCategory; 
    limit?: number;
    offset?: number;
  }): Promise<{ styles: StyleDefinition[]; total: number }> => {
    
    let query;
    if (req.category) {
      query = db.queryAll<any>`
        SELECT * FROM style_definitions 
        WHERE category = ${req.category} AND is_active = true
        ORDER BY popularity_score DESC, name ASC
        LIMIT ${req.limit || 50} OFFSET ${req.offset || 0}
      `;
    } else {
      query = db.queryAll<any>`
        SELECT * FROM style_definitions 
        WHERE is_active = true
        ORDER BY popularity_score DESC, name ASC
        LIMIT ${req.limit || 50} OFFSET ${req.offset || 0}
      `;
    }

    const result = await query;

    let countResult;
    if (req.category) {
      countResult = await db.queryRow<{ count: number }>`
        SELECT COUNT(*) as count FROM style_definitions 
        WHERE is_active = true AND category = ${req.category}
      `;
    } else {
      countResult = await db.queryRow<{ count: number }>`
        SELECT COUNT(*) as count FROM style_definitions 
        WHERE is_active = true
      `;
    }

    return {
      styles: result.map(row => ({
        id: row.id,
        name: row.name,
        category: row.category,
        description: row.description,
        imageUrls: row.image_urls || [],
        suitableFaceShapes: row.suitable_face_shapes || [],
        suitableHairTypes: row.suitable_hair_types || [],
        suitableSkinTones: row.suitable_skin_tones || [],
        maintenanceLevel: row.maintenance_level,
        durationWeeks: row.duration_weeks,
        occasions: row.occasions || [],
        priceRange: { min: row.price_range_min || 0, max: row.price_range_max || 0 },
        tags: row.tags || [],
      })),
      total: countResult?.count || 0,
    };
  }
);

/**
 * Get a single style by ID
 * GET /ai/styles/:styleId
 */
export const getStyleById = api(
  {
    method: "GET",
    path: "/ai/styles/:styleId",
    expose: true,
    auth: false,
  },
  async (req: { styleId: string }): Promise<{ style: StyleDefinition | null }> => {
    
    const result = await db.queryRow<any>`
      SELECT * FROM style_definitions WHERE id = ${req.styleId}
    `;

    if (!result) {
      return { style: null };
    }

    return {
      style: {
        id: result.id,
        name: result.name,
        category: result.category,
        description: result.description,
        imageUrls: result.image_urls || [],
        suitableFaceShapes: result.suitable_face_shapes || [],
        suitableHairTypes: result.suitable_hair_types || [],
        suitableSkinTones: result.suitable_skin_tones || [],
        maintenanceLevel: result.maintenance_level,
        durationWeeks: result.duration_weeks,
        occasions: result.occasions || [],
        priceRange: { min: result.price_range_min || 0, max: result.price_range_max || 0 },
        tags: result.tags || [],
      },
    };
  }
);

// =============================================================================
// INTERACTION TRACKING ENDPOINTS
// =============================================================================

/**
 * Track user interaction with a style
 * POST /ai/track-interaction
 */
export const trackInteraction = api(
  {
    method: "POST",
    path: "/ai/track-interaction",
    expose: true,
    auth: true,
  },
  async (req: {
    styleId: string;
    interactionType: 'view' | 'click' | 'save' | 'book';
    duration?: number;
    rating?: number;
  }): Promise<{ success: boolean }> => {
    const auth = getAuthData();
    if (!auth) {
      throw APIError.unauthenticated("Authentication required");
    }

    const now = new Date().toISOString();
    
    await db.exec`
      INSERT INTO user_style_interactions (
        user_id, style_id, viewed, clicked, saved, booked,
        view_duration_seconds, rating, first_viewed_at, last_viewed_at, created_at, updated_at
      )
      VALUES (
        ${auth.userID}, ${req.styleId},
        ${req.interactionType === 'view'},
        ${req.interactionType === 'click'},
        ${req.interactionType === 'save'},
        ${req.interactionType === 'book'},
        ${req.duration || null},
        ${req.rating || null},
        ${now}, ${now}, ${now}, ${now}
      )
      ON CONFLICT (user_id, style_id) DO UPDATE SET
        viewed = user_style_interactions.viewed OR EXCLUDED.viewed,
        clicked = user_style_interactions.clicked OR EXCLUDED.clicked,
        saved = CASE WHEN EXCLUDED.saved THEN true ELSE user_style_interactions.saved END,
        booked = user_style_interactions.booked OR EXCLUDED.booked,
        view_duration_seconds = COALESCE(EXCLUDED.view_duration_seconds, user_style_interactions.view_duration_seconds),
        rating = COALESCE(EXCLUDED.rating, user_style_interactions.rating),
        last_viewed_at = ${now},
        booked_at = CASE WHEN EXCLUDED.booked THEN ${now} ELSE user_style_interactions.booked_at END,
        updated_at = ${now}
    `;

    // Update style popularity score
    if (req.interactionType === 'book') {
      await db.exec`
        UPDATE style_definitions 
        SET popularity_score = popularity_score + 1
        WHERE id = ${req.styleId}
      `;
    }

    return { success: true };
  }
);

// =============================================================================
// ADMIN ENDPOINTS
// =============================================================================

/**
 * Run bias audit on recommendation system (admin only)
 * POST /ai/admin/bias-audit
 */
export const runBiasAudit = api(
  {
    method: "POST",
    path: "/ai/admin/bias-audit",
    expose: true,
    auth: true,
  },
  async (): Promise<FairnessAuditResult> => {
    const auth = getAuthData();
    if (!auth || auth.role !== 'ADMIN') {
      throw APIError.permissionDenied("Admin access required");
    }

    const result = await biasAuditor.runComprehensiveAudit();
    return result;
  }
);

/**
 * Get recommendation analytics (admin only)
 * GET /ai/admin/analytics
 */
export const getRecommendationAnalytics = api(
  {
    method: "GET",
    path: "/ai/admin/analytics",
    expose: true,
    auth: true,
  },
  async (req: { 
    startDate?: string; 
    endDate?: string;
  }): Promise<{
    totalRecommendations: number;
    conversionRate: number;
    averageScore: number;
    categoryBreakdown: Record<string, number>;
  }> => {
    const auth = getAuthData();
    if (!auth || auth.role !== 'ADMIN') {
      throw APIError.permissionDenied("Admin access required");
    }

    const startDate = req.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = req.endDate || new Date().toISOString();

    const stats = await db.queryRow<{
      total: number;
      booked: number;
    }>`
      SELECT 
        COUNT(*) as total,
        COUNT(booked_item) as booked
      FROM recommendation_logs
      WHERE created_at BETWEEN ${startDate} AND ${endDate}
    `;

    const categoryStats = await db.queryAll<{ category: string; count: number }>`
      SELECT category, COUNT(*) as count
      FROM recommendation_logs
      WHERE created_at BETWEEN ${startDate} AND ${endDate}
      GROUP BY category
    `;

    return {
      totalRecommendations: stats?.total || 0,
      conversionRate: stats?.total ? (stats.booked / stats.total) : 0,
      averageScore: 0, // Would calculate from actual scores
      categoryBreakdown: Object.fromEntries(
        categoryStats.map(c => [c.category, c.count])
      ),
    };
  }
);

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

async function getUserFeatures(userId: string): Promise<UserFeatures> {
  const result = await db.queryRow<{
    face_shape: string;
    face_shape_confidence: number;
    face_landmarks: object;
    width_to_height_ratio: number;
    forehead_to_jaw_ratio: number;
    monk_scale: number;
    skin_undertone: string;
    skin_ita: number;
    skin_hue_angle: number;
    skin_lightness: number;
    skin_tone_confidence: number;
    hair_type: string;
    hair_density: string;
    hair_porosity: string;
    hair_length: string;
    hair_texture_features: object;
    hair_confidence: number;
    preferences: object;
    analyzed_at: string;
  }>`
    SELECT * FROM user_features WHERE user_id = ${userId}
  `;

  const features: UserFeatures = { userId };

  if (result) {
    if (result.face_shape) {
      features.faceShape = {
        shape: result.face_shape as any,
        landmarks: (result.face_landmarks || {}) as any,
        widthToHeightRatio: result.width_to_height_ratio || 0.8,
        foreheadToJawRatio: result.forehead_to_jaw_ratio || 1.0,
        confidence: result.face_shape_confidence || 0.5,
      };
    }

    if (result.monk_scale) {
      features.skinTone = {
        monkScale: result.monk_scale as any,
        undertone: (result.skin_undertone || 'neutral') as any,
        ita: result.skin_ita || 0,
        hueAngle: result.skin_hue_angle || 0,
        lightness: result.skin_lightness || 50,
        confidence: result.skin_tone_confidence || 0.5,
      };
    }

    if (result.hair_type) {
      features.hairAnalysis = {
        hairType: result.hair_type as any,
        density: (result.hair_density || 'medium') as any,
        porosity: (result.hair_porosity || 'normal') as any,
        lengthCategory: (result.hair_length || 'medium') as any,
        textureFeatures: (result.hair_texture_features || {}) as any,
        confidence: result.hair_confidence || 0.5,
      };
    }

    if (result.preferences) {
      features.preferences = result.preferences as UserPreferences;
    }

    if (result.analyzed_at) {
      features.analyzedAt = new Date(result.analyzed_at);
    }
  }

  return features;
}

async function saveUserFeatures(
  userId: string,
  features: {
    faceShape?: FaceShapeAnalysis;
    skinTone?: SkinToneAnalysis;
    hairAnalysis?: HairAnalysis;
  }
): Promise<void> {
  await db.exec`
    INSERT INTO user_features (
      user_id,
      face_shape, face_shape_confidence, face_landmarks, width_to_height_ratio, forehead_to_jaw_ratio,
      monk_scale, skin_undertone, skin_ita, skin_hue_angle, skin_lightness, skin_tone_confidence,
      hair_type, hair_density, hair_porosity, hair_length, hair_texture_features, hair_confidence,
      analyzed_at, updated_at
    )
    VALUES (
      ${userId},
      ${features.faceShape?.shape || null},
      ${features.faceShape?.confidence || null},
      ${JSON.stringify(features.faceShape?.landmarks || null)},
      ${features.faceShape?.widthToHeightRatio || null},
      ${features.faceShape?.foreheadToJawRatio || null},
      ${features.skinTone?.monkScale || null},
      ${features.skinTone?.undertone || null},
      ${features.skinTone?.ita || null},
      ${features.skinTone?.hueAngle || null},
      ${features.skinTone?.lightness || null},
      ${features.skinTone?.confidence || null},
      ${features.hairAnalysis?.hairType || null},
      ${features.hairAnalysis?.density || null},
      ${features.hairAnalysis?.porosity || null},
      ${features.hairAnalysis?.lengthCategory || null},
      ${JSON.stringify(features.hairAnalysis?.textureFeatures || null)},
      ${features.hairAnalysis?.confidence || null},
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      face_shape = COALESCE(EXCLUDED.face_shape, user_features.face_shape),
      face_shape_confidence = COALESCE(EXCLUDED.face_shape_confidence, user_features.face_shape_confidence),
      face_landmarks = COALESCE(EXCLUDED.face_landmarks, user_features.face_landmarks),
      width_to_height_ratio = COALESCE(EXCLUDED.width_to_height_ratio, user_features.width_to_height_ratio),
      forehead_to_jaw_ratio = COALESCE(EXCLUDED.forehead_to_jaw_ratio, user_features.forehead_to_jaw_ratio),
      monk_scale = COALESCE(EXCLUDED.monk_scale, user_features.monk_scale),
      skin_undertone = COALESCE(EXCLUDED.skin_undertone, user_features.skin_undertone),
      skin_ita = COALESCE(EXCLUDED.skin_ita, user_features.skin_ita),
      skin_hue_angle = COALESCE(EXCLUDED.skin_hue_angle, user_features.skin_hue_angle),
      skin_lightness = COALESCE(EXCLUDED.skin_lightness, user_features.skin_lightness),
      skin_tone_confidence = COALESCE(EXCLUDED.skin_tone_confidence, user_features.skin_tone_confidence),
      hair_type = COALESCE(EXCLUDED.hair_type, user_features.hair_type),
      hair_density = COALESCE(EXCLUDED.hair_density, user_features.hair_density),
      hair_porosity = COALESCE(EXCLUDED.hair_porosity, user_features.hair_porosity),
      hair_length = COALESCE(EXCLUDED.hair_length, user_features.hair_length),
      hair_texture_features = COALESCE(EXCLUDED.hair_texture_features, user_features.hair_texture_features),
      hair_confidence = COALESCE(EXCLUDED.hair_confidence, user_features.hair_confidence),
      analyzed_at = NOW(),
      updated_at = NOW()
  `;
}
