import db from "../db";
import type { CancellationPolicy, RefundCalculation, FreelancerReliabilityConfig, FreelancerCancellationStats } from "./types";

export async function getCancellationPolicies(): Promise<CancellationPolicy[]> {
  const result = await db.queryAll<{
    id: number;
    policyType: string;
    hoursThreshold: number;
    refundPercentage: number;
    createdAt: Date;
    updatedAt: Date;
  }>`
    SELECT 
      id,
      policy_type as "policyType",
      hours_threshold as "hoursThreshold",
      refund_percentage as "refundPercentage",
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM cancellation_policies
    WHERE policy_type = 'client_cancel'
    ORDER BY hours_threshold DESC
  `;
  return result;
}

export async function calculateRefund(
  bookingAmount: number,
  scheduledStartTime: Date,
  cancellationTime: Date,
  cancelledBy: 'client' | 'freelancer'
): Promise<RefundCalculation> {
  const hoursBeforeService = Math.floor(
    (scheduledStartTime.getTime() - cancellationTime.getTime()) / (1000 * 60 * 60)
  );

  if (cancelledBy === 'freelancer') {
    return {
      refundPercentage: 100,
      refundAmount: bookingAmount,
      hoursBeforeService,
      appliedPolicy: 'freelancer_cancel_full_refund'
    };
  }

  const policies = await getCancellationPolicies();
  
  let appliedPolicy: CancellationPolicy | null = null;
  for (const policy of policies) {
    if (hoursBeforeService >= policy.hoursThreshold) {
      appliedPolicy = policy;
      break;
    }
  }

  if (!appliedPolicy && policies.length > 0) {
    appliedPolicy = policies[policies.length - 1];
  }

  const refundPercentage = appliedPolicy?.refundPercentage ?? 0;
  const refundAmount = (bookingAmount * refundPercentage) / 100;

  return {
    refundPercentage,
    refundAmount,
    hoursBeforeService,
    appliedPolicy: appliedPolicy 
      ? `client_cancel_${appliedPolicy.hoursThreshold}h_${appliedPolicy.refundPercentage}pct`
      : 'no_refund'
  };
}

export async function getReliabilityConfig(): Promise<FreelancerReliabilityConfig> {
  const result = await db.queryRow<{
    id: number;
    warningThreshold: number;
    suspensionThreshold: number;
    timeWindowDays: number;
  }>`
    SELECT 
      id,
      warning_threshold as "warningThreshold",
      suspension_threshold as "suspensionThreshold",
      time_window_days as "timeWindowDays"
    FROM freelancer_reliability_config
    ORDER BY id DESC
    LIMIT 1
  `;
  
  if (!result) {
    return {
      id: 0,
      warningThreshold: 2,
      suspensionThreshold: 5,
      timeWindowDays: 30
    };
  }
  
  return result;
}

export async function trackFreelancerCancellation(
  freelancerId: string,
  bookingId: number,
  hoursBeforeService: number
): Promise<void> {
  const isLastMinute = hoursBeforeService < 24;
  
  await db.exec`
    INSERT INTO freelancer_cancellation_log (
      freelancer_id,
      booking_id,
      hours_before_service,
      is_last_minute
    ) VALUES (
      ${freelancerId},
      ${bookingId},
      ${hoursBeforeService},
      ${isLastMinute}
    )
  `;
}

export async function getFreelancerCancellationStats(
  freelancerId: string
): Promise<FreelancerCancellationStats> {
  const config = await getReliabilityConfig();
  
  const result = await db.queryRow`
    SELECT 
      COUNT(*)::int as total_cancellations,
      COUNT(*) FILTER (WHERE is_last_minute = true)::int as last_minute_cancellations
    FROM freelancer_cancellation_log
    WHERE freelancer_id = ${freelancerId}
      AND cancelled_at > NOW() - INTERVAL '${config.timeWindowDays} days'
  `;

  const totalCancellations = result?.total_cancellations ?? 0;
  const lastMinuteCancellations = result?.last_minute_cancellations ?? 0;

  return {
    totalCancellations,
    lastMinuteCancellations,
    isAtRisk: lastMinuteCancellations >= config.warningThreshold,
    shouldWarn: lastMinuteCancellations >= config.warningThreshold && 
                lastMinuteCancellations < config.suspensionThreshold,
    shouldSuspend: lastMinuteCancellations >= config.suspensionThreshold
  };
}

export async function updateCancellationPolicy(
  id: number,
  hoursThreshold: number,
  refundPercentage: number
): Promise<void> {
  await db.exec`
    UPDATE cancellation_policies
    SET hours_threshold = ${hoursThreshold},
        refund_percentage = ${refundPercentage},
        updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function updateReliabilityConfig(
  warningThreshold: number,
  suspensionThreshold: number,
  timeWindowDays: number
): Promise<void> {
  await db.exec`
    UPDATE freelancer_reliability_config
    SET warning_threshold = ${warningThreshold},
        suspension_threshold = ${suspensionThreshold},
        time_window_days = ${timeWindowDays},
        updated_at = NOW()
    WHERE id = (SELECT id FROM freelancer_reliability_config ORDER BY id DESC LIMIT 1)
  `;
}
