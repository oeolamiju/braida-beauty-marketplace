import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Bell, Mail, Smartphone, Lock, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import backend from "@/lib/backend";
import TopNav from "@/components/navigation/TopNav";

interface Preferences {
  // In-app notifications
  new_booking_request: boolean;
  booking_confirmed: boolean;
  booking_cancelled: boolean;
  booking_declined: boolean;
  booking_expired: boolean;
  booking_reminder: boolean;
  booking_reschedule_requested: boolean;
  booking_rescheduled: boolean;
  message_received: boolean;
  review_reminder: boolean;
  // Email preferences
  email_enabled: boolean;
  push_enabled: boolean;
  email_marketing: boolean;
  email_product_updates: boolean;
}

const CRITICAL_TYPES = [
  "booking_paid",
  "payment_confirmed",
  "payment_failed",
  "payment_released",
  "booking_refunded",
  "service_auto_confirmed",
  "dispute_raised",
  "dispute_resolved",
];

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>("default");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadPreferences();
    checkPushSupport();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await backend.notifications.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error("Failed to load preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkPushSupport = () => {
    setPushSupported("Notification" in window && "serviceWorker" in navigator);
    if ("Notification" in window) {
      setPushPermission(Notification.permission);
    }
  };

  const handleToggle = async (key: keyof Preferences, value: boolean) => {
    if (!preferences) return;

    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);

    setSaving(true);
    try {
      await backend.notifications.updatePreferences({ [key]: value });
    } catch (error) {
      console.error("Failed to update preference:", error);
      setPreferences(preferences); // Revert
      toast({
        variant: "destructive",
        title: "Failed to save",
        description: "Could not update your preferences",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEnablePush = async () => {
    if (!pushSupported) return;

    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);

      if (permission === "granted") {
        await handleToggle("push_enabled", true);
        toast({ title: "Push notifications enabled!" });
      }
    } catch (error) {
      console.error("Failed to enable push:", error);
      toast({
        variant: "destructive",
        title: "Failed to enable push notifications",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNav />
        <div className="container mx-auto px-4 py-8 pt-24 max-w-2xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNav />
        <div className="container mx-auto px-4 py-8 pt-24 max-w-2xl text-center">
          <p className="text-muted-foreground">Failed to load preferences</p>
          <Button onClick={loadPreferences} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <div className="container mx-auto px-4 py-8 pt-24 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-2">Notification Preferences</h1>
        <p className="text-muted-foreground mb-8">
          Choose how you want to be notified about activity on Braida
        </p>

        {/* Channels */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Channels
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.email_enabled}
                onCheckedChange={(v) => handleToggle("email_enabled", v)}
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    {pushSupported
                      ? pushPermission === "granted"
                        ? "Push notifications are enabled"
                        : pushPermission === "denied"
                        ? "Push notifications are blocked in browser settings"
                        : "Get instant notifications in your browser"
                      : "Not supported in this browser"}
                  </p>
                </div>
              </div>
              {pushSupported && pushPermission !== "denied" && (
                pushPermission === "granted" ? (
                  <Switch
                    checked={preferences.push_enabled}
                    onCheckedChange={(v) => handleToggle("push_enabled", v)}
                  />
                ) : (
                  <Button size="sm" onClick={handleEnablePush}>
                    Enable
                  </Button>
                )
              )}
            </div>
          </div>
        </Card>

        {/* In-App Notifications */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Booking Notifications</h2>
          <div className="space-y-4">
            <PreferenceRow
              title="New Booking Requests"
              description="When someone books your service"
              checked={preferences.new_booking_request}
              onChange={(v) => handleToggle("new_booking_request", v)}
            />
            <PreferenceRow
              title="Booking Confirmations"
              description="When a booking is confirmed"
              checked={preferences.booking_confirmed}
              onChange={(v) => handleToggle("booking_confirmed", v)}
            />
            <PreferenceRow
              title="Booking Cancellations"
              description="When a booking is cancelled"
              checked={preferences.booking_cancelled}
              onChange={(v) => handleToggle("booking_cancelled", v)}
            />
            <PreferenceRow
              title="Booking Reminders"
              description="24 hours and 2 hours before appointments"
              checked={preferences.booking_reminder}
              onChange={(v) => handleToggle("booking_reminder", v)}
            />
            <PreferenceRow
              title="Reschedule Requests"
              description="When someone requests to reschedule"
              checked={preferences.booking_reschedule_requested}
              onChange={(v) => handleToggle("booking_reschedule_requested", v)}
            />
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Other Notifications</h2>
          <div className="space-y-4">
            <PreferenceRow
              title="Messages"
              description="When you receive a new message"
              checked={preferences.message_received}
              onChange={(v) => handleToggle("message_received", v)}
            />
            <PreferenceRow
              title="Review Reminders"
              description="Reminders to leave reviews after appointments"
              checked={preferences.review_reminder}
              onChange={(v) => handleToggle("review_reminder", v)}
            />
          </div>
        </Card>

        {/* Email Preferences */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Preferences
          </h2>
          <div className="space-y-4">
            <PreferenceRow
              title="Marketing Emails"
              description="Special offers, promotions, and tips"
              checked={preferences.email_marketing || false}
              onChange={(v) => handleToggle("email_marketing", v)}
            />
            <PreferenceRow
              title="Product Updates"
              description="New features and platform updates"
              checked={preferences.email_product_updates || false}
              onChange={(v) => handleToggle("email_product_updates", v)}
            />
          </div>
        </Card>

        {/* Critical Notifications Notice */}
        <Card className="p-6 border-blue-200 bg-blue-50">
          <div className="flex gap-4">
            <Lock className="h-6 w-6 text-blue-600 shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">
                Critical Notifications
              </h3>
              <p className="text-sm text-blue-700 mb-3">
                The following notifications cannot be disabled as they contain
                important information about your account and transactions:
              </p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Payment confirmations and failures</li>
                <li>• Refund notifications</li>
                <li>• Payout releases</li>
                <li>• Security alerts</li>
                <li>• Account verification status</li>
                <li>• Dispute updates</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function PreferenceRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

// Utility functions for push notifications
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

