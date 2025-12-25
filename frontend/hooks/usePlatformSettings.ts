import { useEffect, useState } from "react";
import backend from "@/lib/backend";

export interface PlatformPolicies {
  termsAndConditions?: string;
  privacyPolicy?: string;
  refundPolicy?: string;
  cancellationPolicy?: string;
  communityGuidelines?: string;
  safetyGuidelines?: string;
  emergencyContactEmail?: string;
  emergencyContactPhone?: string;
  safetyTips?: string[];
  socialMedia: {
    facebookUrl?: string;
    instagramUrl?: string;
    twitterUrl?: string;
    tiktokUrl?: string;
    linkedinUrl?: string;
    youtubeUrl?: string;
  };
  support: {
    email?: string;
    phone?: string;
    businessHours?: string;
  };
}

export function usePlatformSettings() {
  const [settings, setSettings] = useState<PlatformPolicies | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await backend.admin.getPublicPolicies();
      setSettings(data);
    } catch (err: any) {
      console.error("Failed to load platform settings:", err);
      setError(err);
      setSettings({
        socialMedia: {},
        support: {
          email: "support@braida.co.uk",
          businessHours: "Mon-Fri 9am-6pm GMT",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, error, reload: loadSettings };
}
