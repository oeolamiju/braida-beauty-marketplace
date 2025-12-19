# Environment Variables Configuration

This document lists all required environment variables for the Braida Beauty Marketplace.

## Required Secrets (Encore)

Set these in your Encore dashboard or local secrets file:

### Application Configuration
```
AppURL=https://braida.uk                    # Production domain
```

### Authentication
```
JWTSecret=<32+ character random string>     # openssl rand -base64 32
```

### Payment Processing (Stripe)
```
StripeSecretKey=sk_live_...                 # From Stripe dashboard
StripePublishableKey=pk_live_...            # For frontend
StripeWebhookSecret=whsec_...               # Webhook signing secret
```

### Email Service (Resend)
```
ResendAPIKey=re_...                         # From Resend dashboard
```

### Maps & Geocoding (Mapbox)
```
MapboxAPIKey=pk.eyJ1...                     # From Mapbox account
```

### KYC Verification (Veriff) - Optional
```
VeriffApiKey=<api key>                      # From Veriff dashboard
VeriffApiSecret=<api secret>                # Shared secret for webhook signature
```

### Push Notifications - Optional
```
VapidPublicKey=<vapid public key>           # npx web-push generate-vapid-keys
VapidPrivateKey=<vapid private key>
```

## Frontend Environment Variables (.env)

Create a `.env` file in the `frontend/` directory:

```env
VITE_APP_URL=http://localhost:5173
VITE_API_URL=http://localhost:4000
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Development Setup

1. Copy this template and fill in values
2. For Encore secrets, use `encore secret set <NAME>`
3. For frontend, create `frontend/.env` file
4. Never commit actual secrets to version control

## Validation

The backend validates required secrets on startup. Missing required secrets will:
- Log an error in development
- Prevent startup in production

