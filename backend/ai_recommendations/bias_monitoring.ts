// =============================================================================
// BRAIDA AI - BIAS MONITORING & FAIRNESS AUDITING
// Ensures AI recommendations are fair across all skin tones, hair types, etc.
// =============================================================================

import db from "../db";
import {
  FairnessAuditResult,
  BiasMetrics,
  MonkScale,
  HairType,
  FaceShape,
} from "./types";

// =============================================================================
// BIAS AUDITOR CLASS
// =============================================================================

export class BiasAuditor {
  
  // Monk Scale groups for analysis
  private readonly SKIN_TONE_GROUPS = {
    light: [1, 2, 3] as MonkScale[],
    medium: [4, 5, 6] as MonkScale[],
    dark: [7, 8, 9, 10] as MonkScale[],
  };

  // Hair type groups
  private readonly HAIR_TYPE_GROUPS = {
    curly: ['3A', '3B', '3C'] as HairType[],
    coily: ['4A', '4B', '4C'] as HairType[],
  };

  /**
   * Run comprehensive fairness audit
   */
  async runComprehensiveAudit(): Promise<FairnessAuditResult> {
    const skinToneBias = await this.auditSkinToneBias();
    const hairTypeBias = await this.auditHairTypeBias();
    const intersectionalBias = await this.auditIntersectionalBias();

    // Calculate overall fairness score (0-1, higher is better)
    const overallFairness = 1 - (
      skinToneBias.skinToneDisparity * 0.4 +
      hairTypeBias.hairTypeDisparity * 0.4 +
      intersectionalBias.intersectionalDisparity * 0.2
    );

    const recommendations = this.generateMitigationRecommendations(
      skinToneBias,
      hairTypeBias,
      intersectionalBias
    );

    // Log audit results
    await this.logAuditResult({
      overallFairness,
      skinToneBias,
      hairTypeBias,
      intersectionalBias,
      recommendations,
    });

    return {
      overallFairness,
      skinToneBias,
      hairTypeBias,
      recommendations,
      auditedAt: new Date(),
    };
  }

  /**
   * Audit for skin tone bias in recommendations
   */
  async auditSkinToneBias(): Promise<BiasMetrics> {
    const groupPerformance: Record<string, number> = {};

    for (const [groupName, scales] of Object.entries(this.SKIN_TONE_GROUPS)) {
      // Get recommendation logs for users in this skin tone group
      const logs = await db.queryAll<{
        booked_item: string | null;
        style_recommendations: any;
      }>`
        SELECT rl.booked_item, rl.style_recommendations
        FROM recommendation_logs rl
        JOIN user_features uf ON rl.user_id = uf.user_id
        WHERE uf.monk_scale = ANY(${scales}::int[])
        AND rl.created_at > NOW() - INTERVAL '30 days'
      `;

      // Calculate conversion rate (recommendations that led to bookings)
      const totalLogs = logs.length;
      const bookedLogs = logs.filter(l => l.booked_item !== null).length;
      const conversionRate = totalLogs > 0 ? bookedLogs / totalLogs : 0;

      groupPerformance[groupName] = conversionRate;
    }

    // Calculate disparity
    const values = Object.values(groupPerformance);
    const maxPerf = Math.max(...values, 0.001);
    const minPerf = Math.min(...values, 0.001);
    const skinToneDisparity = maxPerf > 0 ? (maxPerf - minPerf) / maxPerf : 0;

    return {
      skinToneDisparity,
      hairTypeDisparity: 0,
      intersectionalDisparity: 0,
      groupPerformance,
      timestamp: new Date(),
    };
  }

  /**
   * Audit for hair type bias
   */
  async auditHairTypeBias(): Promise<BiasMetrics> {
    const groupPerformance: Record<string, number> = {};

    // Individual hair type analysis
    const hairTypes: HairType[] = ['3A', '3B', '3C', '4A', '4B', '4C'];

    for (const hairType of hairTypes) {
      const logs = await db.queryAll<{
        booked_item: string | null;
        style_recommendations: any;
      }>`
        SELECT rl.booked_item, rl.style_recommendations
        FROM recommendation_logs rl
        JOIN user_features uf ON rl.user_id = uf.user_id
        WHERE uf.hair_type = ${hairType}
        AND rl.created_at > NOW() - INTERVAL '30 days'
      `;

      const totalLogs = logs.length;
      const bookedLogs = logs.filter(l => l.booked_item !== null).length;
      const conversionRate = totalLogs > 0 ? bookedLogs / totalLogs : 0;

      groupPerformance[hairType] = conversionRate;
    }

    // Special check for 4C (historically underserved)
    const type4cPerf = groupPerformance['4C'] || 0;
    const avgPerf = Object.values(groupPerformance).reduce((a, b) => a + b, 0) / 
                    Object.values(groupPerformance).length;

    // Calculate disparity
    const values = Object.values(groupPerformance);
    const maxPerf = Math.max(...values, 0.001);
    const minPerf = Math.min(...values, 0.001);
    const hairTypeDisparity = maxPerf > 0 ? (maxPerf - minPerf) / maxPerf : 0;

    return {
      skinToneDisparity: 0,
      hairTypeDisparity,
      intersectionalDisparity: 0,
      groupPerformance,
      timestamp: new Date(),
    };
  }

  /**
   * Audit for intersectional bias (combinations of attributes)
   */
  async auditIntersectionalBias(): Promise<BiasMetrics> {
    const groupPerformance: Record<string, number> = {};

    // Key intersections to monitor
    const intersections = [
      { name: 'dark_coily', skinTones: [7, 8, 9, 10], hairTypes: ['4B', '4C'] },
      { name: 'light_curly', skinTones: [1, 2, 3], hairTypes: ['3A', '3B'] },
      { name: 'medium_mixed', skinTones: [4, 5, 6], hairTypes: ['3C', '4A'] },
    ];

    for (const intersection of intersections) {
      const logs = await db.queryAll<{
        booked_item: string | null;
      }>`
        SELECT rl.booked_item
        FROM recommendation_logs rl
        JOIN user_features uf ON rl.user_id = uf.user_id
        WHERE uf.monk_scale = ANY(${intersection.skinTones}::int[])
        AND uf.hair_type = ANY(${intersection.hairTypes}::text[])
        AND rl.created_at > NOW() - INTERVAL '30 days'
      `;

      const totalLogs = logs.length;
      const bookedLogs = logs.filter(l => l.booked_item !== null).length;
      const conversionRate = totalLogs > 0 ? bookedLogs / totalLogs : 0;

      groupPerformance[intersection.name] = conversionRate;
    }

    // Calculate disparity
    const values = Object.values(groupPerformance);
    const maxPerf = Math.max(...values, 0.001);
    const minPerf = Math.min(...values, 0.001);
    const intersectionalDisparity = maxPerf > 0 ? (maxPerf - minPerf) / maxPerf : 0;

    return {
      skinToneDisparity: 0,
      hairTypeDisparity: 0,
      intersectionalDisparity,
      groupPerformance,
      timestamp: new Date(),
    };
  }

  /**
   * Generate mitigation recommendations based on audit results
   */
  private generateMitigationRecommendations(
    skinToneBias: BiasMetrics,
    hairTypeBias: BiasMetrics,
    intersectionalBias: BiasMetrics
  ): string[] {
    const recommendations: string[] = [];

    // Skin tone recommendations
    if (skinToneBias.skinToneDisparity > 0.2) {
      const worstGroup = this.findWorstPerformingGroup(skinToneBias.groupPerformance);
      recommendations.push(
        `Skin tone bias detected (${(skinToneBias.skinToneDisparity * 100).toFixed(1)}% disparity). ` +
        `Consider adding more style options for ${worstGroup} skin tones.`
      );
    }

    // Hair type recommendations
    if (hairTypeBias.hairTypeDisparity > 0.2) {
      const worstGroup = this.findWorstPerformingGroup(hairTypeBias.groupPerformance);
      recommendations.push(
        `Hair type bias detected (${(hairTypeBias.hairTypeDisparity * 100).toFixed(1)}% disparity). ` +
        `Consider improving recommendations for ${worstGroup} hair type.`
      );
    }

    // 4C-specific check
    if (hairTypeBias.groupPerformance['4C'] !== undefined) {
      const type4cPerf = hairTypeBias.groupPerformance['4C'];
      const avgPerf = Object.values(hairTypeBias.groupPerformance).reduce((a, b) => a + b, 0) / 
                      Object.values(hairTypeBias.groupPerformance).length;
      
      if (type4cPerf < avgPerf * 0.8) {
        recommendations.push(
          `4C hair type is underperforming. Consider: ` +
          `1) Adding more 4C-friendly styles, ` +
          `2) Recruiting more stylists with 4C expertise, ` +
          `3) Improving 4C style compatibility scores.`
        );
      }
    }

    // Intersectional recommendations
    if (intersectionalBias.intersectionalDisparity > 0.25) {
      const worstGroup = this.findWorstPerformingGroup(intersectionalBias.groupPerformance);
      recommendations.push(
        `Intersectional bias detected for ${worstGroup}. ` +
        `Review style catalog and freelancer expertise for this demographic.`
      );
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push('Fairness metrics within acceptable ranges. Continue monitoring.');
    } else {
      recommendations.push(
        'Consider rebalancing training data and reviewing compatibility scores for affected groups.'
      );
    }

    return recommendations;
  }

  private findWorstPerformingGroup(groupPerformance: Record<string, number>): string {
    let worstGroup = '';
    let worstPerf = Infinity;

    for (const [group, perf] of Object.entries(groupPerformance)) {
      if (perf < worstPerf) {
        worstPerf = perf;
        worstGroup = group;
      }
    }

    return worstGroup;
  }

  /**
   * Log audit results to database
   */
  private async logAuditResult(result: {
    overallFairness: number;
    skinToneBias: BiasMetrics;
    hairTypeBias: BiasMetrics;
    intersectionalBias: BiasMetrics;
    recommendations: string[];
  }): Promise<void> {
    await db.exec`
      INSERT INTO bias_audit_logs (
        audit_type,
        overall_fairness_score,
        skin_tone_disparity,
        hair_type_disparity,
        intersectional_disparity,
        group_performance,
        detailed_metrics,
        mitigation_recommendations,
        total_samples,
        samples_by_group
      ) VALUES (
        'comprehensive',
        ${result.overallFairness},
        ${result.skinToneBias.skinToneDisparity},
        ${result.hairTypeBias.hairTypeDisparity},
        ${result.intersectionalBias.intersectionalDisparity},
        ${JSON.stringify({
          skinTone: result.skinToneBias.groupPerformance,
          hairType: result.hairTypeBias.groupPerformance,
          intersectional: result.intersectionalBias.groupPerformance,
        })},
        ${JSON.stringify({
          skinTone: result.skinToneBias,
          hairType: result.hairTypeBias,
          intersectional: result.intersectionalBias,
        })},
        ${result.recommendations},
        ${0},
        ${JSON.stringify({})}
      )
    `;
  }

  /**
   * Get historical bias trends
   */
  async getBiasTrends(days: number = 30): Promise<Array<{
    date: Date;
    overallFairness: number;
    skinToneDisparity: number;
    hairTypeDisparity: number;
  }>> {
    const results = await db.queryAll<{
      created_at: Date;
      overall_fairness_score: number;
      skin_tone_disparity: number;
      hair_type_disparity: number;
    }>`
      SELECT 
        created_at,
        overall_fairness_score,
        skin_tone_disparity,
        hair_type_disparity
      FROM bias_audit_logs
      WHERE created_at > NOW() - INTERVAL '${days} days'
      ORDER BY created_at ASC
    `;

    return results.map(r => ({
      date: r.created_at,
      overallFairness: r.overall_fairness_score,
      skinToneDisparity: r.skin_tone_disparity,
      hairTypeDisparity: r.hair_type_disparity,
    }));
  }
}

// =============================================================================
// BIAS MITIGATION UTILITIES
// =============================================================================

export class BiasMitigator {
  
  /**
   * Apply post-processing adjustment to recommendations
   * Boosts underrepresented groups
   */
  static adjustForFairness<T extends { score: number; style?: { suitableSkinTones?: number[]; suitableHairTypes?: string[] } }>(
    recommendations: T[],
    userSkinTone?: number,
    userHairType?: string
  ): T[] {
    // If user is from historically underserved group, boost relevant styles
    const isUnderservedSkinTone = userSkinTone && userSkinTone >= 7;
    const isUnderservedHairType = userHairType && ['4B', '4C'].includes(userHairType);

    if (!isUnderservedSkinTone && !isUnderservedHairType) {
      return recommendations;
    }

    return recommendations.map(rec => {
      let boost = 0;

      // Boost styles that specifically serve the user's demographic
      if (rec.style?.suitableSkinTones) {
        const servesUserSkinTone = userSkinTone && 
          rec.style.suitableSkinTones.includes(userSkinTone);
        if (servesUserSkinTone && isUnderservedSkinTone) {
          boost += 0.1; // 10% boost
        }
      }

      if (rec.style?.suitableHairTypes) {
        const servesUserHairType = userHairType && 
          rec.style.suitableHairTypes.includes(userHairType);
        if (servesUserHairType && isUnderservedHairType) {
          boost += 0.1; // 10% boost
        }
      }

      return {
        ...rec,
        score: Math.min(1, rec.score * (1 + boost)),
      };
    }).sort((a, b) => b.score - a.score);
  }

  /**
   * Check if training data is balanced
   */
  static async checkDataBalance(): Promise<{
    isBalanced: boolean;
    skinToneDistribution: Record<string, number>;
    hairTypeDistribution: Record<string, number>;
    recommendations: string[];
  }> {
    // Get skin tone distribution
    const skinToneResult = await db.queryAll<{ monk_scale: number; count: number }>`
      SELECT monk_scale, COUNT(*) as count
      FROM user_features
      WHERE monk_scale IS NOT NULL
      GROUP BY monk_scale
      ORDER BY monk_scale
    `;

    // Get hair type distribution
    const hairTypeResult = await db.queryAll<{ hair_type: string; count: number }>`
      SELECT hair_type, COUNT(*) as count
      FROM user_features
      WHERE hair_type IS NOT NULL
      GROUP BY hair_type
      ORDER BY hair_type
    `;

    const skinToneDistribution: Record<string, number> = {};
    for (const row of skinToneResult) {
      skinToneDistribution[row.monk_scale.toString()] = row.count;
    }

    const hairTypeDistribution: Record<string, number> = {};
    for (const row of hairTypeResult) {
      hairTypeDistribution[row.hair_type] = row.count;
    }

    const recommendations: string[] = [];
    let isBalanced = true;

    // Check skin tone balance
    const skinToneCounts = Object.values(skinToneDistribution);
    if (skinToneCounts.length > 0) {
      const maxCount = Math.max(...skinToneCounts);
      const minCount = Math.min(...skinToneCounts);
      
      if (maxCount > minCount * 3) {
        isBalanced = false;
        recommendations.push(
          'Skin tone distribution is imbalanced. Consider collecting more data from underrepresented groups.'
        );
      }
    }

    // Check hair type balance
    const hairTypeCounts = Object.values(hairTypeDistribution);
    if (hairTypeCounts.length > 0) {
      const maxCount = Math.max(...hairTypeCounts);
      const minCount = Math.min(...hairTypeCounts);
      
      if (maxCount > minCount * 3) {
        isBalanced = false;
        recommendations.push(
          'Hair type distribution is imbalanced. Consider collecting more data from underrepresented groups.'
        );
      }
    }

    // Check 4C specifically
    const type4cCount = hairTypeDistribution['4C'] || 0;
    const totalHairCount = hairTypeCounts.reduce((a, b) => a + b, 0);
    if (totalHairCount > 0 && type4cCount < totalHairCount * 0.1) {
      isBalanced = false;
      recommendations.push(
        '4C hair type is underrepresented (<10% of data). Prioritize collecting 4C user data.'
      );
    }

    return {
      isBalanced,
      skinToneDistribution,
      hairTypeDistribution,
      recommendations,
    };
  }
}

// Export singleton instance
export const biasAuditor = new BiasAuditor();
