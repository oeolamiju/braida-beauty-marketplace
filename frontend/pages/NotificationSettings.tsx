import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import backend from "@/lib/backend";
import type { NotificationPreferences } from "~backend/notifications/types";

export default function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await backend.notifications.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error("Failed to load notification preferences:", error);
      toast({
        title: "Error",
        description: "Failed to load notification preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return;

    const optimisticPreferences = { ...preferences, [key]: value };
    setPreferences(optimisticPreferences);

    try {
      await backend.notifications.updatePreferences({ [key]: value });
      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated",
      });
    } catch (error) {
      console.error("Failed to update preference:", error);
      setPreferences(preferences);
      toast({
        title: "Error",
        description: "Failed to update notification preferences",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Loading...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!preferences) {
    return null;
  }

  const notificationGroups = [
    {
      title: "Booking Notifications",
      description: "Manage notifications about your bookings",
      items: [
        {
          key: "new_booking_request" as const,
          title: "New Booking Requests",
          description: "Receive notifications when you get a new booking request",
        },
        {
          key: "booking_confirmed" as const,
          title: "Booking Confirmations",
          description: "Receive notifications when your booking is confirmed",
        },
        {
          key: "booking_declined" as const,
          title: "Booking Declined",
          description: "Receive notifications when a booking is declined",
        },
        {
          key: "booking_cancelled" as const,
          title: "Booking Cancellations",
          description: "Receive notifications when a booking is cancelled",
        },
        {
          key: "booking_reminder" as const,
          title: "Booking Reminders",
          description: "Get reminders about upcoming bookings (24h and 2h before)",
        },
        {
          key: "booking_reschedule_requested" as const,
          title: "Reschedule Requests",
          description: "Receive notifications when someone requests to reschedule",
        },
        {
          key: "booking_rescheduled" as const,
          title: "Booking Rescheduled",
          description: "Receive notifications when a booking is rescheduled",
        },
      ],
    },
    {
      title: "Payment Notifications",
      description: "Critical payment and transaction updates (cannot be disabled)",
      items: [
        {
          key: "booking_paid" as const,
          title: "Payment Received",
          description: "Receive notifications when a booking is paid",
          critical: true,
        },
        {
          key: "payment_confirmed" as const,
          title: "Payment Confirmed",
          description: "Receive confirmation when your payment is processed",
          critical: true,
        },
        {
          key: "payment_failed" as const,
          title: "Payment Failed",
          description: "Receive alerts when a payment fails",
          critical: true,
        },
        {
          key: "payment_released" as const,
          title: "Payment Released",
          description: "Receive notifications when payment is released to you",
          critical: true,
        },
        {
          key: "booking_refunded" as const,
          title: "Refund Processed",
          description: "Receive notifications when a refund is processed",
          critical: true,
        },
      ],
    },
    {
      title: "Other Notifications",
      description: "Additional platform notifications",
      items: [
        {
          key: "review_reminder" as const,
          title: "Review Reminders",
          description: "Get reminded to leave a review after a completed booking",
        },
        {
          key: "service_auto_confirmed" as const,
          title: "Auto-Confirmed Services",
          description: "Receive notifications when a service is auto-confirmed",
        },
        {
          key: "message_received" as const,
          title: "New Messages",
          description: "Receive notifications when you get a new message",
        },
      ],
    },
  ];

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Manage how you receive notifications about your bookings and activity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4 border-b pb-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Email Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications (critical payment notifications will always be sent)
                </p>
              </div>
              <Switch
                checked={preferences.email_enabled}
                onCheckedChange={(checked) => updatePreference("email_enabled", checked)}
              />
            </div>
          </div>

          {notificationGroups.map((group) => (
            <div key={group.title} className="space-y-4">
              <div>
                <h3 className="text-base font-semibold">{group.title}</h3>
                <p className="text-sm text-muted-foreground">{group.description}</p>
              </div>
              <div className="space-y-4">
                {group.items.map((item) => {
                  const critical = 'critical' in item ? item.critical : false;
                  return (
                    <div key={item.key} className="flex items-center justify-between space-x-4">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {item.title}
                          {critical && <span className="ml-2 text-xs text-muted-foreground">(Required)</span>}
                        </p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <Switch
                        checked={preferences[item.key]}
                        onCheckedChange={(checked) => updatePreference(item.key, checked)}
                        disabled={critical}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
