export type EscrowStatus = 'held' | 'released' | 'refunded' | 'disputed';
export type PaymentStatus = 'initiated' | 'pending' | 'succeeded' | 'failed' | 'refunded';
export type BookingPaymentStatus = 'unpaid' | 'payment_pending' | 'payment_failed' | 'paid' | 'refunded' | 'partially_refunded';

export interface Payment {
  id: number;
  bookingId: number;
  provider: string;
  providerPaymentId: string | null;
  stripePaymentIntentId: string | null;
  stripeChargeId: string | null;
  status: PaymentStatus;
  escrowStatus: EscrowStatus;
  amountPence: number;
  currency: string;
  platformFeePence: number;
  freelancerPayoutPence: number | null;
  refundId: string | null;
  refundStatus: string | null;
  refundAmountPence: number | null;
  metadata: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
  escrowReleasedAt: Date | null;
  refundedAt: Date | null;
}

export interface PriceBreakdown {
  basePricePence: number;
  materialsPricePence: number;
  travelPricePence: number;
  platformFeePence: number;
  totalPence: number;
}
