import { useEffect, useState } from "react";
import backend from "@/lib/backend";
import type { PayoutSettings, PayoutScheduleType } from "~backend/payouts/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Settings, DollarSign, Clock, Calendar, Save } from "lucide-react";

export default function PaymentSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<PayoutSettings | null>(null);
  
  const [commission, setCommission] = useState("15");
  const [bookingFee, setBookingFee] = useState("0");
  const [timeout, setTimeout] = useState("72");
  const [defaultSchedule, setDefaultSchedule] = useState<PayoutScheduleType>("weekly");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await backend.payouts.adminGetSettings();
      setSettings(res.settings);
      setCommission(res.settings.platformCommissionPercent.toString());
      setBookingFee(res.settings.bookingFeeFixed.toString());
      setTimeout(res.settings.autoConfirmationTimeoutHours.toString());
      setDefaultSchedule(res.settings.defaultPayoutSchedule);
    } catch (error: any) {
      console.error("Failed to load settings:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load payment settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      const commissionValue = parseFloat(commission);
      const feeValue = parseFloat(bookingFee);
      const timeoutValue = parseInt(timeout);
      
      if (isNaN(commissionValue) || commissionValue < 0 || commissionValue > 100) {
        throw new Error("Commission must be between 0 and 100");
      }
      
      if (isNaN(feeValue) || feeValue < 0) {
        throw new Error("Booking fee must be non-negative");
      }
      
      if (isNaN(timeoutValue) || timeoutValue < 1) {
        throw new Error("Timeout must be at least 1 hour");
      }
      
      await backend.payouts.adminUpdateSettings({
        platformCommissionPercent: commissionValue,
        bookingFeeFixed: feeValue,
        autoConfirmationTimeoutHours: timeoutValue,
        defaultPayoutSchedule: defaultSchedule,
      });
      
      toast({
        title: "Success",
        description: "Payment settings updated successfully",
      });
      
      await loadSettings();
    } catch (error: any) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save payment settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="w-8 h-8" />
        <h1 className="text-3xl font-bold">Payment Settings</h1>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Platform Fees</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Platform Commission (%)
              </div>
            </label>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              placeholder="15"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Percentage of service amount charged as platform commission
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Fixed Booking Fee ($)
              </div>
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={bookingFee}
              onChange={(e) => setBookingFee(e.target.value)}
              placeholder="0.00"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Fixed fee charged per booking (in addition to commission)
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Booking Settings</h2>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Auto-Confirmation Timeout (hours)
            </div>
          </label>
          <Input
            type="number"
            min="1"
            step="1"
            value={timeout}
            onChange={(e) => setTimeout(e.target.value)}
            placeholder="72"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Hours after service completion before automatic confirmation
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Payout Defaults</h2>
        
        <div>
          <label className="block text-sm font-medium mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Default Payout Schedule
            </div>
          </label>
          
          <div className="space-y-3">
            {[
              { value: "per_transaction", label: "Per Transaction", desc: "Immediate payout after each booking" },
              { value: "weekly", label: "Weekly", desc: "Payouts every Friday" },
              { value: "bi_weekly", label: "Bi-Weekly", desc: "Payouts every other Friday" },
            ].map((option) => (
              <div
                key={option.value}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  defaultSchedule === option.value
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => setDefaultSchedule(option.value as PayoutScheduleType)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    defaultSchedule === option.value
                      ? "border-primary"
                      : "border-muted-foreground"
                  }`}>
                    {defaultSchedule === option.value && (
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
        </div>
      </Card>

      {settings && (
        <Card className="p-4 bg-muted">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Current Commission</p>
              <p className="font-semibold">{settings.platformCommissionPercent}%</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Current Fee</p>
              <p className="font-semibold">${settings.bookingFeeFixed}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Current Timeout</p>
              <p className="font-semibold">{settings.autoConfirmationTimeoutHours}h</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Default Schedule</p>
              <p className="font-semibold capitalize">{settings.defaultPayoutSchedule.replace('_', ' ')}</p>
            </div>
          </div>
        </Card>
      )}

      <div className="flex gap-3">
        <Button onClick={saveSettings} disabled={saving} className="flex-1">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
        <Button variant="outline" onClick={loadSettings}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
