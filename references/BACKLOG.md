# Engineering backlog

Tracked follow-ups that are **not yet implemented in code**. This file is the **single inventory** of pending work (ops, auth hardening, map UX, i18n, sign-up, marketing polish). Roadmap **batch status** (A–D) lives in [`BATCHES.md`](BATCHES.md); any item called out there as “mostly done” has a matching ticket below so nothing is only in BATCHES.

**Roadmap grouping (batches A–D, what’s done vs open):** see [`BATCHES.md`](BATCHES.md).

---

## Resend / member OTP (updated)

### Implemented in code

- **Member dashboard (`member.me`)** — [`trpc.member.me`](../server/routers.ts) loads the signed-in member from Supabase via [`fetchMemberProfileForSession`](../server/memberProfileFromDb.ts) (same **`SUPABASE_SERVICE_ROLE_KEY`** requirement as welcome). [`Dashboard`](../client/src/pages/Dashboard.tsx) uses `member.session` + `member.me`; shows retry UI if profile is unavailable. [`Login`](../client/src/pages/Login.tsx) invalidates `member.me` after OTP success.
- **OTP storage** — [`server/otpStore.ts`](../server/otpStore.ts): uses **`REDIS_URL`** with `SETEX` when set; otherwise a **process-wide in-memory `Map`** with 10-minute TTL (fixes the old per-request `Map` bug). Vitest forces in-memory store (`VITEST` / `NODE_ENV=test`).
- **sendOtp rate limits** — [`server/sendOtpRateLimit.ts`](../server/sendOtpRateLimit.ts): fixed-window counters **per email** and **per client IP** before calling Resend; uses **`REDIS_URL`** when set (same client as OTP store), otherwise an in-process `Map`. Defaults: **15 min** window, **4** sends/email/window, **20** sends/IP/window. Override with **`SEND_OTP_RATE_WINDOW_MS`**, **`SEND_OTP_MAX_PER_EMAIL_PER_WINDOW`**, **`SEND_OTP_MAX_PER_IP_PER_WINDOW`**. Client IP from `x-forwarded-for` (first hop) then Express `req.ip` / socket ([`getRequestClientIp`](../server/sendOtpRateLimit.ts)).
- **Server-side verify** — [`server/routers.ts`](../server/routers.ts) `member.verifyOtp` calls `verifyAndConsumeOtp` (one-time use).
- **Login flow** — [`client/src/pages/Login.tsx`](../client/src/pages/Login.tsx) calls `trpc.member.verifyOtp` with email + OTP + `memberId`; no `login_otp` in localStorage.
- **Member session** — After OTP success, server sets httpOnly cookie `links_member_session` with a **signed JWT** ([`server/memberJwt.ts`](../server/memberJwt.ts)); [`trpc.member.session`](../server/routers.ts) / [`member.logout`](../server/routers.ts); client gates via [`useHasMemberSession`](../client/src/hooks/useHasMemberSession.ts) and [`Dashboard`](../client/src/pages/Dashboard.tsx). [`MEMBER_SESSION_COOKIE`](../shared/const.ts) in shared const.
- **Welcome email (once per address)** — [`server/welcomeEmailOnce.ts`](../server/welcomeEmailOnce.ts): Redis key `links:welcome:sent:{email}` or in-memory `Set` after Resend succeeds. **Additionally**, when the service role loads the member row, [`fetchMemberWelcomeFields`](../server/memberWelcomeFromDb.ts) reads **`welcome_email_sent_at`**; if set, welcome is skipped. After a successful send, [`markWelcomeEmailSentAtMember`](../server/memberWelcomeFromDb.ts) updates that column. **Production Supabase:** migration [`001_members_welcome_email_sent_at.sql`](../references/migrations/supabase/001_members_welcome_email_sent_at.sql) is applied. Other environments should run the same SQL; until then, the server retries a select without that column and relies on Redis/memory only for that leg.

### Still operational / follow-up

1. **`RESEND_API_KEY`** — Must be set in each deployed environment or emails return `false` / skip.
2. **`REDIS_URL`** — Set in **production** when running **more than one Node instance** or horizontal scale; otherwise in-memory fallback is single-process only. **Welcome-once** also benefits from Redis in multi-instance setups (otherwise each process has its own `Set`).
3. **`MEMBER_JWT_SECRET`** — Required in **production** (at least 32 characters). Signs the member session JWT; dev/test uses an in-code fallback only when `NODE_ENV` is not `production`.
4. **`SUPABASE_SERVICE_ROLE_KEY`** (plus `SUPABASE_URL` or `VITE_SUPABASE_URL`) — Optional for OTP alone; **required** for welcome-from-DB, `welcome_email_sent_at`, and **`member.me`** / dashboard profile loads.
5. **E2E** — Manual or automated flow: OTP path, httpOnly cookie + `member.session`, **`member.me`** / dashboard load, real Resend inbox, Redis in staging, multi-replica check.
6. **Renewal / lifecycle emails (later)** — e.g. “Renews in X days” — not implemented; will need renewal dates in data + scheduler or Resend batch when product is ready.
7. **Stricter OTP verify (no client-supplied `memberId`)** — Today [`member.verifyOtp`](../server/routers.ts) accepts **`memberId` from the browser** after anon Supabase lookup; OTP still proves email ownership. **Hardening:** after OTP consumption, resolve `members.id` **only on the server** from the verified email (service role), then issue the session JWT — so a modified client cannot bind the cookie to another member row. (Tracked as the remaining slice of Batch A #2 in [`BATCHES.md`](BATCHES.md).)
8. **Reverse proxy / client IP** — Behind a load balancer or CDN, configure Express **`trust proxy`** (and validate **`x-forwarded-for`**) so [`getRequestClientIp`](../server/sendOtpRateLimit.ts) and any IP-based limits or logs reflect the real visitor.
9. **OTP rate-limit tuning (optional)** — Defaults are in [`sendOtpRateLimit.ts`](../server/sendOtpRateLimit.ts); override with **`SEND_OTP_RATE_WINDOW_MS`**, **`SEND_OTP_MAX_PER_EMAIL_PER_WINDOW`**, **`SEND_OTP_MAX_PER_IP_PER_WINDOW`** per environment once you have abuse telemetry.

---

## Courses map & partner UI

_Scope: primarily the Home **02 · Our Network** experience in [`CoursesSection`](../client/src/components/CoursesSection.tsx) (map + filters); overlap with [`Courses.tsx`](../client/src/pages/Courses.tsx) where noted._

1. **Map pins** — Prototype different map course pin styles to improve visibility.
2. **Map hover popover** — Hover state includes unnecessary large blank space and an “X” above the course name; tighten layout and controls.
3. **Map click cards** — Click-to-show course cards span very wide; evaluate narrower max-width (current width may be acceptable).
4. **Map pin click / info panel typography** — Clicking a course map pin opens content with **very small, almost unreadable type on desktop**; increase base font size, hierarchy, and line-height for that state (and verify on common breakpoints).
5. **“View full course directory”** (`courses.viewAll` in [`CoursesSection`](../client/src/components/CoursesSection.tsx), the **02 · Our Network** block with the Google Maps container on Home) — Show that link **only on mobile**; on desktop, list/grid mode already exposes the full set, so navigating to the standalone [`Courses`](../client/src/pages/Courses.tsx) directory page is redundant when a list mode is selected.
6. **Arrows in UI** — Remove decorative arrows across the marketing site **except** keep the arrow on **Continue to Payment** (or equivalent primary checkout CTA).

---

## Internationalization (optional)

1. **`partnerCourses` localized display names** — Add Spanish (or `t()`-keyed) names for ES mode on the Home map/list ([`CoursesSection`](../client/src/components/CoursesSection.tsx), [`CoursesMap`](../client/src/components/CoursesMap.tsx)) and on [`Courses.tsx`](../client/src/pages/Courses.tsx), without duplicating the whole dataset if a lighter pattern (e.g. `nameKey` + `LanguageContext`) is enough.

---

## Marketing & conversion (Batch D — beyond map)

_General polish after auth/data paths are stable; complements **Courses map & partner UI** above._

1. **Section shell / layout rhythm** — Consistent section spacing, headings, and breakpoints across home and key marketing pages (P2 “section shell”).
2. **Mobile course UX (broader)** — A dedicated pass on **02 · Our Network** small-screen layout and touch targets beyond the map-specific bullets (filters, list/grid, map chrome).
3. **Featured row / social proof** — Trust strip near pricing: testimonials, partner logos row, press quotes, or similar to support conversion.

---

## Sign-up flow & member card

1. **Move sign-up photo step to after payment** — Today the photo is collected before checkout, which adds friction at the highest-intent moment. Move the photo capture to **after** a successful Stripe payment (post-`Activate`/welcome screen), so a paid customer is far less likely to abandon over a photo requirement. Update the sign-up workflow accordingly: keep Details → Payment → Activate, and prompt for the photo on the "You're in." screen / member dashboard as a required follow-up before Apple/Google Wallet pass issuance (wallet buttons stay disabled until photo is uploaded, as today). Verify routing, state, and Supabase writes still hold if the user closes the tab between payment and photo.
2. **Member card visual refresh** — Restyle the member card to match the design in the [reference build](https://d2682ef0.linksgolfprweb.pages.dev) (and the attached screenshot at `/Users/linksgolfpr/.cursor/projects/Users-linksgolfpr-Documents-GitHub-links-golf-modern/assets/Screenshot_2026-05-12_at_10.49.37_PM-512a18f5-5c53-4ec7-b461-f9bbd07ed2c5.png`): photo-forward layout, serif member name, "Links Golf Membership" wordmark, and the `MEMBER NO. / VALID UNTIL / SEASON` row across the bottom. As an alternative direction, consider **randomizing the card background** with a photo from this Unsplash collection: <https://unsplash.com/collections/bJnL-rJ3zAM/golf> (curate a small approved subset, cache locally, attribute per Unsplash terms, and pick deterministically per member so the same member always sees the same background).
3. **Wallet button icons** — Replace the emoji glyphs on the **Add to Apple Wallet** / **Add to Google Wallet** buttons with proper brand-compliant SVG marks (Apple Wallet badge and Google Wallet badge per their respective brand guidelines). Use monochrome variants that sit well on the current dark/cream buttons and meet each platform's minimum sizing rules.

---

_Add new sections below as other backlog themes appear._
