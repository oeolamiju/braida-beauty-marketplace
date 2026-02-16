// =============================================================================
// BRAIDA AI - RECOMMENDATION ENGINE
// Hybrid recommendation system combining content-based, collaborative,
// and knowledge-based approaches
// =============================================================================

import db from "../db";
import {
  UserFeatures,
  StyleDefinition,
  StyleRecommendation,
  FreelancerRecommendation,
  RecommendationContext,
  RecommendationResponse,
  FaceShape,
  HairType,
  MonkScale,
  SkinUndertone,
  ServiceCategory,
  StyleCompatibility,
} from "./types";

// =============================================================================
// CONTENT-BASED RECOMMENDER
// =============================================================================

/**
 * Content-based filtering: Recommends based on user's physical attributes
 * matching to style compatibility scores
 */
export class ContentBasedRecommender {
  
  /**
   * Get style recommendations based on user features
   */
  async recommendStyles(
    userFeatures: UserFeatures,
    category: ServiceCategory,
    context?: RecommendationContext
  ): Promise<StyleRecommendation[]> {
    
    // Get all active styles in category
    const styles = await this.getStylesWithCompatibility(category);
    
    const recommendations: StyleRecommendation[] = [];
    
    for (const style of styles) {
      const matchFactors = this.calculateMatchFactors(userFeatures, style, context);
      const score = this.calculateOverallScore(matchFactors);
      const reasons = this.generateReasons(userFeatures, style, matchFactors);
      
      recommendations.push({
        style: style.definition,
        score,
        reasons,
        matchFactors,
      });
    }
    
    // Sort by score descending
    recommendations.sort((a, b) => b.score - a.score);
    
    return recommendations;
  }

  private async getStylesWithCompatibility(category: ServiceCategory): Promise<Array<{
    definition: StyleDefinition;
    compatibility: StyleCompatibility;
  }>> {
    const result = await db.queryAll<{
      id: string;
      name: string;
      category: string;
      description: string;
      image_urls: string[];
      suitable_face_shapes: string[];
      suitable_hair_types: string[];
      suitable_skin_tones: number[];
      maintenance_level: string;
      duration_weeks: number;
      occasions: string[];
      price_range_min: number;
      price_range_max: number;
      tags: string[];
      face_shape_oval: number;
      face_shape_round: number;
      face_shape_square: number;
      face_shape_heart: number;
      face_shape_oblong: number;
      face_shape_diamond: number;
      hair_type_3a: number;
      hair_type_3b: number;
      hair_type_3c: number;
      hair_type_4a: number;
      hair_type_4b: number;
      hair_type_4c: number;
      undertone_warm: number;
      undertone_cool: number;
      undertone_neutral: number;
      monk_scale_scores: Record<string, number>;
    }>`
      SELECT 
        sd.*,
        COALESCE(scs.face_shape_oval, 0.5) as face_shape_oval,
        COALESCE(scs.face_shape_round, 0.5) as face_shape_round,
        COALESCE(scs.face_shape_square, 0.5) as face_shape_square,
        COALESCE(scs.face_shape_heart, 0.5) as face_shape_heart,
        COALESCE(scs.face_shape_oblong, 0.5) as face_shape_oblong,
        COALESCE(scs.face_shape_diamond, 0.5) as face_shape_diamond,
        COALESCE(scs.hair_type_3a, 0.5) as hair_type_3a,
        COALESCE(scs.hair_type_3b, 0.5) as hair_type_3b,
        COALESCE(scs.hair_type_3c, 0.5) as hair_type_3c,
        COALESCE(scs.hair_type_4a, 0.5) as hair_type_4a,
        COALESCE(scs.hair_type_4b, 0.5) as hair_type_4b,
        COALESCE(scs.hair_type_4c, 0.5) as hair_type_4c,
        COALESCE(scs.undertone_warm, 0.5) as undertone_warm,
        COALESCE(scs.undertone_cool, 0.5) as undertone_cool,
        COALESCE(scs.undertone_neutral, 0.5) as undertone_neutral,
        COALESCE(scs.monk_scale_scores, '{}') as monk_scale_scores
      FROM style_definitions sd
      LEFT JOIN style_compatibility_scores scs ON sd.id = scs.style_id
      WHERE sd.category = ${category} AND sd.is_active = true
    `;

    return result.map(row => ({
      definition: {
        id: row.id,
        name: row.name,
        category: row.category as ServiceCategory,
        description: row.description || '',
        imageUrls: row.image_urls || [],
        suitableFaceShapes: (row.suitable_face_shapes || []) as FaceShape[],
        suitableHairTypes: (row.suitable_hair_types || []) as HairType[],
        suitableSkinTones: (row.suitable_skin_tones || []) as MonkScale[],
        maintenanceLevel: (row.maintenance_level || 'medium') as 'low' | 'medium' | 'high',
        durationWeeks: row.duration_weeks,
        occasions: row.occasions || [],
        priceRange: { min: row.price_range_min || 0, max: row.price_range_max || 0 },
        tags: row.tags || [],
      },
      compatibility: {
        styleId: row.id,
        faceShapeScores: {
          oval: row.face_shape_oval,
          round: row.face_shape_round,
          square: row.face_shape_square,
          heart: row.face_shape_heart,
          oblong: row.face_shape_oblong,
          diamond: row.face_shape_diamond,
        },
        hairTypeScores: {
          '1A': 0.3, '1B': 0.3, '1C': 0.3,
          '2A': 0.4, '2B': 0.4, '2C': 0.4,
          '3A': row.hair_type_3a,
          '3B': row.hair_type_3b,
          '3C': row.hair_type_3c,
          '4A': row.hair_type_4a,
          '4B': row.hair_type_4b,
          '4C': row.hair_type_4c,
        } as Record<HairType, number>,
        skinToneScores: {
          1: 0.5, 2: 0.5, 3: 0.5, 4: 0.5, 5: 0.5,
          6: 0.5, 7: 0.5, 8: 0.5, 9: 0.5, 10: 0.5,
          ...(row.monk_scale_scores || {})
        } as Record<MonkScale, number>,
        occasionScores: {},
      },
    }));
  }

  private calculateMatchFactors(
    userFeatures: UserFeatures,
    style: { definition: StyleDefinition; compatibility: StyleCompatibility },
    context?: RecommendationContext
  ): StyleRecommendation['matchFactors'] {
    
    // Face shape match
    let faceShapeMatch = 0.5;
    if (userFeatures.faceShape?.shape) {
      faceShapeMatch = style.compatibility.faceShapeScores[userFeatures.faceShape.shape] || 0.5;
    }

    // Skin tone match
    let skinToneMatch = 0.5;
    if (userFeatures.skinTone?.monkScale) {
      skinToneMatch = style.compatibility.skinToneScores[userFeatures.skinTone.monkScale] || 0.5;
    }

    // Hair type match
    let hairTypeMatch = 0.5;
    if (userFeatures.hairAnalysis?.hairType) {
      hairTypeMatch = style.compatibility.hairTypeScores[userFeatures.hairAnalysis.hairType] || 0.5;
    }

    // Preference match
    let preferenceMatch = 0.5;
    if (userFeatures.preferences) {
      if (userFeatures.preferences.maintenanceLevel === style.definition.maintenanceLevel) {
        preferenceMatch += 0.2;
      }
      if (context?.occasion && style.definition.occasions.includes(context.occasion)) {
        preferenceMatch += 0.2;
      }
      if (context?.budget) {
        const priceInBudget = 
          style.definition.priceRange.min <= context.budget.max &&
          style.definition.priceRange.max >= context.budget.min;
        if (priceInBudget) {
          preferenceMatch += 0.1;
        }
      }
    }

    const popularityScore = 0.5;

    return {
      faceShapeMatch,
      skinToneMatch,
      hairTypeMatch,
      preferenceMatch: Math.min(1, preferenceMatch),
      popularityScore,
    };
  }

  private calculateOverallScore(matchFactors: StyleRecommendation['matchFactors']): number {
    const weights = {
      faceShape: 0.25,
      skinTone: 0.2,
      hairType: 0.25,
      preference: 0.2,
      popularity: 0.1,
    };

    return (
      matchFactors.faceShapeMatch * weights.faceShape +
      matchFactors.skinToneMatch * weights.skinTone +
      matchFactors.hairTypeMatch * weights.hairType +
      matchFactors.preferenceMatch * weights.preference +
      matchFactors.popularityScore * weights.popularity
    );
  }

  private generateReasons(
    userFeatures: UserFeatures,
    style: { definition: StyleDefinition; compatibility: StyleCompatibility },
    matchFactors: StyleRecommendation['matchFactors']
  ): string[] {
    const reasons: string[] = [];

    if (matchFactors.faceShapeMatch > 0.7 && userFeatures.faceShape?.shape) {
      reasons.push(`Flatters your ${userFeatures.faceShape.shape} face shape`);
    }

    if (matchFactors.hairTypeMatch > 0.7 && userFeatures.hairAnalysis?.hairType) {
      reasons.push(`Works beautifully with ${userFeatures.hairAnalysis.hairType} hair`);
    }

    if (matchFactors.skinToneMatch > 0.7) {
      reasons.push(`Complements your skin tone`);
    }

    if (style.definition.maintenanceLevel === 'low') {
      reasons.push('Low maintenance style');
    }

    if (style.definition.durationWeeks && style.definition.durationWeeks >= 6) {
      reasons.push('Long-lasting protective style');
    }

    if (reasons.length === 0) {
      reasons.push('Popular style in your area');
    }

    return reasons;
  }
}

// =============================================================================
// COLLABORATIVE FILTERING RECOMMENDER
// =============================================================================

export class CollaborativeRecommender {
  
  async findSimilarUsers(userId: string, userFeatures: UserFeatures, limit: number = 50): Promise<Array<{
    userId: string;
    similarity: number;
  }>> {
    const allUsers = await db.queryAll<{
      user_id: string;
      face_shape: string;
      monk_scale: number;
      skin_undertone: string;
      hair_type: string;
    }>`
      SELECT user_id, face_shape, monk_scale, skin_undertone, hair_type
      FROM user_features
      WHERE user_id != ${userId}
      AND analyzed_at IS NOT NULL
    `;

    const similarities: Array<{ userId: string; similarity: number }> = [];

    for (const other of allUsers) {
      const similarity = this.calculateUserSimilarity(userFeatures, {
        faceShape: other.face_shape as FaceShape,
        monkScale: other.monk_scale as MonkScale,
        undertone: other.skin_undertone as SkinUndertone,
        hairType: other.hair_type as HairType,
      });

      similarities.push({ userId: other.user_id, similarity });
    }

    similarities.sort((a, b) => b.similarity - a.similarity);
    return similarities.slice(0, limit);
  }

  private calculateUserSimilarity(
    user: UserFeatures,
    other: {
      faceShape?: FaceShape;
      monkScale?: MonkScale;
      undertone?: SkinUndertone;
      hairType?: HairType;
    }
  ): number {
    let similarity = 0;
    let factors = 0;

    if (user.faceShape?.shape && other.faceShape) {
      factors++;
      if (user.faceShape.shape === other.faceShape) {
        similarity += 1;
      } else if (this.areSimilarFaceShapes(user.faceShape.shape, other.faceShape)) {
        similarity += 0.5;
      }
    }

    if (user.skinTone?.monkScale && other.monkScale) {
      factors++;
      const distance = Math.abs(user.skinTone.monkScale - other.monkScale);
      similarity += 1 - (distance / 9);
    }

    if (user.skinTone?.undertone && other.undertone) {
      factors++;
      if (user.skinTone.undertone === other.undertone) {
        similarity += 1;
      } else if (user.skinTone.undertone === 'neutral' || other.undertone === 'neutral') {
        similarity += 0.5;
      }
    }

    if (user.hairAnalysis?.hairType && other.hairType) {
      factors++;
      similarity += this.calculateHairTypeSimilarity(user.hairAnalysis.hairType, other.hairType);
    }

    return factors > 0 ? similarity / factors : 0;
  }

  private areSimilarFaceShapes(shape1: FaceShape, shape2: FaceShape): boolean {
    const similarGroups = [
      ['oval', 'oblong'],
      ['round', 'square'],
      ['heart', 'diamond'],
    ];
    return similarGroups.some(group => group.includes(shape1) && group.includes(shape2));
  }

  private calculateHairTypeSimilarity(type1: HairType, type2: HairType): number {
    const main1 = type1[0];
    const main2 = type2[0];
    const sub1 = type1[1];
    const sub2 = type2[1];

    if (type1 === type2) return 1;
    if (main1 === main2) {
      const subDiff = Math.abs(sub1.charCodeAt(0) - sub2.charCodeAt(0));
      return 1 - (subDiff * 0.15);
    }
    return 0.3;
  }

  async getRecommendationsFromSimilarUsers(
    similarUsers: Array<{ userId: string; similarity: number }>,
    category: ServiceCategory
  ): Promise<Map<string, number>> {
    const userIds = similarUsers.map(u => u.userId);
    
    const bookings = await db.queryAll<{
      style_id: string;
      user_id: string;
      rating: number;
    }>`
      SELECT 
        usi.style_id,
        usi.user_id,
        usi.rating
      FROM user_style_interactions usi
      JOIN style_definitions sd ON usi.style_id = sd.id
      WHERE usi.user_id = ANY(${userIds}::text[])
      AND usi.booked = true
      AND sd.category = ${category}
    `;

    const styleScores = new Map<string, number>();
    const similarityMap = new Map(similarUsers.map(u => [u.userId, u.similarity]));

    for (const booking of bookings) {
      const similarity = similarityMap.get(booking.user_id) || 0;
      const rating = booking.rating || 4;
      const score = similarity * (rating / 5);

      const currentScore = styleScores.get(booking.style_id) || 0;
      styleScores.set(booking.style_id, currentScore + score);
    }

    return styleScores;
  }
}

// =============================================================================
// FREELANCER RECOMMENDER
// =============================================================================

export class FreelancerRecommender {
  
  async recommendFreelancers(
    userFeatures: UserFeatures,
    category: ServiceCategory,
    context?: RecommendationContext,
    limit: number = 20
  ): Promise<FreelancerRecommendation[]> {
    
    const freelancers = await this.getFreelancersWithCapabilities(category, context?.location);
    
    const recommendations: FreelancerRecommendation[] = [];

    for (const freelancer of freelancers) {
      const matchFactors = this.calculateFreelancerMatchFactors(userFeatures, freelancer, context);
      const score = this.calculateFreelancerScore(matchFactors);
      const reasons = this.generateFreelancerReasons(userFeatures, freelancer, matchFactors);

      recommendations.push({
        freelancerId: freelancer.id,
        freelancerName: freelancer.name,
        score,
        reasons,
        matchFactors,
        specializations: freelancer.expertiseStyles,
        averageRating: freelancer.averageRating,
        completedBookings: freelancer.completedBookings,
        portfolioUrls: freelancer.portfolioUrls,
      });
    }

    recommendations.sort((a, b) => b.score - a.score);
    return recommendations.slice(0, limit);
  }

  private async getFreelancersWithCapabilities(
    category: ServiceCategory,
    location?: { lat: number; lng: number; radius: number }
  ): Promise<Array<{
    id: string;
    name: string;
    expertiseStyles: string[];
    hairTypeExpertise: HairType[];
    skinToneExperience: MonkScale[];
    averageRating: number;
    completedBookings: number;
    portfolioUrls: string[];
    lat?: number;
    lng?: number;
  }>> {
    const result = await db.queryAll<{
      id: string;
      first_name: string;
      last_name: string;
      expertise_styles: string[];
      hair_type_expertise: string[];
      skin_tone_experience: number[];
      average_rating: number;
      completed_bookings: number;
      portfolio_urls: string[];
    }>`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        COALESCE(fc.expertise_styles, '{}') as expertise_styles,
        COALESCE(fc.hair_type_expertise, '{}') as hair_type_expertise,
        COALESCE(fc.skin_tone_experience, '{}') as skin_tone_experience,
        COALESCE((SELECT AVG(r.rating) FROM reviews r WHERE r.freelancer_id = u.id), 0) as average_rating,
        COALESCE((SELECT COUNT(*) FROM bookings b WHERE b.stylist_id = u.id AND b.status = 'completed'), 0) as completed_bookings,
        COALESCE(
          ARRAY(
            SELECT image_url 
            FROM freelancer_portfolio 
            WHERE freelancer_id = u.id 
            ORDER BY display_order 
            LIMIT 5
          ), 
          '{}'
        ) as portfolio_urls
      FROM users u
      JOIN freelancer_profiles fp ON u.id = fp.user_id
      LEFT JOIN freelancer_capabilities fc ON u.id = fc.freelancer_id
      WHERE fp.verification_status = 'verified'
    `;

    return result.map(row => ({
      id: row.id,
      name: `${row.first_name} ${row.last_name}`,
      expertiseStyles: row.expertise_styles || [],
      hairTypeExpertise: (row.hair_type_expertise || []) as HairType[],
      skinToneExperience: (row.skin_tone_experience || []) as MonkScale[],
      averageRating: Number(row.average_rating) || 0,
      completedBookings: Number(row.completed_bookings) || 0,
      portfolioUrls: row.portfolio_urls || [],
    }));
  }

  private calculateFreelancerMatchFactors(
    userFeatures: UserFeatures,
    freelancer: {
      id: string;
      hairTypeExpertise: HairType[];
      skinToneExperience: MonkScale[];
      averageRating: number;
    },
    context?: RecommendationContext
  ): FreelancerRecommendation['matchFactors'] {
    
    let expertiseMatch = 0.5;
    if (userFeatures.hairAnalysis?.hairType) {
      if (freelancer.hairTypeExpertise.includes(userFeatures.hairAnalysis.hairType)) {
        expertiseMatch = 0.9;
      } else if (freelancer.hairTypeExpertise.length > 0) {
        const userMainType = userFeatures.hairAnalysis.hairType[0];
        const hasMainType = freelancer.hairTypeExpertise.some(t => t[0] === userMainType);
        expertiseMatch = hasMainType ? 0.7 : 0.4;
      }
    }

    const styleMatch = 0.5;
    const ratingScore = freelancer.averageRating / 5;
    const locationScore = 0.5;
    const priceMatch = 0.5;

    return {
      expertiseMatch,
      styleMatch,
      ratingScore,
      locationScore,
      priceMatch,
    };
  }

  private calculateFreelancerScore(matchFactors: FreelancerRecommendation['matchFactors']): number {
    const weights = {
      expertise: 0.3,
      style: 0.2,
      rating: 0.25,
      location: 0.15,
      price: 0.1,
    };

    return (
      matchFactors.expertiseMatch * weights.expertise +
      matchFactors.styleMatch * weights.style +
      matchFactors.ratingScore * weights.rating +
      matchFactors.locationScore * weights.location +
      matchFactors.priceMatch * weights.price
    );
  }

  private generateFreelancerReasons(
    userFeatures: UserFeatures,
    freelancer: { hairTypeExpertise: HairType[]; averageRating: number },
    matchFactors: FreelancerRecommendation['matchFactors']
  ): string[] {
    const reasons: string[] = [];

    if (matchFactors.expertiseMatch > 0.8 && userFeatures.hairAnalysis?.hairType) {
      reasons.push(`Experienced with ${userFeatures.hairAnalysis.hairType} hair`);
    }

    if (freelancer.averageRating >= 4.5) {
      reasons.push('Highly rated by clients');
    }

    if (matchFactors.locationScore > 0.7) {
      reasons.push('Conveniently located');
    }

    if (reasons.length === 0) {
      reasons.push('Verified professional');
    }

    return reasons;
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

// =============================================================================
// HYBRID RECOMMENDATION ENGINE
// =============================================================================

export class HybridRecommendationEngine {
  private contentRecommender: ContentBasedRecommender;
  private collaborativeRecommender: CollaborativeRecommender;
  private freelancerRecommender: FreelancerRecommender;

  constructor() {
    this.contentRecommender = new ContentBasedRecommender();
    this.collaborativeRecommender = new CollaborativeRecommender();
    this.freelancerRecommender = new FreelancerRecommender();
  }

  async getRecommendations(
    userId: string,
    userFeatures: UserFeatures,
    category: ServiceCategory,
    context?: RecommendationContext,
    options?: {
      styleLimit?: number;
      freelancerLimit?: number;
    }
  ): Promise<RecommendationResponse> {
    
    const contentStyles = await this.contentRecommender.recommendStyles(
      userFeatures,
      category,
      context
    );

    let collaborativeScores = new Map<string, number>();
    try {
      const similarUsers = await this.collaborativeRecommender.findSimilarUsers(
        userId,
        userFeatures
      );
      if (similarUsers.length > 0) {
        collaborativeScores = await this.collaborativeRecommender.getRecommendationsFromSimilarUsers(
          similarUsers,
          category
        );
      }
    } catch (error) {
      console.warn('Collaborative filtering unavailable:', error);
    }

    const hybridStyles = this.combineStyleRecommendations(contentStyles, collaborativeScores);

    const freelancers = await this.freelancerRecommender.recommendFreelancers(
      userFeatures,
      category,
      context,
      options?.freelancerLimit || 20
    );

    await this.logRecommendation(userId, category, context, hybridStyles, freelancers, userFeatures);

    return {
      styles: hybridStyles.slice(0, options?.styleLimit || 20),
      freelancers,
      generatedAt: new Date(),
      userFeatures: {
        faceShape: userFeatures.faceShape,
        skinTone: userFeatures.skinTone,
        hairAnalysis: userFeatures.hairAnalysis,
      },
      context: context || {},
    };
  }

  private combineStyleRecommendations(
    contentStyles: StyleRecommendation[],
    collaborativeScores: Map<string, number>
  ): StyleRecommendation[] {
    const contentWeight = 0.7;
    const collaborativeWeight = 0.3;

    const maxCollabScore = Math.max(...collaborativeScores.values(), 1);

    return contentStyles.map(rec => {
      const collabScore = (collaborativeScores.get(rec.style.id) || 0) / maxCollabScore;
      const combinedScore = rec.score * contentWeight + collabScore * collaborativeWeight;

      return { ...rec, score: combinedScore };
    }).sort((a, b) => b.score - a.score);
  }

  private async logRecommendation(
    userId: string,
    category: ServiceCategory,
    context: RecommendationContext | undefined,
    styles: StyleRecommendation[],
    freelancers: FreelancerRecommendation[],
    userFeatures: UserFeatures
  ): Promise<void> {
    try {
      await db.exec`
        INSERT INTO recommendation_logs (
          user_id, category, context, user_features_snapshot,
          style_recommendations, freelancer_recommendations, generation_time_ms
        ) VALUES (
          ${userId}, ${category}, ${JSON.stringify(context || {})},
          ${JSON.stringify({
            faceShape: userFeatures.faceShape?.shape,
            monkScale: userFeatures.skinTone?.monkScale,
            undertone: userFeatures.skinTone?.undertone,
            hairType: userFeatures.hairAnalysis?.hairType,
          })},
          ${JSON.stringify(styles.slice(0, 10).map(s => ({ styleId: s.style.id, score: s.score })))},
          ${JSON.stringify(freelancers.slice(0, 10).map(f => ({ freelancerId: f.freelancerId, score: f.score })))},
          ${Date.now()}
        )
      `;
    } catch (error) {
      console.error('Failed to log recommendation:', error);
    }
  }
}

export const recommendationEngine = new HybridRecommendationEngine();
