import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Star, Gift, TrendingUp, ChevronRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import backend from "@/lib/backend";

interface LoyaltyTier {
  id: number;
  name: string;
  minPoints: number;
  discountPercent: number;
  benefits: string[];
  badgeColor: string;
}

interface LoyaltyTransaction {
  id: number;
  points: number;
  type: string;
  description: string | null;
  createdAt: string;
}

interface LoyaltyStatus {
  currentPoints: number;
  totalPoints: number;
  currentTier: LoyaltyTier;
  nextTier: LoyaltyTier | null;
  pointsToNextTier: number;
  recentTransactions: LoyaltyTransaction[];
}

export default function Loyalty() {
  const [status, setStatus] = useState<LoyaltyStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadLoyaltyStatus();
  }, []);

  const loadLoyaltyStatus = async () => {
    try {
      const response = await backend.loyalty.getLoyaltyStatus();
      setStatus(response as any);
    } catch (error: any) {
      console.error("Failed to load loyalty status:", error);
      toast({
        title: "Error",
        description: "Failed to load loyalty information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTransactionType = (type: string) => {
    switch (type) {
      case "earned_booking":
        return "Booking";
      case "earned_review":
        return "Review Bonus";
      case "earned_referral":
        return "Referral Bonus";
      case "bonus":
        return "Bonus";
      case "spent":
        return "Redeemed";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!status) {
    return (
      <div className="text-center py-12">
        <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Unable to load loyalty information</p>
      </div>
    );
  }

  const progressPercent = status.nextTier
    ? ((status.totalPoints - status.currentTier.minPoints) / (status.nextTier.minPoints - status.currentTier.minPoints)) * 100
    : 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="h-8 w-8 text-[#F4B942]" />
        <h1 className="text-2xl font-bold">Loyalty Rewards</h1>
      </div>

      {/* Current Status Card */}
      <Card className="overflow-hidden">
        <div
          className="p-6 text-white"
          style={{
            background: `linear-gradient(135deg, ${status.currentTier.badgeColor} 0%, ${status.currentTier.badgeColor}CC 100%)`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/80 text-sm">Your Status</p>
              <h2 className="text-3xl font-bold">{status.currentTier.name}</h2>
            </div>
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <Trophy className="h-8 w-8" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-white/70 text-sm">Available Points</p>
              <p className="text-2xl font-bold">{status.currentPoints.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-white/70 text-sm">Lifetime Points</p>
              <p className="text-2xl font-bold">{status.totalPoints.toLocaleString()}</p>
            </div>
          </div>

          {status.currentTier.discountPercent > 0 && (
            <div className="mt-4 bg-white/10 rounded-lg p-3 flex items-center gap-2">
              <Gift className="h-5 w-5" />
              <span>{status.currentTier.discountPercent}% discount on all bookings</span>
            </div>
          )}
        </div>

        {/* Progress to Next Tier */}
        {status.nextTier && (
          <div className="p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Progress to {status.nextTier.name}</span>
              <span className="text-sm font-medium">{status.pointsToNextTier} points to go</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${Math.min(progressPercent, 100)}%`,
                  background: `linear-gradient(90deg, ${status.currentTier.badgeColor}, ${status.nextTier.badgeColor})`,
                }}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Benefits */}
      <Card className="p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-[#F4B942]" />
          Your Benefits
        </h3>
        <div className="space-y-2">
          {status.currentTier.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: status.currentTier.badgeColor + "20" }}
              >
                <ChevronRight className="h-4 w-4" style={{ color: status.currentTier.badgeColor }} />
              </div>
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* How to Earn Points */}
      <Card className="p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#1ABC9C]" />
          How to Earn Points
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-[#E91E63] mb-2">1x</div>
            <p className="font-medium">Book Services</p>
            <p className="text-sm text-muted-foreground">1 point per £1 spent</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-[#F4B942] mb-2">+10</div>
            <p className="font-medium">Leave Reviews</p>
            <p className="text-sm text-muted-foreground">10 points per review</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-[#1ABC9C] mb-2">+50</div>
            <p className="font-medium">Refer Friends</p>
            <p className="text-sm text-muted-foreground">50 points per referral</p>
          </div>
        </div>
      </Card>

      {/* Recent Transactions */}
      <Card className="p-6">
        <h3 className="font-bold mb-4">Recent Activity</h3>
        {status.recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No transactions yet. Start earning points!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {status.recentTransactions.map(transaction => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{formatTransactionType(transaction.type)}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                    {transaction.description && ` • ${transaction.description}`}
                  </p>
                </div>
                <span className={`font-bold ${transaction.points > 0 ? "text-green-600" : "text-red-600"}`}>
                  {transaction.points > 0 ? "+" : ""}{transaction.points}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* All Tiers */}
      <Card className="p-6">
        <h3 className="font-bold mb-4">All Tiers</h3>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { name: "Bronze", minPoints: 0, badgeColor: "#CD7F32", discount: 0 },
            { name: "Silver", minPoints: 500, badgeColor: "#C0C0C0", discount: 2 },
            { name: "Gold", minPoints: 2000, badgeColor: "#FFD700", discount: 5 },
            { name: "Platinum", minPoints: 5000, badgeColor: "#E5E4E2", discount: 10 },
          ].map((tier) => (
            <div
              key={tier.name}
              className={`p-4 rounded-lg border-2 ${
                status.currentTier.name === tier.name
                  ? "border-[#E91E63] bg-pink-50"
                  : "border-gray-200"
              }`}
            >
              <div
                className="w-10 h-10 rounded-full mb-3"
                style={{ backgroundColor: tier.badgeColor }}
              />
              <h4 className="font-bold">{tier.name}</h4>
              <p className="text-sm text-muted-foreground">{tier.minPoints.toLocaleString()} points</p>
              {tier.discount > 0 && (
                <p className="text-sm text-[#E91E63] font-medium mt-1">{tier.discount}% discount</p>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

