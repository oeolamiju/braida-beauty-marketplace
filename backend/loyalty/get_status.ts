import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import db from "../db";

interface LoyaltyTier {
  id: number;
  name: string;
  minPoints: number;
  discountPercent: number;
  benefits: string[];
  badgeColor: string;
}

interface LoyaltyStatus {
  currentPoints: number;
  totalPoints: number;
  currentTier: LoyaltyTier;
  nextTier: LoyaltyTier | null;
  pointsToNextTier: number;
  recentTransactions: LoyaltyTransaction[];
}

interface LoyaltyTransaction {
  id: number;
  points: number;
  type: string;
  description: string | null;
  createdAt: Date;
}

interface GetLoyaltyStatusResponse {
  status: LoyaltyStatus;
}

export const getLoyaltyStatus = api(
  { method: "GET", path: "/loyalty/status", expose: true, auth: true },
  async (): Promise<GetLoyaltyStatusResponse> => {
    const auth = getAuthData()! as AuthData;
    const userId = auth.userID;

    // Get or create user loyalty record
    let userLoyalty = await db.queryRow<{
      current_points: number;
      total_points: number;
      tier_id: number | null;
    }>`
      SELECT current_points, total_points, tier_id
      FROM user_loyalty
      WHERE user_id = ${userId}
    `;

    if (!userLoyalty) {
      // Create initial loyalty record
      await db.exec`
        INSERT INTO user_loyalty (user_id, tier_id)
        SELECT ${userId}, id FROM loyalty_tiers WHERE min_points = 0 LIMIT 1
      `;
      userLoyalty = {
        current_points: 0,
        total_points: 0,
        tier_id: null,
      };
    }

    // Get all tiers
    const tiers: LoyaltyTier[] = [];
    for await (const row of db.query<{
      id: number;
      name: string;
      min_points: number;
      discount_percent: number;
      benefits: string[];
      badge_color: string;
    }>`
      SELECT id, name, min_points, discount_percent, benefits, badge_color
      FROM loyalty_tiers
      ORDER BY min_points ASC
    `) {
      tiers.push({
        id: row.id,
        name: row.name,
        minPoints: row.min_points,
        discountPercent: row.discount_percent,
        benefits: row.benefits,
        badgeColor: row.badge_color,
      });
    }

    // Determine current tier based on total points
    let currentTier = tiers[0];
    let nextTier: LoyaltyTier | null = null;

    for (let i = 0; i < tiers.length; i++) {
      if (userLoyalty.total_points >= tiers[i].minPoints) {
        currentTier = tiers[i];
        nextTier = tiers[i + 1] || null;
      }
    }

    // Update tier if changed
    if (currentTier.id !== userLoyalty.tier_id) {
      await db.exec`
        UPDATE user_loyalty
        SET tier_id = ${currentTier.id}, tier_achieved_at = NOW(), updated_at = NOW()
        WHERE user_id = ${userId}
      `;
    }

    // Get recent transactions
    const transactions: LoyaltyTransaction[] = [];
    for await (const row of db.query<{
      id: number;
      points: number;
      type: string;
      description: string | null;
      created_at: Date;
    }>`
      SELECT id, points, type, description, created_at
      FROM loyalty_transactions
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 10
    `) {
      transactions.push({
        id: row.id,
        points: row.points,
        type: row.type,
        description: row.description,
        createdAt: row.created_at,
      });
    }

    const pointsToNextTier = nextTier ? nextTier.minPoints - userLoyalty.total_points : 0;

    return {
      status: {
        currentPoints: userLoyalty.current_points,
        totalPoints: userLoyalty.total_points,
        currentTier,
        nextTier,
        pointsToNextTier: Math.max(0, pointsToNextTier),
        recentTransactions: transactions,
      },
    };
  }
);

