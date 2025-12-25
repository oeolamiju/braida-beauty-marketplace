# Platform Settings Integration Guide

## Overview
Platform settings are now centrally managed through the admin panel and automatically distributed across the frontend application.

## Backend Implementation

### Database Schema
- **Table**: `platform_settings` (migration 045)
- **Location**: `/backend/db/migrations/045_platform_settings.up.sql`

### API Endpoints

#### Admin Endpoints (Authenticated)
```typescript
// Get all platform settings (admin only)
GET /admin/settings/platform
Response: PlatformSettings

// Update platform settings (admin only)
PUT /admin/settings/platform
Request: UpdatePlatformSettingsRequest
Response: { success: boolean }
```

#### Public Endpoint
```typescript
// Get public platform policies and settings
GET /settings/policies
Response: {
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
}
```

### Files
- **Service**: `/backend/admin/settings_enhanced.ts`
- **Exports**:
  - `getSettings()` - Admin-only endpoint
  - `updateSettings()` - Admin-only endpoint
  - `getPublicPolicies()` - Public endpoint

## Frontend Implementation

### Core Hook
**File**: `/frontend/hooks/usePlatformSettings.ts`

```typescript
import { usePlatformSettings } from "@/hooks/usePlatformSettings";

function MyComponent() {
  const { settings, loading, error, reload } = usePlatformSettings();
  
  // Use settings
  const supportEmail = settings?.support.email || "support@braida.co.uk";
  const facebookUrl = settings?.socialMedia.facebookUrl;
  
  return (
    <div>
      <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
    </div>
  );
}
```

### Reusable Components

#### SocialMediaLinks Component
**File**: `/frontend/components/SocialMediaLinks.tsx`
- Automatically renders social media icons based on configured URLs
- Hides if no social media links are configured
- Used in footers and social sections

```tsx
import SocialMediaLinks from "@/components/SocialMediaLinks";

<SocialMediaLinks />
```

#### Footer Component
**File**: `/frontend/components/Footer.tsx`
- Centralized footer with dynamic settings
- Includes social media links, support contact, and business hours
- Used across public pages

```tsx
import Footer from "@/components/Footer";

<Footer />
```

## Settings Categories

### 1. Cancellation & Refund Policies
**Backend Location**: `backend/admin/settings_enhanced.ts`
```typescript
cancellationWindows: {
  fullRefundHours: number;      // Default: 48
  partialRefundHours: number;   // Default: 24
  partialRefundPercent: number; // Default: 50
}
```

**Frontend Usage**:
- Booking flow cancellation policy display
- Service detail pages
- FAQ and help center

### 2. Payment & Fee Settings
```typescript
commissionPercent: number;      // Default: 10
bookingFeePence: number;        // Default: 200 (£2.00)
```

**Frontend Usage**:
- Price calculations
- Booking checkout
- Freelancer earnings display

### 3. Timeouts
```typescript
acceptanceTimeoutHours: number;     // Default: 24
autoConfirmTimeoutHours: number;    // Default: 72
disputeWindowDays: number;          // Default: 14
```

**Frontend Usage**:
- Booking status displays
- Countdown timers
- Help text and tooltips

### 4. Payout Settings
```typescript
defaultPayoutSchedule: "weekly" | "biweekly" | "per_transaction";
minimumPayoutPence: number;  // Default: 1000 (£10.00)
```

**Frontend Usage**:
- Freelancer payout setup
- Earnings dashboard
- Payout history

### 5. Legal Content
```typescript
termsAndConditions?: string;
privacyPolicy?: string;
refundPolicy?: string;
cancellationPolicy?: string;
communityGuidelines?: string;
```

**Frontend Usage**:
- Terms of Service page
- Privacy Policy page
- Inline policy displays during signup/booking

### 6. Safety Settings
```typescript
safetyGuidelines?: string;
emergencyContactEmail?: string;
emergencyContactPhone?: string;
safetyTips?: string[];
```

**Frontend Usage**:
- **Connected**: `/frontend/pages/SafetyPage.tsx` - Displays emergency contacts
- Safety Center
- Help documentation
- Emergency contact displays

### 7. Social Media
```typescript
socialMedia: {
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  tiktokUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
}
```

**Frontend Usage**:
- **Connected**: `/frontend/components/SocialMediaLinks.tsx` - Renders all social icons
- **Connected**: `/frontend/pages/LandingPage.tsx` - Uses SocialMediaLinks component
- Footer social links
- Share buttons
- Social proof sections

### 8. Support Contact
```typescript
support: {
  email?: string;           // Default: "support@braida.co.uk"
  phone?: string;
  businessHours?: string;   // Default: "Mon-Fri 9am-6pm GMT"
}
```

**Frontend Usage**:
- **Connected**: `/frontend/pages/ContactPage.tsx` - Displays support email and phone
- **Connected**: `/frontend/pages/SafetyPage.tsx` - Shows support contact
- Contact page
- Footer
- Help sections
- Email mailto links

### 9. App Configuration
```typescript
maintenanceMode: boolean;
maintenanceMessage?: string;
minAppVersion?: string;
featuredCategories?: string[];
```

**Frontend Usage**:
- Maintenance mode banner
- App version checking
- Featured categories on homepage

## Pages Using Platform Settings

### Public Pages
1. **Landing Page** (`/frontend/pages/LandingPage.tsx`)
   - Social media links
   - Support information in footer

2. **Contact Page** (`/frontend/pages/ContactPage.tsx`) ✅ CONNECTED
   - Support email
   - Support phone
   - Business hours

3. **Safety Page** (`/frontend/pages/SafetyPage.tsx`) ✅ CONNECTED
   - Emergency contact email
   - Emergency contact phone
   - Safety guidelines
   - Safety tips

4. **Terms of Service** (`/frontend/pages/TermsPage.tsx`)
   - Dynamic terms content (hardcoded currently)
   - Support email references

5. **Privacy Policy** (`/frontend/pages/PrivacyPage.tsx`)
   - Dynamic privacy policy content (hardcoded currently)
   - Support email references

### Admin Pages
1. **Platform Settings** (`/frontend/pages/admin/PlatformSettings.tsx`)
   - Full settings editor
   - All configuration options
   - Rich text editing for policies

## Default Values

All settings have sensible defaults configured in the backend:

```typescript
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
```

## Admin Configuration Guide

### Accessing Platform Settings
1. Log in as admin
2. Navigate to `/admin/settings` or `/admin/platform-settings`
3. Use the tabbed interface to configure different sections:
   - **Policies**: Legal content and cancellation policies
   - **Safety**: Safety guidelines and emergency contacts
   - **Payment**: Fees, commissions, and payout settings
   - **Social**: Social media links
   - **Support**: Support contact information
   - **App**: Maintenance mode and app configuration

### Updating Settings
1. Make changes in the relevant tab
2. Click "Save All Changes" at the top or bottom
3. Changes are immediately reflected across the platform
4. All changes are logged in the admin audit log

### Best Practices
1. **Legal Content**: Always review with legal counsel before updating
2. **Emergency Contacts**: Ensure these are monitored 24/7
3. **Social Media**: Verify URLs are correct and public
4. **Maintenance Mode**: Notify users before enabling
5. **Fee Changes**: Document changes and notify affected users

## Database Seeding

To initialize platform settings with defaults:
```sql
INSERT INTO platform_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;
```

This will use all default values from the backend code.

## Testing Platform Settings

### Manual Testing
1. Update settings in admin panel
2. Verify changes appear on:
   - Contact page (support email/phone)
   - Safety page (emergency contacts)
   - Footer (social media, support)
   - Landing page (social media)

### Automated Testing
Consider adding tests for:
- Settings fetch on page load
- Fallback to defaults when settings unavailable
- Social media links only render when URLs present
- Support contact updates across all pages

## Future Enhancements

### Recommended Additions
1. **Content Versioning**: Track changes to legal policies
2. **Scheduled Updates**: Schedule settings changes for future dates
3. **Multi-language Support**: Translate policies and guidelines
4. **A/B Testing**: Test different cancellation policies
5. **Region-Specific Settings**: Different settings per country/region
6. **Email Templates**: Manage email templates through settings
7. **SMS Templates**: Configure notification messages
8. **Branding**: Logo, colors, and theme configuration

## Troubleshooting

### Settings Not Loading
1. Check backend API is accessible: `GET /settings/policies`
2. Verify database has settings row: `SELECT * FROM platform_settings WHERE id = 1`
3. Check browser console for errors
4. Verify `usePlatformSettings` hook is imported correctly

### Settings Not Updating
1. Check admin permissions (RBAC)
2. Verify update request completes successfully
3. Check admin audit log for the update action
4. Clear browser cache and reload

### Missing Social Media Icons
1. Verify URLs are set in platform settings
2. Check `SocialMediaLinks` component is imported
3. Ensure URLs are complete (include https://)

## Security Considerations

1. **Admin-Only Access**: Settings update endpoints require admin role
2. **Public Endpoint**: Only non-sensitive data exposed publicly
3. **Audit Logging**: All changes logged with admin ID and timestamp
4. **Input Validation**: All settings validated before saving
5. **XSS Protection**: Rich text content sanitized on display

## Migration Path

### Existing Hardcoded Values
If you have hardcoded support emails, social links, or policy content:

1. Identify all hardcoded instances
2. Replace with `usePlatformSettings()` hook
3. Migrate content to database via admin panel
4. Remove hardcoded values
5. Test thoroughly

### Example Migration
```typescript
// Before
<a href="mailto:support@braida.co.uk">support@braida.co.uk</a>

// After
const { settings } = usePlatformSettings();
<a href={`mailto:${settings?.support.email || "support@braida.co.uk"}`}>
  {settings?.support.email || "support@braida.co.uk"}
</a>
```

## Conclusion

Platform settings are now centrally managed and dynamically distributed across the application. This provides:
- ✅ Single source of truth for configuration
- ✅ Easy updates without code changes
- ✅ Consistent branding and messaging
- ✅ Audit trail for all changes
- ✅ Fallback defaults for reliability

All new pages and components should use the `usePlatformSettings()` hook for any configurable content.
