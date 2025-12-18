import { AlertCircle, Clock, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";

interface PolicyTier {
  hoursThreshold: number;
  refundPercentage: number;
}

interface CancellationPolicyProps {
  policies: PolicyTier[];
  compact?: boolean;
}

export default function CancellationPolicy({ policies, compact = false }: CancellationPolicyProps) {
  const sortedPolicies = [...policies].sort((a, b) => b.hoursThreshold - a.hoursThreshold);

  if (compact) {
    return (
      <div className="text-sm text-muted-foreground space-y-1">
        {sortedPolicies.map((policy, index) => (
          <div key={index} className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>
              {policy.hoursThreshold > 0 
                ? `${policy.hoursThreshold}+ hours: ${policy.refundPercentage}% refund`
                : `Under ${sortedPolicies[index - 1]?.hoursThreshold || 24} hours: ${policy.refundPercentage}% refund`
              }
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-start gap-3 mb-4">
        <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-lg mb-1">Cancellation Policy</h3>
          <p className="text-sm text-muted-foreground">
            Refund amount depends on when you cancel
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {sortedPolicies.map((policy, index) => {
          const isLastTier = index === sortedPolicies.length - 1;
          const prevThreshold = index > 0 ? sortedPolicies[index - 1].hoursThreshold : null;
          
          return (
            <div key={index} className="flex items-start gap-4 p-4 bg-muted rounded-lg">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="flex-1">
                <div className="font-medium mb-1">
                  {policy.hoursThreshold > 0 
                    ? `${policy.hoursThreshold}+ hours before service`
                    : prevThreshold 
                      ? `Less than ${prevThreshold} hours before service`
                      : 'Less than 24 hours before service'
                  }
                </div>
                <div className="text-sm text-muted-foreground">
                  {policy.refundPercentage === 100 
                    ? 'Full refund'
                    : policy.refundPercentage === 0
                      ? 'No refund'
                      : `${policy.refundPercentage}% refund`
                  }
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
        <p className="text-sm text-amber-900 dark:text-amber-100">
          <strong>Note:</strong> If the freelancer cancels, you will receive a full refund regardless of timing.
        </p>
      </div>
    </Card>
  );
}
