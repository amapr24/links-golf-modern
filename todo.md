# Links Golf Modern — Project TODO

## Batch D — Payments & Membership Management

### Core Payment Infrastructure
- [x] Stripe sandbox provisioned and environment variables configured
- [x] Database schema: `members` table with Stripe identifiers and membership status
- [x] Backend Stripe helpers: `products.ts`, `checkout.ts`, `webhook.ts`
- [x] Database query helpers: `getMemberByUserId`, `getMemberByStripeCustomerId`, `upsertMember`
- [x] Webhook handler: processes `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`
- [x] tRPC procedure: `member.createCheckout` for initiating checkout sessions
- [x] Unit tests: webhook event handling (5 tests) and database operations
- [x] Webhook route: `/api/stripe/webhook` Express endpoint to receive Stripe events

### Frontend Payment Flow (Completed)
- [x] Pricing section: add "Subscribe Now" / "Buy Once" buttons that trigger checkout
- [x] Checkout modal or redirect: call `trpc.member.createCheckout` and open Stripe session URL
- [x] Success page: display membership confirmation and digital member card
- [x] Member dashboard: show subscription status, renewal date, payment history
- [x] tRPC procedures: `paymentHistory`, `subscriptionStatus`, `cancelSubscription`
- [x] PaymentHistory component: display invoices and subscription status

### Payment Testing & Validation
- [ ] Test card: 4242 4242 4242 4242 (Stripe test mode)
- [ ] Verify checkout flow end-to-end (login → pricing → checkout → success)
- [ ] Verify webhook delivery and member record updates
- [ ] Test subscription renewal flow
- [ ] Test cancellation flow

---

## Batch C — Member Dashboard (Completed)
- [x] Member session: server-signed JWT in httpOnly cookie
- [x] Member profile: fetch from Supabase with service role
- [x] Dashboard layout: display member info, membership status, digital card
- [x] Logout: clear session cookie and redirect

---

## Batch B — OTP & Authentication (Completed)
- [x] OTP generation and storage (Redis or in-memory)
- [x] OTP rate limiting: per-email and per-IP
- [x] Welcome email: sent once per email address after successful OTP verification
- [x] Database welcome tracking: `welcome_email_sent_at` column
- [x] Supabase integration: fetch member welcome fields with service role

---

## Batch A — Marketing & Bilingual (Completed)
- [x] Hero section with golf course background and immersive overlay
- [x] Benefits section highlighting membership value
- [x] Courses section with 15 partner courses and interactive map
- [x] How it works section with step-by-step flow
- [x] Pricing section with membership options
- [x] FAQ section with common questions
- [x] Footer with links and support info
- [x] Bilingual support (English/Spanish) with language toggle
- [x] Responsive design: mobile-first, tablet, desktop
- [x] Legal pages: Terms of Service, Privacy Policy, Refund Policy
- [x] Open Graph and Twitter meta tags for social sharing
- [x] Public marketing routes (no OAuth gate)

---

## Known Issues & Follow-ups
- [ ] Stripe sandbox must be claimed at https://dashboard.stripe.com/claim_sandbox/... before 2026-07-12
- [ ] Once live keys are available, update Settings → Payment with production credentials
- [ ] Test 99% discount promo code in live mode
- [ ] Minimum transaction: $0.50 USD in Stripe (smaller amounts may fail)
- [ ] Course coordinates: verify remaining courses on satellite map (especially resorts)

---

## Design & Polish (Future)
- [ ] Member card animation and interactions
- [ ] Checkout form styling and validation
- [ ] Success page celebration animation
- [ ] Email template improvements
- [ ] Mobile-specific optimizations
- [ ] Accessibility audit (WCAG 2.1 AA)

---

## Deployment & Go-Live
- [ ] Final QA pass on all flows
- [ ] Stripe KYC verification and live key activation
- [ ] Domain setup: linksgolfpr.com (or similar)
- [ ] Analytics integration
- [ ] Monitoring and error tracking
- [ ] Launch announcement

## Bug Fixes (Current Sprint)
- [x] Add missing translation keys: pricing.annualMembership, pricing.paymentMethodDesc, pricing.subscribeNow, pricing.buyOnceNow, pricing.securedByStripe
- [x] Fix: Create success page or handle Stripe redirect properly (404 after checkout success)
- [x] Remove redundant "Select your payment method" section from payment step (Stripe handles this)
- [x] Remove auto-redirect from success page (keep manual button click only)
- [x] Auto-login after checkout: create session and redirect to dashboard
- [x] Secure auto-login: verify Stripe checkout session before creating member session
- [x] DEBUG: Fix auto-login session creation failure after Stripe checkout (localStorage cross-window issue resolved)

## Courses Section Layout Improvements
- [x] Make map container more rectangular (echo Puerto Rico's shape)
- [x] Reposition scroll indicator carats to bottom edge of course pills
- [x] Remove popup/modal on map marker click (cards always visible)
- [x] Expand desktop pills to show full directory info (holes, discount %, location)

## Courses Section Refinements (Round 2)
- [x] Reclassify Palmas Del Mar as Semi-Private (remove Country Club from filters)
- [x] Remove faded bar above scroll indicator at bottom of course list
- [x] Remove course type from pills (filters handle that)
- [x] Reduce discount badge prominence on pills
- [x] Make pills narrower
- [x] Simplify map hover tooltip to show only course name
- [x] Add mobile padding so section doesn't span full screen width

## Design Polish (Current Sprint)
- [x] Smooth background transitions between Benefits, Courses, How It Works, and Pricing sections
- [x] Redesign Why Join (Benefits) section — layout, typography, visual style
- [x] Remove redundant "15 courses" mentions in Courses section header/subtext
- [x] Make courses pill list scroll indicator background fully transparent
