import { useState, useEffect } from "react";
import backend from "@/lib/backend";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { PlatformSettings } from "~backend/admin/settings_enhanced";
import { RichTextEditor } from "@/components/RichTextEditor";

export default function PlatformSettings() {
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
      console.error("Failed to load settings:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to load settings",
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
      console.error("Failed to save settings:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to save settings",
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
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <SettingsIcon className="w-8 h-8" />
            Platform Settings
          </h1>
          <p className="text-muted-foreground mt-1">Configure platform policies, payment settings, and more</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save All Changes"}
        </Button>
      </div>

      <Tabs defaultValue="policies" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="safety">Safety</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="app">App Config</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-4 mt-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Terms and Conditions</h2>
            <RichTextEditor
              value={settings.termsAndConditions || ""}
              onChange={(value) => setSettings({ ...settings, termsAndConditions: value })}
              placeholder="Enter your terms and conditions..."
            />
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Privacy Policy</h2>
            <RichTextEditor
              value={settings.privacyPolicy || ""}
              onChange={(value) => setSettings({ ...settings, privacyPolicy: value })}
              placeholder="Enter your privacy policy..."
            />
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Refund Policy</h2>
            <RichTextEditor
              value={settings.refundPolicy || ""}
              onChange={(value) => setSettings({ ...settings, refundPolicy: value })}
              placeholder="Enter your refund policy..."
            />
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Cancellation Policy</h2>
            <RichTextEditor
              value={settings.cancellationPolicy || ""}
              onChange={(value) => setSettings({ ...settings, cancellationPolicy: value })}
              placeholder="Enter your cancellation policy..."
            />
            <div className="mt-6 space-y-4">
              <h3 className="font-medium">Cancellation Windows</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Full Refund (hours)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={settings.cancellationWindows.fullRefundHours}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        cancellationWindows: {
                          ...settings.cancellationWindows,
                          fullRefundHours: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Partial Refund (hours)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={settings.cancellationWindows.partialRefundHours}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        cancellationWindows: {
                          ...settings.cancellationWindows,
                          partialRefundHours: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Partial Refund (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.cancellationWindows.partialRefundPercent}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        cancellationWindows: {
                          ...settings.cancellationWindows,
                          partialRefundPercent: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Community Guidelines</h2>
            <RichTextEditor
              value={settings.communityGuidelines || ""}
              onChange={(value) => setSettings({ ...settings, communityGuidelines: value })}
              placeholder="Enter community guidelines..."
            />
          </Card>
        </TabsContent>

        <TabsContent value="safety" className="space-y-4 mt-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Safety Guidelines</h2>
            <RichTextEditor
              value={settings.safetyGuidelines || ""}
              onChange={(value) => setSettings({ ...settings, safetyGuidelines: value })}
              placeholder="Enter safety guidelines..."
            />
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Emergency Contact Information</h2>
            <div className="space-y-4">
              <div>
                <Label>Emergency Contact Email</Label>
                <Input
                  type="email"
                  value={settings.emergencyContactEmail || ""}
                  onChange={(e) => setSettings({ ...settings, emergencyContactEmail: e.target.value })}
                  placeholder="emergency@braida.co.uk"
                />
              </div>
              <div>
                <Label>Emergency Contact Phone</Label>
                <Input
                  type="tel"
                  value={settings.emergencyContactPhone || ""}
                  onChange={(e) => setSettings({ ...settings, emergencyContactPhone: e.target.value })}
                  placeholder="+44 20 1234 5678"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Safety Tips</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Enter one safety tip per line
            </p>
            <Textarea
              rows={10}
              value={(settings.safetyTips || []).join("\n")}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  safetyTips: e.target.value.split("\n").filter((tip) => tip.trim() !== ""),
                })
              }
              placeholder="Meet in public places&#10;Share your location with friends&#10;Verify freelancer credentials"
            />
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4 mt-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Commission & Fees</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label>Commission Percentage (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={settings.commissionPercent}
                  onChange={(e) =>
                    setSettings({ ...settings, commissionPercent: parseFloat(e.target.value) })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Platform commission taken from each booking
                </p>
              </div>

              <div>
                <Label>Booking Fee (£)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={settings.bookingFeePence / 100}
                  onChange={(e) =>
                    setSettings({ ...settings, bookingFeePence: Math.round(parseFloat(e.target.value) * 100) })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Fixed fee added to each booking
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Payout Settings</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label>Default Payout Schedule</Label>
                <select
                  className="w-full border rounded-md p-2"
                  value={settings.defaultPayoutSchedule}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultPayoutSchedule: e.target.value as any })
                  }
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="per_transaction">Per Transaction</option>
                </select>
              </div>

              <div>
                <Label>Minimum Payout (£)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={settings.minimumPayoutPence / 100}
                  onChange={(e) =>
                    setSettings({ ...settings, minimumPayoutPence: Math.round(parseFloat(e.target.value) * 100) })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum amount for payout processing
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Booking Timeouts</h2>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <Label>Acceptance Timeout (hours)</Label>
                <Input
                  type="number"
                  min="1"
                  value={settings.acceptanceTimeoutHours}
                  onChange={(e) =>
                    setSettings({ ...settings, acceptanceTimeoutHours: parseInt(e.target.value) })
                  }
                />
              </div>

              <div>
                <Label>Auto-Confirm Timeout (hours)</Label>
                <Input
                  type="number"
                  min="1"
                  value={settings.autoConfirmTimeoutHours}
                  onChange={(e) =>
                    setSettings({ ...settings, autoConfirmTimeoutHours: parseInt(e.target.value) })
                  }
                />
              </div>

              <div>
                <Label>Dispute Window (days)</Label>
                <Input
                  type="number"
                  min="1"
                  value={settings.disputeWindowDays}
                  onChange={(e) =>
                    setSettings({ ...settings, disputeWindowDays: parseInt(e.target.value) })
                  }
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4 mt-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Social Media Links</h2>
            <div className="space-y-4">
              <div>
                <Label>Facebook URL</Label>
                <Input
                  type="url"
                  value={settings.socialMedia.facebookUrl || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialMedia: { ...settings.socialMedia, facebookUrl: e.target.value },
                    })
                  }
                  placeholder="https://facebook.com/braida"
                />
              </div>

              <div>
                <Label>Instagram URL</Label>
                <Input
                  type="url"
                  value={settings.socialMedia.instagramUrl || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialMedia: { ...settings.socialMedia, instagramUrl: e.target.value },
                    })
                  }
                  placeholder="https://instagram.com/braida"
                />
              </div>

              <div>
                <Label>Twitter URL</Label>
                <Input
                  type="url"
                  value={settings.socialMedia.twitterUrl || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialMedia: { ...settings.socialMedia, twitterUrl: e.target.value },
                    })
                  }
                  placeholder="https://twitter.com/braida"
                />
              </div>

              <div>
                <Label>TikTok URL</Label>
                <Input
                  type="url"
                  value={settings.socialMedia.tiktokUrl || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialMedia: { ...settings.socialMedia, tiktokUrl: e.target.value },
                    })
                  }
                  placeholder="https://tiktok.com/@braida"
                />
              </div>

              <div>
                <Label>LinkedIn URL</Label>
                <Input
                  type="url"
                  value={settings.socialMedia.linkedinUrl || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialMedia: { ...settings.socialMedia, linkedinUrl: e.target.value },
                    })
                  }
                  placeholder="https://linkedin.com/company/braida"
                />
              </div>

              <div>
                <Label>YouTube URL</Label>
                <Input
                  type="url"
                  value={settings.socialMedia.youtubeUrl || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialMedia: { ...settings.socialMedia, youtubeUrl: e.target.value },
                    })
                  }
                  placeholder="https://youtube.com/@braida"
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-4 mt-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Support Contact Information</h2>
            <div className="space-y-4">
              <div>
                <Label>Support Email</Label>
                <Input
                  type="email"
                  value={settings.support.email || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      support: { ...settings.support, email: e.target.value },
                    })
                  }
                  placeholder="support@braida.co.uk"
                />
              </div>

              <div>
                <Label>Support Phone</Label>
                <Input
                  type="tel"
                  value={settings.support.phone || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      support: { ...settings.support, phone: e.target.value },
                    })
                  }
                  placeholder="+44 20 1234 5678"
                />
              </div>

              <div>
                <Label>Business Hours</Label>
                <Input
                  value={settings.support.businessHours || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      support: { ...settings.support, businessHours: e.target.value },
                    })
                  }
                  placeholder="Mon-Fri 9am-6pm GMT"
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="app" className="space-y-4 mt-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Maintenance Mode</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Temporarily disable the app for maintenance
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, maintenanceMode: checked })
                  }
                />
              </div>

              {settings.maintenanceMode && (
                <div>
                  <Label>Maintenance Message</Label>
                  <Textarea
                    rows={3}
                    value={settings.maintenanceMessage || ""}
                    onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                    placeholder="We are currently performing scheduled maintenance. Please check back soon."
                  />
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">App Configuration</h2>
            <div className="space-y-4">
              <div>
                <Label>Minimum App Version</Label>
                <Input
                  value={settings.minAppVersion || ""}
                  onChange={(e) => setSettings({ ...settings, minAppVersion: e.target.value })}
                  placeholder="1.0.0"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Users with older versions will be prompted to update
                </p>
              </div>

              <div>
                <Label>Featured Categories</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Enter category IDs, comma-separated
                </p>
                <Input
                  value={(settings.featuredCategories || []).join(", ")}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      featuredCategories: e.target.value.split(",").map((c) => c.trim()).filter(Boolean),
                    })
                  }
                  placeholder="hair, makeup, gele, tailoring"
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end pt-6 border-t">
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save All Changes"}
        </Button>
      </div>
    </div>
  );
}
