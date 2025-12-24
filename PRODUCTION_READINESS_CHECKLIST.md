# Production Readiness Checklist

This document outlines the requirements and verification steps needed before launching Braida Beauty Marketplace to production.

## 1. Critical TypeScript/Code Fixes ✅ COMPLETED

The following TypeScript issues have been resolved:

- [x] `auth/roles.ts` - Fixed `generateToken` calls to include required `roles` and `activeRole` parameters
- [x] `search/search.ts` - Added explicit type inference for Zod schema validation
- [x] `services/list.ts` - Added explicit type inference for validation
- [x] `services/get.ts` - Added explicit type inference for validation
- [x] `freelancers/get.ts` - Added explicit type inference and proper error throwing
- [x] `search/availability.ts` - Added explicit type inference for validation
- [x] `styles/search_by_style.ts` - Added explicit type inference for validation
- [x] `shared/validation.ts` - Fixed implicit `any` type in error mapping
- [x] `services/schemas.ts` - Fixed implicit `any` type in refine function

## 2. Environment Configuration

### Required Secrets (Encore Cloud / Production)

| Secret | Purpose | Status |
|--------|---------|--------|
| `JWTSecret` | JWT token signing | ⏳ Verify in Encore |
| `StripeSecretKey` | Payment processing | ⏳ Verify in Encore |
| `StripeWebhookSecret` | Stripe webhook verification | ⏳ Verify in Encore |
| `ResendAPIKey` | Email sending via Resend | ⏳ Verify in Encore |
| `MapboxAccessToken` | Geocoding and maps | ⏳ Verify in Encore |
| `VAPIDPublicKey` | Push notifications | ⏳ Verify in Encore |
| `VAPIDPrivateKey` | Push notifications | ⏳ Verify in Encore |
| `VeriffAPIKey` | KYC verification | ⏳ Verify in Encore |
| `VeriffAPISecret` | KYC verification | ⏳ Verify in Encore |

### Frontend Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `VITE_API_URL` | Backend API endpoint | ✅ Yes |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe public key | ✅ Yes |
| `VITE_MAPBOX_ACCESS_TOKEN` | Mapbox token | ⚡ For location features |
| `VITE_ENABLE_PUSH_NOTIFICATIONS` | Enable push notifications | ⚡ Optional |

## 3. Stripe Webhook Configuration

Before production, configure Stripe webhooks:

1. **Create webhook endpoint** in [Stripe Dashboard](https://dashboard.stripe.com/webhooks):
   - URL: `https://your-domain.encr.app/payments/webhook`
   
2. **Select events**:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `checkout.session.completed`
   - `checkout.session.expired`

3. **Copy webhook secret** to Encore secrets:
   ```bash
   encore secret set StripeWebhookSecret --prod
   ```

## 4. Email Configuration (Resend)

1. **Verify domain** in [Resend Dashboard](https://resend.com/domains)
2. **Add DNS records** for SPF, DKIM, and DMARC
3. **Test email delivery**:
   - Registration verification email
   - Password reset email
   - Booking confirmation emails
   - Notification emails

## 5. Testing Checklist

### Authentication Flow
- [ ] User registration (client)
- [ ] User registration (freelancer)
- [ ] Email verification link works
- [ ] Login with verified account
- [ ] Password reset flow
- [ ] JWT token refresh

### Booking Flow
- [ ] Search for services
- [ ] View freelancer profile
- [ ] Create booking
- [ ] Payment processing (test mode)
- [ ] Booking confirmation
- [ ] Booking cancellation
- [ ] Refund processing

### Freelancer Features
- [ ] Create/edit services
- [ ] Set availability
- [ ] Accept/decline bookings
- [ ] View earnings
- [ ] Payout account setup

### Admin Features
- [ ] User management
- [ ] Dispute resolution
- [ ] Payout management
- [ ] Analytics dashboard

## 6. Security Checklist

- [ ] All API endpoints require authentication where appropriate
- [ ] CORS configured correctly
- [ ] Rate limiting in place
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention
- [ ] HTTPS enforced
- [ ] Sensitive data encrypted at rest

## 7. Performance

- [ ] Database indexes optimized
- [ ] API response times < 200ms for common operations
- [ ] Frontend bundle size optimized
- [ ] Images optimized and lazy-loaded
- [ ] CDN configured for static assets

## 8. Monitoring

- [ ] Error tracking configured (e.g., Sentry)
- [ ] Performance monitoring
- [ ] Uptime monitoring
- [ ] Alert notifications for critical issues

## 9. Backup & Recovery

- [ ] Database backups scheduled
- [ ] Backup restoration tested
- [ ] Disaster recovery plan documented

## 10. Launch Preparation

- [ ] All test accounts removed from production
- [ ] Production database migrated
- [ ] DNS configured for custom domain
- [ ] SSL certificates active
- [ ] Legal pages in place (Terms, Privacy Policy)
- [ ] Support email configured
- [ ] Analytics tracking enabled

---

## Quick Verification Commands

### Run Backend Tests (requires Encore CLI)
```bash
cd backend
encore test
```

### Check Frontend Build
```bash
cd frontend
bun install
bun run build
```

### Verify TypeScript
```bash
cd frontend
bun run tsc --noEmit
```

---

## Support

For deployment issues, check:
- [Encore Cloud Dashboard](https://app.encore.dev)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [GitHub Issues](https://github.com/oeolamiju/braida-beauty-marketplace/issues)

