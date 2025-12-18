# Email Verification Setup Guide

## Overview
The Braida Beauty Marketplace uses email verification to ensure user accounts are valid. This guide explains how to configure email verification for your deployment.

## Required Secrets

You need to configure two secrets for email verification to work:

### 1. AppURL
The base URL where your frontend application is deployed.

**For Leap Preview:**
```
https://braida-beauty-marketplace-d50ae8k82vjju34hfq70.lp.dev
```

**To configure:**
1. Open Settings in the Leap sidebar
2. Add a new secret named `AppURL`
3. Set the value to your frontend URL (without trailing slash)

### 2. ResendAPIKey
API key from Resend.com for sending transactional emails.

**To get your API key:**
1. Sign up at https://resend.com
2. Navigate to API Keys in your dashboard
3. Create a new API key
4. Copy the API key

**To configure:**
1. Open Settings in the Leap sidebar
2. Add a new secret named `ResendAPIKey`
3. Paste your Resend API key as the value

## Email Verification Flow

1. **User Registration:**
   - User registers with email and password
   - System generates a verification token
   - Verification email is sent to user's email address
   - User is redirected to verification page

2. **Verification Email:**
   - Contains a clickable link with verification token
   - Link format: `{AppURL}/auth/verify?token={token}`
   - Token expires after 24 hours

3. **Email Verification:**
   - User clicks link in email
   - System validates token
   - User account is marked as verified
   - User is logged in automatically
   - User is redirected to their dashboard

4. **Resending Verification:**
   - Users can request a new verification email
   - Available via the "Resend Verification" button on the verification banner
   - Old tokens are invalidated when new one is generated

## Testing Without Email

During development, if you don't have email configured:

1. The system will log warnings but won't fail
2. Check the backend logs for verification tokens
3. You can manually verify users in the database:
   ```sql
   UPDATE users SET is_verified = true WHERE email = 'user@example.com';
   ```

## Email Templates

The system uses these email templates:

- **Verification Email**: Sent when user registers
- **Password Reset Email**: Sent when user requests password reset
- **Resend Verification Email**: Sent when user requests new verification link

All emails are branded with Braida styling and include:
- Clear call-to-action button
- Fallback link for copying
- Expiration notice
- Footer with branding

## Troubleshooting

### Email Not Sending
- Check that `ResendAPIKey` secret is configured correctly
- Verify your Resend account is active
- Check Resend dashboard for failed sends
- Review backend logs for error messages

### Verification Link Not Working
- Check that `AppURL` secret matches your deployment URL
- Ensure token hasn't expired (24 hour limit)
- Verify token wasn't already used
- Check for typos in the URL

### User Can't Access Features
- Ensure user clicked verification link
- Check `is_verified` field in database
- Review middleware requirements for endpoints
- Look for permission_denied errors in logs

## Security Notes

- Verification tokens expire after 24 hours
- Used tokens cannot be reused
- Tokens are invalidated when new ones are generated
- JWT tokens include verification status
- Protected endpoints check verification status via middleware
