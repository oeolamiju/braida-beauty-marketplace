export interface PriceBreakdown {
  basePrice: number;
  platformFee: number;
  processingFee: number;
  discount: number;
  total: number;
  freelancerEarnings: number;
}

export interface PricingConfig {
  platformFeePercentage: number;
  processingFeePercentage: number;
  minimumPlatformFee: number;
  minimumProcessingFee: number;
}

const DEFAULT_CONFIG: PricingConfig = {
  platformFeePercentage: 0.15,
  processingFeePercentage: 0.029,
  minimumPlatformFee: 1.0,
  minimumProcessingFee: 0.3,
};

export function calculateBookingPrice(
  basePrice: number,
  discountAmount: number = 0,
  config: Partial<PricingConfig> = {}
): PriceBreakdown {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  const discountedPrice = Math.max(0, basePrice - discountAmount);
  
  const platformFee = Math.max(
    finalConfig.minimumPlatformFee,
    discountedPrice * finalConfig.platformFeePercentage
  );
  
  const processingFee = Math.max(
    finalConfig.minimumProcessingFee,
    discountedPrice * finalConfig.processingFeePercentage
  );
  
  const total = discountedPrice + platformFee + processingFee;
  
  const freelancerEarnings = discountedPrice - platformFee;
  
  return {
    basePrice,
    platformFee: Math.round(platformFee * 100) / 100,
    processingFee: Math.round(processingFee * 100) / 100,
    discount: discountAmount,
    total: Math.round(total * 100) / 100,
    freelancerEarnings: Math.round(freelancerEarnings * 100) / 100,
  };
}

export function calculatePackagePrice(
  services: Array<{ price: number }>,
  discountAmount: number = 0,
  config: Partial<PricingConfig> = {}
): PriceBreakdown {
  const totalBasePrice = services.reduce((sum, service) => sum + service.price, 0);
  return calculateBookingPrice(totalBasePrice, discountAmount, config);
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function calculateRefundAmount(
  totalPaid: number,
  cancellationPolicy: {
    hoursBeforeBooking: number;
    refundPercentage: number;
  },
  hoursUntilBooking: number
): number {
  if (hoursUntilBooking >= cancellationPolicy.hoursBeforeBooking) {
    return totalPaid * (cancellationPolicy.refundPercentage / 100);
  }
  return 0;
}
