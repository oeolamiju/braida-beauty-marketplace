import db from "../db";

interface AwardPointsParams {
  userId: string;
  points: number;
  type: "earned_booking" | "earned_review" | "earned_referral" | "bonus";
  description?: string;
  bookingId?: number;
}

// Points configuration
const POINTS_PER_POUND = 1; // 1 point per £1 spent
const REVIEW_BONUS = 10;
const REFERRAL_BONUS = 50;

export async function awardPoints(params: AwardPointsParams): Promise<void> {
  const { userId, points, type, description, bookingId } = params;

  // Create transaction record
  await db.exec`
    INSERT INTO loyalty_transactions (user_id, points, type, description, booking_id)
    VALUES (${userId}, ${points}, ${type}, ${description || null}, ${bookingId || null})
  `;

  // Update user loyalty
  await db.exec`
    INSERT INTO user_loyalty (user_id, current_points, total_points)
    VALUES (${userId}, ${points}, ${points})
    ON CONFLICT (user_id) DO UPDATE SET
      current_points = user_loyalty.current_points + ${points},
      total_points = user_loyalty.total_points + ${points},
      updated_at = NOW()
  `;
}

// Award points for completed booking
export async function awardBookingPoints(userId: string, bookingAmount: number, bookingId: number): Promise<void> {
  const points = Math.floor(bookingAmount * POINTS_PER_POUND);
  if (points > 0) {
    await awardPoints({
      userId,
      points,
      type: "earned_booking",
      description: `Points for £${bookingAmount.toFixed(2)} booking`,
      bookingId,
    });
  }
}

// Award points for leaving a review
export async function awardReviewPoints(userId: string, bookingId: number): Promise<void> {
  await awardPoints({
    userId,
    points: REVIEW_BONUS,
    type: "earned_review",
    description: "Bonus for leaving a review",
    bookingId,
  });
}

// Award points for successful referral
export async function awardReferralPoints(userId: string): Promise<void> {
  await awardPoints({
    userId,
    points: REFERRAL_BONUS,
    type: "earned_referral",
    description: "Bonus for successful referral",
  });
}

