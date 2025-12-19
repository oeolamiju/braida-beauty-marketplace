# Braida Beauty Marketplace - Deployment Guide

This guide covers deploying Braida Beauty Marketplace using **Railway** (backend) and **Vercel** (frontend).

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Deployment (Railway)](#backend-deployment-railway)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [DNS Configuration (Cloudflare)](#dns-configuration-cloudflare)
5. [Environment Variables](#environment-variables)
6. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Prerequisites

Before starting, ensure you have:
- [GitHub](https://github.com) account with the repository
- [Railway](https://railway.app) account
- [Vercel](https://vercel.com) account
- [Cloudflare](https://cloudflare.com) account (for DNS management)
- [Stripe](https://stripe.com) account (for payments)
- [Resend](https://resend.com) account (for emails)

---

## Backend Deployment (Railway)

### Step 1: Create Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Connect your GitHub account and select `braida-beauty-marketplace`
5. Railway will auto-detect the monorepo structure

### Step 2: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will create a PostgreSQL instance
4. Copy the `DATABASE_URL` from the database settings

### Step 3: Configure Backend Service

1. Click on the backend service in Railway
2. Go to **"Settings"** tab
3. Set the **Root Directory** to `backend`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `encore run`

### Step 4: Add Environment Variables

In Railway, go to **"Variables"** tab and add:

```
DATABASE_URL=<from PostgreSQL service>
APP_URL=https://braida.uk
JWT_SECRET=<generate a secure 32+ character string>
RESEND_API_KEY=<your Resend API key>
FROM_EMAIL=noreply@braida.uk
STRIPE_SECRET_KEY=<your Stripe secret key>
STRIPE_WEBHOOK_SECRET=<your Stripe webhook secret>
MAPBOX_ACCESS_TOKEN=<your Mapbox token>
ONFIDO_API_KEY=<your Onfido API key>
VERIFF_API_KEY=<your Veriff API key>
VERIFF_API_SECRET=<your Veriff API secret>
VAPID_PUBLIC_KEY=<your VAPID public key>
VAPID_PRIVATE_KEY=<your VAPID private key>
NODE_ENV=production
PORT=4000
```

### Step 5: Deploy

1. Railway will auto-deploy on push to main branch
2. Or click **"Deploy"** to manually trigger deployment
3. Wait for the build to complete
4. Note your Railway domain (e.g., `braida-api.up.railway.app`)

### Step 6: Custom Domain (Optional)

1. Go to **"Settings"** → **"Domains"**
2. Add custom domain: `api.braida.uk`
3. Railway will provide CNAME record to add to Cloudflare

---

## Frontend Deployment (Vercel)

### Step 1: Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import from GitHub: `braida-beauty-marketplace`

### Step 2: Configure Project

1. Set **Framework Preset**: Vite
2. Set **Root Directory**: `frontend`
3. Set **Build Command**: `npm run build`
4. Set **Output Directory**: `dist`

### Step 3: Add Environment Variables

Add these variables in Vercel:

```
VITE_API_URL=https://api.braida.uk
VITE_CLIENT_TARGET=https://api.braida.uk
VITE_APP_URL=https://braida.uk
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
VITE_MAPBOX_ACCESS_TOKEN=pk.xxxxx
VITE_ENABLE_PUSH_NOTIFICATIONS=true
VITE_ENABLE_ANALYTICS=true
```

### Step 4: Deploy

1. Click **"Deploy"**
2. Vercel will build and deploy automatically
3. Note your Vercel domain (e.g., `braida-beauty-marketplace.vercel.app`)

### Step 5: Custom Domain

1. Go to **"Settings"** → **"Domains"**
2. Add: `braida.uk` and `www.braida.uk`
3. Vercel will provide records to add to Cloudflare

---

## DNS Configuration (Cloudflare)

### For Frontend (braida.uk)

Add these DNS records in Cloudflare:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | @ | cname.vercel-dns.com | DNS only |
| CNAME | www | cname.vercel-dns.com | DNS only |

### For Backend API (api.braida.uk)

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | api | <railway-domain>.up.railway.app | DNS only |

### Existing Records (Keep These)

Your current email records should remain:
- MX records for `braida.uk` → `inbound-smtp...`
- MX records for `send` → `feedback-smtp...`
- TXT records for SPF/DKIM

---

## Environment Variables

### Backend Variables (Railway)

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection | postgresql://... |
| APP_URL | Frontend URL | https://braida.uk |
| JWT_SECRET | Auth token secret | random-32-chars |
| RESEND_API_KEY | Email API key | re_xxxxx |
| FROM_EMAIL | Sender email | noreply@braida.uk |
| STRIPE_SECRET_KEY | Stripe secret | sk_live_xxxxx |
| STRIPE_WEBHOOK_SECRET | Webhook secret | whsec_xxxxx |
| MAPBOX_ACCESS_TOKEN | Maps token | pk.xxxxx |
| ONFIDO_API_KEY | KYC API key | api_live_xxxxx |
| VERIFF_API_KEY | KYC API key | xxxxx |
| VERIFF_API_SECRET | KYC secret | xxxxx |
| VAPID_PUBLIC_KEY | Push notifications | xxxxx |
| VAPID_PRIVATE_KEY | Push notifications | xxxxx |

### Frontend Variables (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | https://api.braida.uk |
| VITE_CLIENT_TARGET | Backend target | https://api.braida.uk |
| VITE_APP_URL | Frontend URL | https://braida.uk |
| VITE_STRIPE_PUBLISHABLE_KEY | Stripe public key | pk_live_xxxxx |
| VITE_MAPBOX_ACCESS_TOKEN | Maps token | pk.xxxxx |

---

## Post-Deployment Checklist

### 1. Verify Deployment
- [ ] Backend health check: `https://api.braida.uk/health/check`
- [ ] Frontend loads: `https://braida.uk`
- [ ] API connectivity from frontend

### 2. Test Authentication
- [ ] Registration works
- [ ] Verification email received
- [ ] Login works
- [ ] Password reset works

### 3. Configure Stripe Webhooks
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://api.braida.uk/payments/webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
4. Copy webhook secret to Railway environment variables

### 4. Test Payment Flow
- [ ] Can create booking with payment
- [ ] Payment processes successfully
- [ ] Webhook receives events

### 5. Configure Email
- [ ] Verification emails arrive
- [ ] Password reset emails arrive
- [ ] Booking notification emails arrive

### 6. SSL/Security
- [ ] HTTPS working on both domains
- [ ] No mixed content warnings
- [ ] CORS configured correctly

---

## Troubleshooting

### Backend Not Starting
- Check Railway logs for errors
- Verify all environment variables are set
- Ensure DATABASE_URL is correct

### Frontend API Errors
- Check browser console for CORS errors
- Verify VITE_API_URL is correct
- Check network tab for failed requests

### Emails Not Sending
- Verify RESEND_API_KEY is correct
- Check Resend dashboard for delivery status
- Ensure FROM_EMAIL domain is verified

### Stripe Webhooks Failing
- Check Stripe dashboard for webhook logs
- Verify STRIPE_WEBHOOK_SECRET matches
- Ensure endpoint URL is correct

---

## Cost Estimates

### Railway (Backend)
- Starter: $5/month credit (covers small projects)
- Pro: $20/month + usage

### Vercel (Frontend)
- Hobby: Free (personal projects)
- Pro: $20/month (commercial)

### Total Estimated Cost
- Small project: ~$5-25/month
- Growing business: ~$50-100/month

---

## Support

For issues or questions:
- GitHub Issues: [Repository Issues](https://github.com/oeolamiju/braida-beauty-marketplace/issues)
- Email: support@braida.uk

