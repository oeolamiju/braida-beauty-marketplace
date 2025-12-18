import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import backend from "@/lib/backend";
import type { EarningsStats, Payout, PayoutAccount } from "~backend/payouts/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Calendar,
  ExternalLink,
  AlertCircle 
} from "lucide-react";

export default function EarningsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<EarningsStats | null>(null);
  const [account, setAccount] = useState<PayoutAccount | null>(null);
  const [history, setHistory] = useState<Payout[]>([]);
  const [totalPayouts, setTotalPayouts] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [earningsRes, accountRes, historyRes] = await Promise.all([
        backend.payouts.getEarnings(),
        backend.payouts.getAccount(),
        backend.payouts.getHistory({ page: 1, limit: 10 }),
      ]);
      
      setStats(earningsRes.stats);
      setAccount(accountRes.account || null);
      setHistory(historyRes.history.payouts);
      setTotalPayouts(historyRes.history.total);
    } catch (error: any) {
      console.error("Failed to load earnings:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load earnings data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
      case "scheduled":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "failed":
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8 text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Set Up Payouts</h2>
          <p className="text-muted-foreground mb-6">
            You need to set up your payout account to receive earnings.
          </p>
          <Button onClick={() => navigate("/freelancer/payout-setup")}>
            Set Up Payout Account
          </Button>
        </Card>
      </div>
    );
  }

  if (!account.payoutsEnabled) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8 text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Complete Payout Setup</h2>
          <p className="text-muted-foreground mb-6">
            Your payout account is not fully set up yet. Please complete the onboarding process.
          </p>
          <Button onClick={() => navigate("/freelancer/payout-setup")}>
            Complete Setup
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Earnings</h1>
        <Button 
          variant="outline" 
          onClick={() => navigate("/freelancer/payout-setup")}
        >
          Payout Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <p className="text-sm text-muted-foreground">Total Earned</p>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(stats?.totalEarned || 0)}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-muted-foreground">Pending in Escrow</p>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(stats?.pendingInEscrow || 0)}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <p className="text-sm text-muted-foreground">Next Payout</p>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(stats?.nextPayoutAmount || 0)}</p>
          {stats?.nextPayoutDate && (
            <p className="text-xs text-muted-foreground mt-1">
              {formatDate(stats.nextPayoutDate)}
            </p>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            <p className="text-sm text-muted-foreground">Available Balance</p>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(stats?.availableBalance || 0)}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Payout History</h2>
        
        {history.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No payouts yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((payout) => (
              <div 
                key={payout.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-semibold">Booking #{payout.bookingId}</p>
                    <Badge className={getStatusColor(payout.status)}>
                      {payout.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {payout.processedDate 
                      ? `Paid on ${formatDate(payout.processedDate)}`
                      : payout.scheduledDate
                      ? `Scheduled for ${formatDate(payout.scheduledDate)}`
                      : `Created ${formatDate(payout.createdAt)}`
                    }
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">{formatCurrency(payout.amount)}</p>
                  <p className="text-xs text-muted-foreground">
                    Service: {formatCurrency(payout.serviceAmount)}
                  </p>
                </div>
              </div>
            ))}
            
            {totalPayouts > history.length && (
              <Button variant="outline" className="w-full">
                Load More
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
