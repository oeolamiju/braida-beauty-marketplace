export interface CancellationPolicy {
  id: number;
  policyType: string;
  hoursThreshold: number;
  refundPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RefundCalculation {
  refundPercentage: number;
  refundAmount: number;
  hoursBeforeService: number;
  appliedPolicy: string;
}

export interface FreelancerReliabilityConfig {
  id: number;
  warningThreshold: number;
  suspensionThreshold: number;
  timeWindowDays: number;
}

export interface FreelancerCancellationStats {
  totalCancellations: number;
  lastMinuteCancellations: number;
  isAtRisk: boolean;
  shouldWarn: boolean;
  shouldSuspend: boolean;
}
