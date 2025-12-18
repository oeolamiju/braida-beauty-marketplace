export type PayoutAccountStatus = "pending" | "active" | "restricted" | "suspended";
export type PayoutStatus = "pending" | "scheduled" | "processing" | "paid" | "failed" | "cancelled" | "overridden";
export type PayoutScheduleType = "per_transaction" | "weekly" | "bi_weekly";

export interface PayoutAccount {
  id: number;
  freelancerId: number;
  stripeAccountId: string;
  accountStatus: PayoutAccountStatus;
  onboardingCompleted: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirementsDue?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payout {
  id: number;
  freelancerId: number;
  bookingId: number;
  stripePayoutId?: string;
  amount: number;
  serviceAmount: number;
  commissionAmount: number;
  bookingFee: number;
  status: PayoutStatus;
  scheduledDate?: Date;
  processedDate?: Date;
  errorMessage?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PayoutSettings {
  id: number;
  platformCommissionPercent: number;
  bookingFeeFixed: number;
  autoConfirmationTimeoutHours: number;
  defaultPayoutSchedule: PayoutScheduleType;
  createdAt: Date;
  updatedAt: Date;
}

export interface EarningsStats {
  totalEarned: number;
  pendingInEscrow: number;
  nextPayoutAmount: number;
  nextPayoutDate?: Date;
  availableBalance: number;
}

export interface PayoutHistory {
  payouts: Payout[];
  total: number;
}

export interface PayoutAuditLog {
  id: number;
  payoutId: number;
  actorId?: number;
  action: string;
  oldStatus?: PayoutStatus;
  newStatus?: PayoutStatus;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}
