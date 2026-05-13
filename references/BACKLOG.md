# Engineering backlog

Inventory of **implemented behavior** (with file links), **deployment checklists**, and **open engineering** work. Roadmap batches: [`BATCHES.md`](BATCHES.md).

## Open engineering (at a glance)

| Area | What’s still open |
|------|-------------------|
| **Resend / OTP** | Automated or manual **E2E** (OTP → cookie → `member.me` / dashboard, Resend, Redis, multi-replica); **renewal / lifecycle emails** (product + data + scheduler, later); **optional** OTP rate-limit env tuning once you have telemetry. |
| **Courses map** | **Optional polish (remaining):** richer branded pin art, styled rich hover on pins, extra click-card breakpoint QA if issues show up. *(Shipped: teardrop SVG pins, responsive map height, larger detail close control, improved mobile controls in §02.)* |
| **Marketing** | **Featured / social proof** row (testimonials, logos, press) if you want more than the stats strip. *(Shipped: trust stats strip before pricing; §02 touch targets, scroll, directory link to `lg`.)* |
| **Sign-up / card** | **Stripe** checkout; **recovery** if the user closes the tab between payment and photo; deeper **card polish**; **official** Apple / Google wallet marks when you have brand assets. *(Shipped: “Links Golf Membership” wordmark on the digital card; wallet CTAs with generic Wallet / Smartphone icons.)* |

Everything else called out in the sections below is either **done in repo** or an **ops/configure** reminder (not a missing feature).

---

## Resend / member OTP

### Implemented in code

- **Member dashboard (`member.me`)** — [`trpc.member.me`](../server/routers.ts) loads the signed-in member from Supabase via [`fetchMemberProfileForSession`](../server/memberProfileFromDb.ts) (same **`SUPABASE_SERVICE_ROLE_KEY`** requirement as welcome). [`Dashboard`](../client/src/pages/Dashboard.tsx) uses `member.session` + `member.me`; shows retry UI if profile is unavailable. [`Login`](../client/src/pages/Login.tsx) invalidates `member.me` after OTP success.
- **OTP storage** — [`server/otpStore.ts`](../server/otpStore.ts): uses **`REDIS_URL`** with `SETEX` when set; otherwise a **process-wide in-memory `Map`** with 10-minute TTL (fixes the old per-request `Map` bug). Vitest forces in-memory store (`VITEST` / `NODE_ENV=test`).
- **sendOtp rate limits** — [`server/sendOtpRateLimit.ts`](../server/sendOtpRateLimit.ts): fixed-window counters **per email** and **per client IP** before calling Resend; uses **`REDIS_URL`** when set (same client as OTP store), otherwise an in-process `Map`. Defaults: **15 min** window, **4** sends/email/window, **20** sends/IP/window. Override with **`SEND_OTP_RATE_WINDOW_MS`**, **`SEND_OTP_MAX_PER_EMAIL_PER_WINDOW`**, **`SEND_OTP_MAX_PER_IP_PER_WINDOW`**. Client IP from `x-forwarded-for` (first hop) then Express `req.ip` / socket ([`getRequestClientIp`](../server/sendOtpRateLimit.ts)).
- **Server-side verify** — [`server/routers.ts`](../server/routers.ts) `member.verifyOtp` calls `verifyAndConsumeOtp` (one-time use).
- **Login flow** — [`client/src/pages/Login.tsx`](../client/src/pages/Login.tsx) calls `trpc.member.verifyOtp` with **email + OTP only**; no `login_otp` in localStorage.
- **Verify hardening (no client `memberId`)** — After a valid OTP, [`resolveMemberIdFromEmail`](../server/memberWelcomeFromDb.ts) loads `members.id` with the service role; the session JWT `sub` is that id only. Vitest: [`server/member.verifyOtp.test.ts`](../server/member.verifyOtp.test.ts).
- **Member session** — After OTP success, server sets httpOnly cookie `links_member_session` with a **signed JWT** ([`server/memberJwt.ts`](../server/memberJwt.ts)); [`trpc.member.session`](../server/routers.ts) / [`member.logout`](../server/routers.ts); client gates via [`useHasMemberSession`](../client/src/hooks/useHasMemberSession.ts) and [`Dashboard`](../client/src/pages/Dashboard.tsx). [`MEMBER_SESSION_COOKIE`](../shared/const.ts) in shared const.
- **Welcome email (once per address)** — [`server/welcomeEmailOnce.ts`](../server/welcomeEmailOnce.ts): Redis key `links:welcome:sent:{email}` or in-memory `Set` after Resend succeeds. **Additionally**, when the service role loads the member row, [`fetchMemberWelcomeFields`](../server/memberWelcomeFromDb.ts) reads **`welcome_email_sent_at`**; if set, welcome is skipped. After a successful send, [`markWelcomeEmailSentAtMember`](../server/memberWelcomeFromDb.ts) updates that column. **Production Supabase:** migration [`001_members_welcome_email_sent_at.sql`](../references/migrations/supabase/001_members_welcome_email_sent_at.sql) is applied. Other environments should run the same SQL; until then, the server retries a select without that column and relies on Redis/memory only for that leg.
- **Trust proxy** — [`server/_core/index.ts`](../server/_core/index.ts) reads **`TRUST_PROXY`** (`1`, `true`, or hop count) and sets Express [`trust proxy`](https://expressjs.com/en/guide/behind-proxies.html). IP-based limits still use the first `x-forwarded-for` hop in [`getRequestClientIp`](../server/sendOtpRateLimit.ts); validate behavior for your edge.

### Deploy / configure (each environment)

Not missing code — set variables and validate behavior where noted. Full table: [`references/ENVIRONMENT.md`](./ENVIRONMENT.md).

1. **`RESEND_API_KEY`** — Required for OTP and welcome email delivery; otherwise sends are skipped / fail closed.
2. **`REDIS_URL`** — Use when running **more than one Node process** (OTP store, rate limits, welcome dedupe). Single-process in-memory fallback is not shared across replicas.
3. **`MEMBER_JWT_SECRET`** — **Required in production** (min ~32 chars) for signing the member session cookie.
4. **`SUPABASE_SERVICE_ROLE_KEY`** (+ `SUPABASE_URL` or `VITE_SUPABASE_URL`) — Optional for OTP alone; **required** for welcome-from-DB, `welcome_email_sent_at`, **`member.me`**, and verify-time member resolution.
5. **`TRUST_PROXY`** — Set when the app sits behind a load balancer or CDN so `trust proxy` matches your topology; confirm client IP and rate limits match expectations.

### Open follow-up

1. **E2E** — Manual or automated: OTP path, httpOnly cookie + `member.session`, **`member.me`** / dashboard, real Resend inbox, Redis in staging, multi-replica behavior.
2. **Renewal / lifecycle emails (later)** — e.g. “Renews in X days”; needs renewal dates in data + scheduler or Resend when product is ready.
3. **OTP rate-limit tuning (optional)** — Tune **`SEND_OTP_RATE_WINDOW_MS`**, **`SEND_OTP_MAX_PER_EMAIL_PER_WINDOW`**, **`SEND_OTP_MAX_PER_IP_PER_WINDOW`** per environment after abuse telemetry.

---

## Courses map & partner UI

_Scope: Home **02 · Our Network** in [`CoursesSection`](../client/src/components/CoursesSection.tsx); directory [`Courses.tsx`](../client/src/pages/Courses.tsx)._

### Implemented in code

- **Map hover** — Pins use native **`title`** tooltip; details on **click** in the panel below ([`CoursesMap`](../client/src/components/CoursesMap.tsx)).
- **Click / info panel** — Cormorant title, body type, `max-w-lg`, close control (`X`), tier + discount.
- **Pins** — Teardrop **SVG** markers (resort vs club fill), selected state scales up ([`CoursesMap`](../client/src/components/CoursesMap.tsx)).
- **Map frame** — Responsive height (`min` viewport height on small screens), light shadow / ring on the map container.
- **“View full course directory”** — Hidden from **`lg`** and up (tablet/phone see the link) in [`CoursesSection`](../client/src/components/CoursesSection.tsx).
- **Mobile controls (§02)** — ~44px min touch targets, full-width tier tabs on small screens, list/map toggle labels on `xs`, horizontal list `touch-pan-x` / `overscroll-x-contain`, wider course cards (`min` viewport-based width).
- **Decorative arrows** — Removed from hero, courses CTA, login, directory CTA, and i18n copy; **kept** on pricing checkout in [`PricingSection`](../client/src/components/PricingSection.tsx).
- **Localized partner names (ES)** — Stable `slug` on [`partnerCourses`](../client/src/data/partnerCourses.ts) and [`courseCoordinates`](../client/src/data/courseCoordinates.ts); [`partnerCourseName`](../client/src/lib/partnerCourseName.ts) + Spanish keys `courses.partner.{slug}` in [`LanguageContext`](../client/src/contexts/LanguageContext.tsx); used in [`CoursesSection`](../client/src/components/CoursesSection.tsx), [`CoursesMap`](../client/src/components/CoursesMap.tsx), and [`Courses.tsx`](../client/src/pages/Courses.tsx).

### Optional polish

1. **Map pins** — Optional **brand** glyph or illustration beyond the current teardrop pin.
2. **Map click cards** — Extra breakpoint QA if issues appear in the field.
3. **Rich hover** — Custom overlay instead of native `title` only, if product wants it.

---

## Marketing & conversion (Batch D — beyond map)

### Implemented in code

- **Section shell / layout rhythm** — Shared inner wrapper `container relative z-10 py-20 md:py-28` on Benefits, How it works, Pricing, FAQ; courses block uses aligned bottom padding (`pb-20 md:pb-28`).
- **Trust stats strip** — [`TrustStrip`](../client/src/components/TrustStrip.tsx) on [`Home`](../client/src/pages/Home.tsx) between How it works and Pricing (localized headline + three stats).

### Open follow-up

1. **Mobile course UX (broader)** — Iterate on **02 · Our Network** after device QA if anything still feels tight (first pass: touch targets, map height, scroll, directory link visibility).
2. **Featured row / social proof** — Testimonials, partner logos, or press quotes (beyond the stats strip).

---

## Sign-up flow & member card

_Reference UI — post-payment **“You’re in”**: digital member card, **photo upload**, wallet CTAs (disabled until photo)._

![Links Golf — post-payment membership confirmation (reference)](./images/membership-youre-in-post-payment-reference.png)

### Implemented in code

- **Photo after payment (mock checkout)** — [`PricingSection`](../client/src/components/PricingSection.tsx): details → payment → success + **DigitalMemberCard**, photo upload, wallet CTAs after save. Supabase: `updateMemberPhotoUrl`, `memberId` as UUID, `activateMembership` on step 3.
- **Shared member card** — [`DigitalMemberCard`](../client/src/components/DigitalMemberCard.tsx) + [`memberCardDisplay`](../client/src/lib/memberCardDisplay.ts): Home pricing success, [`Dashboard`](../client/src/pages/Dashboard.tsx), [`HowItWorksSection`](../client/src/components/HowItWorksSection.tsx). **Wordmark** line uses `memberCard.wordmark` (“Links Golf Membership” / ES).
- **Wallet CTAs (icons)** — Apple / Google wallet rows use **Wallet** + **Smartphone** icons for clearer affordance (not official vendor badges).

### Open follow-up

1. **Real Stripe payment** — Replace mock pay step with Stripe Checkout or Elements; keep post-payment photo + wallet gating.
2. **Tab close between payment and photo** — Recovery (email deep link, dashboard banner, or resume token).
3. **Member card polish** — Optional wordmark line, randomized aerial subset ([Unsplash golf collection](https://unsplash.com/collections/bJnL-rJ3zAM/golf)) with attribution, closer match to `./images/membership-youre-in-post-payment-reference.png`.
4. **Wallet button icons** — Replace generic icons with **brand-compliant** Apple / Google wallet SVG marks when assets are available.

---

_Add new sections below as other backlog themes appear._
