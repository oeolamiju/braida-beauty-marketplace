import { api } from "encore.dev/api";
import db from "../db";
import { requireAdminPermission } from "./rbac";
import { APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";

export interface PlatformSettings {
  // Cancellation policy
  cancellationWindows: {
    fullRefundHours: number;
    partialRefundHours: number;
    partialRefundPercent: number;
  };
  
  // Timeouts
  acceptanceTimeoutHours: number;
  autoConfirmTimeoutHours: number;
  disputeWindowDays: number;
  
  // Fees
  commissionPercent: number;
  bookingFeePence: number;
  
  // Payouts
  defaultPayoutSchedule: "weekly" | "biweekly" | "per_transaction";
  minimumPayoutPence: number;
  
  // Legal & Policy Content
  termsAndConditions?: string;
  privacyPolicy?: string;
  refundPolicy?: string;
  cancellationPolicy?: string;
  communityGuidelines?: string;
  
  // Safety Settings
  safetyGuidelines?: string;
  emergencyContactEmail?: string;
  emergencyContactPhone?: string;
  safetyTips?: string[];
  
  // Social Media
  socialMedia: {
    facebookUrl?: string;
    instagramUrl?: string;
    twitterUrl?: string;
    tiktokUrl?: string;
    linkedinUrl?: string;
    youtubeUrl?: string;
  };
  
  // Support Contact
  support: {
    email?: string;
    phone?: string;
    businessHours?: string;
  };
  
  // App Configuration
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  minAppVersion?: string;
  featuredCategories?: string[];
}

export const getSettings = api(
  { method: "GET", path: "/admin/settings/platform", expose: true, auth: true },
  async (): Promise<PlatformSettings> => {
    await requireAdminPermission("settings", "view");

    const settings = await db.queryRow<{
      full_refund_hours: number;
      partial_refund_hours: number;
      partial_refund_percent: number;
      acceptance_timeout_hours: number;
      auto_confirm_timeout_hours: number;
      dispute_window_days: number;
      commission_percent: number;
      booking_fee_pence: number;
      default_payout_schedule: string;
      minimum_payout_pence: number;
      terms_and_conditions: string | null;
      privacy_policy: string | null;
      refund_policy: string | null;
      cancellation_policy: string | null;
      community_guidelines: string | null;
      safety_guidelines: string | null;
      emergency_contact_email: string | null;
      emergency_contact_phone: string | null;
      safety_tips: string | null;
      facebook_url: string | null;
      instagram_url: string | null;
      twitter_url: string | null;
      tiktok_url: string | null;
      linkedin_url: string | null;
      youtube_url: string | null;
      support_email: string | null;
      support_phone: string | null;
      business_hours: string | null;
      maintenance_mode: boolean;
      maintenance_message: string | null;
      min_app_version: string | null;
      featured_categories: string | null;
    }>`
      SELECT 
        full_refund_hours,
        partial_refund_hours,
        partial_refund_percent,
        acceptance_timeout_hours,
        auto_confirm_timeout_hours,
        dispute_window_days,
        commission_percent,
        booking_fee_pence,
        default_payout_schedule,
        minimum_payout_pence,
        terms_and_conditions,
        privacy_policy,
        refund_policy,
        cancellation_policy,
        community_guidelines,
        safety_guidelines,
        emergency_contact_email,
        emergency_contact_phone,
        safety_tips,
        facebook_url,
        instagram_url,
        twitter_url,
        tiktok_url,
        linkedin_url,
        youtube_url,
        support_email,
        support_phone,
        business_hours,
        maintenance_mode,
        maintenance_message,
        min_app_version,
        featured_categories
      FROM platform_settings
      LIMIT 1
    `;

    const defaults: PlatformSettings = {
      cancellationWindows: {
        fullRefundHours: 48,
        partialRefundHours: 24,
        partialRefundPercent: 50,
      },
      acceptanceTimeoutHours: 24,
      autoConfirmTimeoutHours: 72,
      disputeWindowDays: 14,
      commissionPercent: 10,
      bookingFeePence: 200,
      defaultPayoutSchedule: "weekly",
      minimumPayoutPence: 1000,
      socialMedia: {},
      support: {
        email: "support@braida.co.uk",
        businessHours: "Mon-Fri 9am-6pm GMT",
      },
      maintenanceMode: false,
      featuredCategories: ["hair", "makeup", "gele", "tailoring"],
    };

    if (!settings) {
      return defaults;
    }

    // Parse JSON fields safely
    let safetyTips: string[] = [];
    let featuredCategories: string[] = ["hair", "makeup", "gele", "tailoring"];
    
    try {
      if (settings.safety_tips) {
        safetyTips = typeof settings.safety_tips === 'string' 
          ? JSON.parse(settings.safety_tips) 
          : settings.safety_tips;
      }
      if (settings.featured_categories) {
        featuredCategories = typeof settings.featured_categories === 'string'
          ? JSON.parse(settings.featured_categories)
          : settings.featured_categories;
      }
    } catch (e) {
      console.error("Error parsing JSON fields:", e);
    }

    return {
      cancellationWindows: {
        fullRefundHours: settings.full_refund_hours,
        partialRefundHours: settings.partial_refund_hours,
        partialRefundPercent: settings.partial_refund_percent,
      },
      acceptanceTimeoutHours: settings.acceptance_timeout_hours,
      autoConfirmTimeoutHours: settings.auto_confirm_timeout_hours,
      disputeWindowDays: settings.dispute_window_days,
      commissionPercent: settings.commission_percent,
      bookingFeePence: settings.booking_fee_pence,
      defaultPayoutSchedule: settings.default_payout_schedule as any,
      minimumPayoutPence: settings.minimum_payout_pence,
      termsAndConditions: settings.terms_and_conditions || undefined,
      privacyPolicy: settings.privacy_policy || undefined,
      refundPolicy: settings.refund_policy || undefined,
      cancellationPolicy: settings.cancellation_policy || undefined,
      communityGuidelines: settings.community_guidelines || undefined,
      safetyGuidelines: settings.safety_guidelines || undefined,
      emergencyContactEmail: settings.emergency_contact_email || undefined,
      emergencyContactPhone: settings.emergency_contact_phone || undefined,
      safetyTips: safetyTips.length > 0 ? safetyTips : undefined,
      socialMedia: {
        facebookUrl: settings.facebook_url || undefined,
        instagramUrl: settings.instagram_url || undefined,
        twitterUrl: settings.twitter_url || undefined,
        tiktokUrl: settings.tiktok_url || undefined,
        linkedinUrl: settings.linkedin_url || undefined,
        youtubeUrl: settings.youtube_url || undefined,
      },
      support: {
        email: settings.support_email || "support@braida.co.uk",
        phone: settings.support_phone || undefined,
        businessHours: settings.business_hours || "Mon-Fri 9am-6pm GMT",
      },
      maintenanceMode: settings.maintenance_mode,
      maintenanceMessage: settings.maintenance_message || undefined,
      minAppVersion: settings.min_app_version || undefined,
      featuredCategories,
    };
  }
);

export interface UpdatePlatformSettingsRequest {
  cancellationWindows?: {
    fullRefundHours?: number;
    partialRefundHours?: number;
    partialRefundPercent?: number;
  };
  acceptanceTimeoutHours?: number;
  autoConfirmTimeoutHours?: number;
  disputeWindowDays?: number;
  commissionPercent?: number;
  bookingFeePence?: number;
  defaultPayoutSchedule?: "weekly" | "biweekly" | "per_transaction";
  minimumPayoutPence?: number;
  
  // Legal & Policy Content
  termsAndConditions?: string;
  privacyPolicy?: string;
  refundPolicy?: string;
  cancellationPolicy?: string;
  communityGuidelines?: string;
  
  // Safety Settings
  safetyGuidelines?: string;
  emergencyContactEmail?: string;
  emergencyContactPhone?: string;
  safetyTips?: string[];
  
  // Social Media
  socialMedia?: {
    facebookUrl?: string;
    instagramUrl?: string;
    twitterUrl?: string;
    tiktokUrl?: string;
    linkedinUrl?: string;
    youtubeUrl?: string;
  };
  
  // Support Contact
  support?: {
    email?: string;
    phone?: string;
    businessHours?: string;
  };
  
  // App Configuration
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  minAppVersion?: string;
  featuredCategories?: string[];
}

export const updateSettings = api(
  { method: "PUT", path: "/admin/settings/platform", expose: true, auth: true },
  async (req: UpdatePlatformSettingsRequest): Promise<{ success: boolean }> => {
    await requireAdminPermission("settings", "edit");
    const auth = getAuthData()!;

    // Build update query dynamically
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Cancellation Windows
    if (req.cancellationWindows) {
      if (req.cancellationWindows.fullRefundHours !== undefined) {
        updates.push(`full_refund_hours = $${paramIndex++}`);
        params.push(req.cancellationWindows.fullRefundHours);
      }
      if (req.cancellationWindows.partialRefundHours !== undefined) {
        updates.push(`partial_refund_hours = $${paramIndex++}`);
        params.push(req.cancellationWindows.partialRefundHours);
      }
      if (req.cancellationWindows.partialRefundPercent !== undefined) {
        updates.push(`partial_refund_percent = $${paramIndex++}`);
        params.push(req.cancellationWindows.partialRefundPercent);
      }
    }

    // Timeouts
    if (req.acceptanceTimeoutHours !== undefined) {
      updates.push(`acceptance_timeout_hours = $${paramIndex++}`);
      params.push(req.acceptanceTimeoutHours);
    }
    if (req.autoConfirmTimeoutHours !== undefined) {
      updates.push(`auto_confirm_timeout_hours = $${paramIndex++}`);
      params.push(req.autoConfirmTimeoutHours);
    }
    if (req.disputeWindowDays !== undefined) {
      updates.push(`dispute_window_days = $${paramIndex++}`);
      params.push(req.disputeWindowDays);
    }

    // Fees
    if (req.commissionPercent !== undefined) {
      updates.push(`commission_percent = $${paramIndex++}`);
      params.push(req.commissionPercent);
    }
    if (req.bookingFeePence !== undefined) {
      updates.push(`booking_fee_pence = $${paramIndex++}`);
      params.push(req.bookingFeePence);
    }

    // Payouts
    if (req.defaultPayoutSchedule !== undefined) {
      updates.push(`default_payout_schedule = $${paramIndex++}`);
      params.push(req.defaultPayoutSchedule);
    }
    if (req.minimumPayoutPence !== undefined) {
      updates.push(`minimum_payout_pence = $${paramIndex++}`);
      params.push(req.minimumPayoutPence);
    }

    // Legal & Policy Content
    if (req.termsAndConditions !== undefined) {
      updates.push(`terms_and_conditions = $${paramIndex++}`);
      params.push(req.termsAndConditions);
    }
    if (req.privacyPolicy !== undefined) {
      updates.push(`privacy_policy = $${paramIndex++}`);
      params.push(req.privacyPolicy);
    }
    if (req.refundPolicy !== undefined) {
      updates.push(`refund_policy = $${paramIndex++}`);
      params.push(req.refundPolicy);
    }
    if (req.cancellationPolicy !== undefined) {
      updates.push(`cancellation_policy = $${paramIndex++}`);
      params.push(req.cancellationPolicy);
    }
    if (req.communityGuidelines !== undefined) {
      updates.push(`community_guidelines = $${paramIndex++}`);
      params.push(req.communityGuidelines);
    }

    // Safety Settings
    if (req.safetyGuidelines !== undefined) {
      updates.push(`safety_guidelines = $${paramIndex++}`);
      params.push(req.safetyGuidelines);
    }
    if (req.emergencyContactEmail !== undefined) {
      updates.push(`emergency_contact_email = $${paramIndex++}`);
      params.push(req.emergencyContactEmail);
    }
    if (req.emergencyContactPhone !== undefined) {
      updates.push(`emergency_contact_phone = $${paramIndex++}`);
      params.push(req.emergencyContactPhone);
    }
    if (req.safetyTips !== undefined) {
      updates.push(`safety_tips = $${paramIndex++}`);
      params.push(JSON.stringify(req.safetyTips));
    }

    // Social Media
    if (req.socialMedia) {
      if (req.socialMedia.facebookUrl !== undefined) {
        updates.push(`facebook_url = $${paramIndex++}`);
        params.push(req.socialMedia.facebookUrl);
      }
      if (req.socialMedia.instagramUrl !== undefined) {
        updates.push(`instagram_url = $${paramIndex++}`);
        params.push(req.socialMedia.instagramUrl);
      }
      if (req.socialMedia.twitterUrl !== undefined) {
        updates.push(`twitter_url = $${paramIndex++}`);
        params.push(req.socialMedia.twitterUrl);
      }
      if (req.socialMedia.tiktokUrl !== undefined) {
        updates.push(`tiktok_url = $${paramIndex++}`);
        params.push(req.socialMedia.tiktokUrl);
      }
      if (req.socialMedia.linkedinUrl !== undefined) {
        updates.push(`linkedin_url = $${paramIndex++}`);
        params.push(req.socialMedia.linkedinUrl);
      }
      if (req.socialMedia.youtubeUrl !== undefined) {
        updates.push(`youtube_url = $${paramIndex++}`);
        params.push(req.socialMedia.youtubeUrl);
      }
    }

    // Support Contact
    if (req.support) {
      if (req.support.email !== undefined) {
        updates.push(`support_email = $${paramIndex++}`);
        params.push(req.support.email);
      }
      if (req.support.phone !== undefined) {
        updates.push(`support_phone = $${paramIndex++}`);
        params.push(req.support.phone);
      }
      if (req.support.businessHours !== undefined) {
        updates.push(`business_hours = $${paramIndex++}`);
        params.push(req.support.businessHours);
      }
    }

    // App Configuration
    if (req.maintenanceMode !== undefined) {
      updates.push(`maintenance_mode = $${paramIndex++}`);
      params.push(req.maintenanceMode);
    }
    if (req.maintenanceMessage !== undefined) {
      updates.push(`maintenance_message = $${paramIndex++}`);
      params.push(req.maintenanceMessage);
    }
    if (req.minAppVersion !== undefined) {
      updates.push(`min_app_version = $${paramIndex++}`);
      params.push(req.minAppVersion);
    }
    if (req.featuredCategories !== undefined) {
      updates.push(`featured_categories = $${paramIndex++}`);
      params.push(JSON.stringify(req.featuredCategories));
    }

    if (updates.length > 0) {
      updates.push("updated_at = NOW()");
      
      await db.rawQuery(
        `UPDATE platform_settings SET ${updates.join(", ")} WHERE id = 1`,
        ...params
      );

      // Log the change
      await db.exec`
        INSERT INTO admin_audit_log (admin_id, action, target_type, target_id, details)
        VALUES (
          ${auth.userID}, 
          'update_settings', 
          'platform_settings', 
          '1', 
          ${JSON.stringify(req)}
        )
      `;
    }

    return { success: true };
  }
);

// Public endpoint for clients to view policies
export const getPublicPolicies = api(
  { method: "GET", path: "/settings/policies", expose: true },
  async (): Promise<{
    termsAndConditions?: string;
    privacyPolicy?: string;
    refundPolicy?: string;
    cancellationPolicy?: string;
    communityGuidelines?: string;
    safetyGuidelines?: string;
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
  }> => {
    const settings = await db.queryRow<{
      terms_and_conditions: string | null;
      privacy_policy: string | null;
      refund_policy: string | null;
      cancellation_policy: string | null;
      community_guidelines: string | null;
      safety_guidelines: string | null;
      safety_tips: string | null;
      facebook_url: string | null;
      instagram_url: string | null;
      twitter_url: string | null;
      tiktok_url: string | null;
      linkedin_url: string | null;
      youtube_url: string | null;
      support_email: string | null;
      support_phone: string | null;
      business_hours: string | null;
    }>`
      SELECT 
        terms_and_conditions,
        privacy_policy,
        refund_policy,
        cancellation_policy,
        community_guidelines,
        safety_guidelines,
        safety_tips,
        facebook_url,
        instagram_url,
        twitter_url,
        tiktok_url,
        linkedin_url,
        youtube_url,
        support_email,
        support_phone,
        business_hours
      FROM platform_settings
      LIMIT 1
    `;

    if (!settings) {
      return {
        socialMedia: {},
        support: {
          email: "support@braida.co.uk",
          businessHours: "Mon-Fri 9am-6pm GMT",
        },
      };
    }

    let safetyTips: string[] = [];
    try {
      if (settings.safety_tips) {
        safetyTips = typeof settings.safety_tips === 'string' 
          ? JSON.parse(settings.safety_tips) 
          : settings.safety_tips;
      }
    } catch (e) {
      console.error("Error parsing safety_tips:", e);
    }

    return {
      termsAndConditions: settings.terms_and_conditions || undefined,
      privacyPolicy: settings.privacy_policy || undefined,
      refundPolicy: settings.refund_policy || undefined,
      cancellationPolicy: settings.cancellation_policy || undefined,
      communityGuidelines: settings.community_guidelines || undefined,
      safetyGuidelines: settings.safety_guidelines || undefined,
      safetyTips: safetyTips.length > 0 ? safetyTips : undefined,
      socialMedia: {
        facebookUrl: settings.facebook_url || undefined,
        instagramUrl: settings.instagram_url || undefined,
        twitterUrl: settings.twitter_url || undefined,
        tiktokUrl: settings.tiktok_url || undefined,
        linkedinUrl: settings.linkedin_url || undefined,
        youtubeUrl: settings.youtube_url || undefined,
      },
      support: {
        email: settings.support_email || "support@braida.co.uk",
        phone: settings.support_phone || undefined,
        businessHours: settings.business_hours || "Mon-Fri 9am-6pm GMT",
      },
    };
  }
);

