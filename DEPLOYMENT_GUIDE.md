# Braida Beauty Marketplace - Railway Deployment Guide

Deploy both frontend and backend on Railway with PostgreSQL.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [DNS Configuration](#dns-configuration)
5. [Environment Variables](#environment-variables)
6. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Prerequisites

- [Railway](https://railway.app) account (Hobby plan: $5/month)
- [GitHub](https://github.com) account with the repository
- [Cloudflare](https://cloudflare.com) account (for DNS)
- [Stripe](https://stripe.com) account
- [Resend](https://resend.com) account

---

## Quick Start

### 1. Create Railway Project
1. Go to [railway.app/new](https://railway.app/new)
2. Click **"Deploy from GitHub repo"**
3. Select `braida-beauty-marketplace`

### 2. Add PostgreSQL
1. In the project, click **"+ New"** → **"Database"** → **"PostgreSQL"**
2. Wait for it to provision

### 3. Add Backend Service
1. Click **"+ New"** → **"GitHub Repo"** → Select your repo
2. After adding, click on the service
3. Go to **Settings**:
   - **Root Directory**: `backend`
   - **Watch Paths**: `/backend/**`
4. Go to **Variables** and add backend environment variables (see below)

### 4. Add Frontend Service
1. Click **"+ New"** → **"GitHub Repo"** → Select your repo again
2. After adding, click on the service
3. Go to **Settings**:
   - **Root Directory**: `frontend`
   - **Watch Paths**: `/frontend/**`
4. Go to **Variables** and add frontend environment variables (see below)

### 5. Generate Domains
1. Click on each service → **Settings** → **Networking** → **Generate Domain**
2. Note both URLs

### 6. Update Variables
- Update `VITE_API_URL` in frontend to point to backend domain
- Update `APP_URL` in backend to point to frontend domain

---

## Detailed Setup

### Backend Service Configuration

**Settings Tab:**
| Setting | Value |
|---------|-------|
| Root Directory | `backend` |
| Watch Paths | `/backend/**` |
| Build Command | `npm install` |
| Start Command | `npm start` |

**Variables Tab:**
```env
# Database (auto-linked from PostgreSQL service)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Application
APP_URL=https://braida.uk
NODE_ENV=production
PORT=4000

# Authentication
JWT_SECRET=YeshuaAmashiac321

# Email (Resend)
RESEND_API_KEY=<your-resend-api-key>
FROM_EMAIL=noreply@braida.uk

# Payments (Stripe)
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>

# Maps (Mapbox)
MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoibG9pYkdW...

# KYC (Onfido)
ONFIDO_API_KEY=<your-onfido-key>

# KYC (Veriff)
VERIFF_API_KEY=265b537f-4fb5-427a-a3ec-bd187b9565c3
VERIFF_API_SECRET=e867698a-fb68-4131-9a72-9d260b51ff58

# Push Notifications (VAPID)
VAPID_PUBLIC_KEY=BIbn29wEWQt0gv0u1lmDvEaVLn6TG5Ljc-j0a0mtzugL_Y3IKQNAZkf2PTN0B_0U9mu
VAPID_PRIVATE_KEY=kXrFpLXgjGe4tlSqAi9kFo9w4raWKg6mjyh_P6zLwn8
```

### Frontend Service Configuration

**Settings Tab:**
| Setting | Value |
|---------|-------|
| Root Directory | `frontend` |
| Watch Paths | `/frontend/**` |
| Build Command | `npm install && npm run build` |
| Start Command | `npx serve dist -s -l 3000` |

**Variables Tab:**
```env
# API Configuration
VITE_API_URL=https://<backend-service>.up.railway.app
VITE_CLIENT_TARGET=https://<backend-service>.up.railway.app

# Application
VITE_APP_URL=https://braida.uk

# Stripe (Publishable Key)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SJWKzPWaiD9PFTK4WdKZCnEZpjR7eLRsmIBm6y2SrCRZPc7USecnBixQEa9UEjo5lR1IRf6aN4ZBpvM31f4btty00lMWmfykF

# Mapbox
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoibG9pYkdW...

# Features
VITE_ENABLE_PUSH_NOTIFICATIONS=true
VITE_ENABLE_ANALYTICS=true
```

### PostgreSQL Configuration

The PostgreSQL database is automatically provisioned. Railway provides:
- `DATABASE_URL` - Full connection string
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` - Individual values

Use the reference syntax to link to backend:
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

---

## DNS Configuration (Cloudflare)

### Option A: Use Custom Domains in Railway

1. **Backend Custom Domain:**
   - Go to Backend Service → Settings → Networking
   - Add custom domain: `api.braida.uk`
   - Copy the CNAME target Railway provides

2. **Frontend Custom Domain:**
   - Go to Frontend Service → Settings → Networking
   - Add custom domain: `braida.uk` and `www.braida.uk`
   - Copy the CNAME targets

3. **Update Cloudflare DNS:**

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | @ | `<frontend-target>.up.railway.app` | DNS only |
| CNAME | www | `<frontend-target>.up.railway.app` | DNS only |
| CNAME | api | `<backend-target>.up.railway.app` | DNS only |

### Keep Existing Email Records

Don't delete these (for Resend email):
- MX records for `braida.uk`
- MX records for `send`
- TXT records for SPF/DKIM

---

## Environment Variables Reference

### Backend Variables

| Variable | Source | Description |
|----------|--------|-------------|
| DATABASE_URL | Railway PostgreSQL | Database connection |
| APP_URL | Your domain | Frontend URL |
| JWT_SECRET | Your secrets | Auth token signing |
| RESEND_API_KEY | Resend dashboard | Email sending |
| FROM_EMAIL | Resend verified | Sender address |
| STRIPE_SECRET_KEY | Stripe dashboard | Payment processing |
| STRIPE_WEBHOOK_SECRET | Stripe webhooks | Webhook verification |
| MAPBOX_ACCESS_TOKEN | Mapbox account | Geocoding/maps |
| ONFIDO_API_KEY | Onfido dashboard | KYC verification |
| VERIFF_API_KEY | Veriff dashboard | KYC verification |
| VERIFF_API_SECRET | Veriff dashboard | KYC verification |
| VAPID_PUBLIC_KEY | Generated | Push notifications |
| VAPID_PRIVATE_KEY | Generated | Push notifications |

### Frontend Variables

| Variable | Description |
|----------|-------------|
| VITE_API_URL | Backend API URL |
| VITE_CLIENT_TARGET | Backend target (same as API_URL) |
| VITE_APP_URL | Frontend URL |
| VITE_STRIPE_PUBLISHABLE_KEY | Stripe public key |
| VITE_MAPBOX_ACCESS_TOKEN | Mapbox token |

---

## Post-Deployment Checklist

### ✅ Verify Services
- [ ] Backend is running: Visit `https://api.braida.uk/health/check`
- [ ] Frontend is running: Visit `https://braida.uk`
- [ ] Database connected: Check Railway logs

### ✅ Test Authentication
- [ ] Registration works
- [ ] Verification email received
- [ ] Login works
- [ ] Password reset works

### ✅ Configure Stripe Webhooks
1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://api.braida.uk/payments/webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copy webhook secret → Update `STRIPE_WEBHOOK_SECRET` in Railway

### ✅ Test Payments
- [ ] Create test booking
- [ ] Payment processes
- [ ] Webhook received

### ✅ SSL/Security
- [ ] HTTPS working on all domains
- [ ] No mixed content warnings

---

## Troubleshooting

### Build Failing
```bash
# Check Railway build logs
# Common issues:
# - Missing dependencies in package.json
# - Incorrect root directory
# - Build command errors
```

### API Connection Errors
1. Check `VITE_API_URL` is correct
2. Check backend service is running
3. Check for CORS errors in browser console

### Database Errors
1. Verify `DATABASE_URL` is linked correctly
2. Check PostgreSQL service is running
3. Run migrations if needed

### Email Not Sending
1. Verify Resend API key is correct
2. Check Resend dashboard for delivery status
3. Ensure domain is verified in Resend

---

## Cost Estimate (Railway Hobby Plan)

| Resource | Cost |
|----------|------|
| Base plan | $5/month credit |
| Backend service | ~$2-5/month |
| Frontend service | ~$1-2/month |
| PostgreSQL | ~$1-3/month |
| **Total** | **~$5-10/month** |

The Hobby plan's $5 credit often covers small projects!

---

## Support

- **Railway Docs**: https://docs.railway.app
- **GitHub Issues**: https://github.com/oeolamiju/braida-beauty-marketplace/issues
- **Email**: support@braida.uk
