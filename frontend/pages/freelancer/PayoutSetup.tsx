import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import backend from "@/lib/backend";
import type { PayoutAccount, PayoutScheduleType } from "~backend/payouts/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  RefreshCw,
  Settings
} from "lucide-react";

export default function PayoutSetupPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [account, setAccount] = useState<PayoutAccount | null>(null);
  const [schedule, setSchedule] = useState<PayoutScheduleType>("weekly");

  useEffect(() => {
    loadAccount();
  }, []);

  const loadAccount = async () => {
    try {
      setLoading(true);
      const res = await backend.payouts.getAccount();
      setAccount(res.account || null);
    } catch (error: any) {
      console.error("Failed to load account:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load payout account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async () => {
    try {
      setCreating(true);
      const origin = window.location.origin;
      const res = await backend.payouts.createAccount({
        returnUrl: `${origin}/freelancer/payout-setup?success=true`,
        refreshUrl: `${origin}/freelancer/payout-setup?refresh=true`,
      });
      
      window.location.href = res.onboardingUrl;
    } catch (error: any) {
      console.error("Failed to create account:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create payout account",
        variant: "destructive",
      });
      setCreating(false);
    }
  };

  const refreshStatus = async () => {
    try {
      setRefreshing(true);
      const res = await backend.payouts.refreshAccountStatus();
      setAccount(res.account);
      toast({
        title: "Success",
        description: "Account status refreshed",
      });
    } catch (error: any) {
      console.error("Failed to refresh status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to refresh account status",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const updateSchedule = async (newSchedule: PayoutScheduleType) => {
    try {
      await backend.payouts.setSchedule({ scheduleType: newSchedule });
      setSchedule(newSchedule);
      toast({
        title: "Success",
        description: "Payout schedule updated",
      });
    } catch (error: any) {
      console.error("Failed to update schedule:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update payout schedule",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = () => {
    if (!account) return null;
    
    if (account.payoutsEnabled) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>;
    } else if (account.onboardingCompleted) {
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending Review</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">Setup Required</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Payout Setup</h1>
        {account && (
          <Button 
            variant="outline" 
            onClick={refreshStatus}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>
        )}
      </div>

      {!account ? (
        <Card className="p-8">
          <div className="text-center">
            <Settings className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Set Up Your Payout Account</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Connect your bank account to receive payments for completed bookings. 
              This requires verification through our payment provider.
            </p>
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 max-w-md mx-auto">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Note:</strong> Only Braida Verified freelancers can receive payouts. 
                Make sure you have completed your verification first.
              </p>
            </div>
            <Button 
              onClick={createAccount} 
              disabled={creating}
              size="lg"
            >
              {creating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Set Up Payout Account
                </>
              )}
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">Account Status</h2>
                <p className="text-sm text-muted-foreground">
                  Manage your payout account settings
                </p>
              </div>
              {getStatusBadge()}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {account.detailsSubmitted ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                )}
                <div>
                  <p className="font-medium">Details Submitted</p>
                  <p className="text-sm text-muted-foreground">
                    {account.detailsSubmitted 
                      ? "Your account details have been submitted"
                      : "Please complete your account setup"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {account.payoutsEnabled ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                )}
                <div>
                  <p className="font-medium">Payouts Enabled</p>
                  <p className="text-sm text-muted-foreground">
                    {account.payoutsEnabled 
                      ? "You can receive payouts"
                      : "Payouts will be enabled once verification is complete"}
                  </p>
                </div>
              </div>

              {!account.payoutsEnabled && account.requirementsDue && account.requirementsDue.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                    Additional Information Required
                  </p>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                    Please complete the following requirements:
                  </p>
                  <ul className="list-disc list-inside text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                    {account.requirementsDue.map((req: string, idx: number) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                  <Button 
                    onClick={createAccount} 
                    disabled={creating}
                    className="mt-4"
                    variant="outline"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Complete Setup
                  </Button>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Payout Schedule</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Choose when you want to receive your payouts
            </p>
            
            <div className="space-y-3">
              {[
                { value: "per_transaction", label: "Per Transaction", desc: "Receive payout immediately after each booking completes" },
                { value: "weekly", label: "Weekly", desc: "Receive payouts every Friday" },
                { value: "bi_weekly", label: "Bi-Weekly", desc: "Receive payouts every other Friday" },
              ].map((option) => (
                <div
                  key={option.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    schedule === option.value
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => updateSchedule(option.value as PayoutScheduleType)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      schedule === option.value
                        ? "border-primary"
                        : "border-muted-foreground"
                    }`}>
                      {schedule === option.value && (
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{option.label}</p>
                      <p className="text-sm text-muted-foreground">{option.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex gap-3">
            <Button onClick={() => navigate("/freelancer/earnings")} className="flex-1">
              View Earnings Dashboard
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
