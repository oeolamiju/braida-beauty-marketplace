import { useState, useEffect } from "react";
import backend from "@/lib/backend";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings as SettingsIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { PlatformSettings } from "~backend/admin/get_settings";

export default function Settings() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await backend.admin.getSettings();
      setSettings(response);
    } catch (error: any) {
      toast({
        title: "Error loading settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      await backend.admin.updateSettings(settings);
      toast({ title: "Settings saved successfully" });
    } catch (error: any) {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <SettingsIcon className="w-8 h-8" />
            Platform Settings
          </h1>
          <p className="text-muted-foreground mt-1">Configure platform policies and payment settings</p>
        </div>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Payment Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Commission Percentage (%)
            </label>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={settings.commissionPercentage}
              onChange={(e) =>
                setSettings({ ...settings, commissionPercentage: parseFloat(e.target.value) })
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Platform commission taken from each booking
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Booking Fee (£)
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={settings.bookingFeeAmount}
              onChange={(e) =>
                setSettings({ ...settings, bookingFeeAmount: parseFloat(e.target.value) })
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Fixed fee added to each booking
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Booking Policies</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Acceptance Timeout (hours)
            </label>
            <Input
              type="number"
              min="1"
              value={settings.acceptanceTimeoutHours}
              onChange={(e) =>
                setSettings({ ...settings, acceptanceTimeoutHours: parseInt(e.target.value) })
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Hours freelancer has to accept before booking auto-declines
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Auto-Confirm Timeout (hours)
            </label>
            <Input
              type="number"
              min="1"
              value={settings.autoConfirmHours}
              onChange={(e) =>
                setSettings({ ...settings, autoConfirmHours: parseInt(e.target.value) })
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Hours after booking when payment is auto-released if not confirmed
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Cancellation Policies</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Free Cancellation Window (hours)
            </label>
            <Input
              type="number"
              min="1"
              value={settings.cancellationFreeHours}
              onChange={(e) =>
                setSettings({ ...settings, cancellationFreeHours: parseInt(e.target.value) })
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Hours before booking when cancellation is free (full refund)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Partial Refund Window (hours)
            </label>
            <Input
              type="number"
              min="1"
              value={settings.cancellationPartialRefundHours}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  cancellationPartialRefundHours: parseInt(e.target.value),
                })
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Hours before booking when partial refund applies
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Partial Refund Percentage (%)
            </label>
            <Input
              type="number"
              min="0"
              max="100"
              value={settings.cancellationPartialRefundPercentage}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  cancellationPartialRefundPercentage: parseInt(e.target.value),
                })
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Percentage of refund for late cancellations
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Dispute Policies</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Dispute Window (days)
            </label>
            <Input
              type="number"
              min="1"
              value={settings.disputeWindowDays}
              onChange={(e) =>
                setSettings({ ...settings, disputeWindowDays: parseInt(e.target.value) })
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Days after booking completion when disputes can be opened
            </p>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
