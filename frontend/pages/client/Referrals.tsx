import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Gift, Copy, Share2, CheckCircle, Clock, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import backend from "@/lib/backend";

interface ReferralCode {
  code: string;
  rewardAmount: number;
  rewardType: string;
  totalReferrals: number;
  totalEarnings: number;
}

interface Referral {
  id: number;
  refereeName: string;
  status: string;
  rewardAmount: number | null;
  completedAt: string | null;
  createdAt: string;
}

export default function Referrals() {
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      const [codeResponse, listResponse] = await Promise.all([
        backend.referrals.getReferralCode(),
        backend.referrals.listReferrals(),
      ]);
      setReferralCode(codeResponse as any);
      setShareUrl((codeResponse as any).shareUrl);
      setReferrals(listResponse.referrals as any);
    } catch (error: any) {
      console.error("Failed to load referral data:", error);
      toast({
        title: "Error",
        description: "Failed to load referral information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode?.code || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard",
    });
  };

  const shareCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Braida!",
          text: `Use my referral code ${referralCode?.code} to get £${referralCode?.rewardAmount} credit on your first booking!`,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      copyCode();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "rewarded":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "rewarded":
        return "Reward Paid";
      case "completed":
        return "Booking Made";
      case "pending":
        return "Signed Up";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Gift className="h-8 w-8 text-[#E91E63]" />
        <h1 className="text-2xl font-bold">Refer & Earn</h1>
      </div>

      {/* Referral Code Card */}
      <Card className="p-6 bg-gradient-to-br from-[#E91E63]/10 to-[#F4B942]/10 border-[#E91E63]/20">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-2">Share Braida & Earn Rewards</h2>
          <p className="text-muted-foreground">
            Give friends £{referralCode?.rewardAmount} off their first booking and earn £{referralCode?.rewardAmount} credit for each successful referral
          </p>
        </div>

        <div className="bg-white rounded-lg p-4 mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Your referral code</p>
            <p className="text-2xl font-bold tracking-wider">{referralCode?.code}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={copyCode}>
              {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button size="icon" onClick={shareCode} className="bg-[#E91E63]">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-[#E91E63]">{referralCode?.totalReferrals || 0}</p>
            <p className="text-sm text-muted-foreground">Total Referrals</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-[#1ABC9C]">£{(referralCode?.totalEarnings || 0).toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Total Earned</p>
          </div>
        </div>
      </Card>

      {/* How it Works */}
      <Card className="p-6">
        <h3 className="font-bold mb-4">How it Works</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4">
            <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-3">
              <Share2 className="h-6 w-6 text-[#E91E63]" />
            </div>
            <h4 className="font-semibold mb-1">1. Share</h4>
            <p className="text-sm text-muted-foreground">Share your unique code with friends</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-[#F4B942]" />
            </div>
            <h4 className="font-semibold mb-1">2. They Book</h4>
            <p className="text-sm text-muted-foreground">Friends sign up and make their first booking</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-3">
              <Gift className="h-6 w-6 text-[#1ABC9C]" />
            </div>
            <h4 className="font-semibold mb-1">3. You Earn</h4>
            <p className="text-sm text-muted-foreground">Get £{referralCode?.rewardAmount} credit for each referral</p>
          </div>
        </div>
      </Card>

      {/* Referrals List */}
      <Card className="p-6">
        <h3 className="font-bold mb-4">Your Referrals</h3>
        {referrals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No referrals yet. Start sharing your code!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {referrals.map(referral => (
              <div key={referral.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(referral.status)}
                  <div>
                    <p className="font-medium">{referral.refereeName}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(referral.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    referral.status === "rewarded" ? "bg-green-100 text-green-700" :
                    referral.status === "completed" ? "bg-blue-100 text-blue-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {getStatusText(referral.status)}
                  </span>
                  {referral.rewardAmount && referral.status === "rewarded" && (
                    <p className="text-sm font-medium text-green-600 mt-1">+£{referral.rewardAmount.toFixed(2)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

