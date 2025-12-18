import { useState, useEffect } from "react";
import backend from "@/lib/backend";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle, Save, RefreshCw } from "lucide-react";

interface CancellationPolicy {
  id: number;
  policyType: string;
  hoursThreshold: number;
  refundPercentage: number;
}

interface ReliabilityConfig {
  id: number;
  warningThreshold: number;
  suspensionThreshold: number;
  timeWindowDays: number;
}

export default function PolicySettings() {
  const [policies, setPolicies] = useState<CancellationPolicy[]>([]);
  const [reliabilityConfig, setReliabilityConfig] = useState<ReliabilityConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [policiesRes, configRes] = await Promise.all([
        backend.policies.getPolicies(),
        backend.policies.getReliabilityConfigEndpoint()
      ]);
      setPolicies(policiesRes.policies);
      setReliabilityConfig(configRes.config);
    } catch (error) {
      console.error("Failed to load policy settings:", error);
      toast({
        title: "Error",
        description: "Failed to load policy settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePolicyChange = (id: number, field: 'hoursThreshold' | 'refundPercentage', value: string) => {
    setPolicies(prev => prev.map(p => 
      p.id === id ? { ...p, [field]: parseInt(value) || 0 } : p
    ));
  };

  const handleReliabilityChange = (field: keyof ReliabilityConfig, value: string) => {
    if (!reliabilityConfig) return;
    setReliabilityConfig({ ...reliabilityConfig, [field]: parseInt(value) || 0 });
  };

  const savePolicies = async () => {
    try {
      setSaving(true);
      await backend.policies.updatePolicies({
        policies: policies.map(p => ({
          id: p.id,
          hoursThreshold: p.hoursThreshold,
          refundPercentage: p.refundPercentage
        }))
      });
      toast({
        title: "Success",
        description: "Cancellation policies updated successfully"
      });
    } catch (error) {
      console.error("Failed to save policies:", error);
      toast({
        title: "Error",
        description: "Failed to save cancellation policies",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const saveReliabilityConfig = async () => {
    if (!reliabilityConfig) return;
    try {
      setSaving(true);
      await backend.policies.updateReliabilityConfigEndpoint({
        warningThreshold: reliabilityConfig.warningThreshold,
        suspensionThreshold: reliabilityConfig.suspensionThreshold,
        timeWindowDays: reliabilityConfig.timeWindowDays
      });
      toast({
        title: "Success",
        description: "Reliability config updated successfully"
      });
    } catch (error) {
      console.error("Failed to save reliability config:", error);
      toast({
        title: "Error",
        description: "Failed to save reliability config",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Cancellation & Rescheduling Policies</h1>
        <p className="text-muted-foreground">
          Configure refund policies and freelancer reliability thresholds
        </p>
      </div>

      <Card className="p-6 mb-6">
        <div className="flex items-start gap-3 mb-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900 dark:text-blue-100">
            <p className="font-medium mb-1">Policy Information</p>
            <p>These policies are displayed to users before booking and automatically enforced during cancellations. Changes take effect immediately.</p>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">Client Cancellation Policies</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Define refund percentages based on how far in advance the client cancels
        </p>

        <div className="space-y-4 mb-6">
          {policies
            .sort((a, b) => b.hoursThreshold - a.hoursThreshold)
            .map(policy => (
            <div key={policy.id} className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Hours Before Service
                </label>
                <Input
                  type="number"
                  min="0"
                  value={policy.hoursThreshold}
                  onChange={(e) => handlePolicyChange(policy.id, 'hoursThreshold', e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum hours before service start
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Refund Percentage
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={policy.refundPercentage}
                  onChange={(e) => handlePolicyChange(policy.id, 'refundPercentage', e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Percentage of booking amount refunded
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-3 mb-4 p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-900 dark:text-amber-100">
            <p className="font-medium mb-1">Freelancer Cancellations</p>
            <p>When freelancers cancel, clients always receive a 100% refund. The freelancer's reliability score is affected.</p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={savePolicies} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            Save Cancellation Policies
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Freelancer Reliability Thresholds</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Configure when to warn or suspend freelancers for excessive last-minute cancellations
        </p>

        {reliabilityConfig && (
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Warning Threshold
                </label>
                <Input
                  type="number"
                  min="1"
                  value={reliabilityConfig.warningThreshold}
                  onChange={(e) => handleReliabilityChange('warningThreshold', e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Last-minute cancellations before warning
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Suspension Threshold
                </label>
                <Input
                  type="number"
                  min="1"
                  value={reliabilityConfig.suspensionThreshold}
                  onChange={(e) => handleReliabilityChange('suspensionThreshold', e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Last-minute cancellations before suspension
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Time Window (Days)
                </label>
                <Input
                  type="number"
                  min="1"
                  value={reliabilityConfig.timeWindowDays}
                  onChange={(e) => handleReliabilityChange('timeWindowDays', e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Rolling window for counting cancellations
                </p>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Last-minute</strong> cancellations are defined as cancellations made less than <strong>24 hours</strong> before the scheduled service start time.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={saveReliabilityConfig} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            Save Reliability Config
          </Button>
        </div>
      </Card>
    </div>
  );
}
