# Engineering backlog

Tracked follow-ups that are not yet implemented in code.

**Roadmap grouping (batches A–D, what’s done vs open):** see [`BATCHES.md`](BATCHES.md).

---

## Resend / member OTP (updated)

### Implemented in code

- **OTP storage** — [`server/otpStore.ts`](../server/otpStore.ts): uses **`REDIS_URL`** with `SETEX` when set; otherwise a **process-wide in-memory `Map`** with 10-minute TTL (fixes the old per-request `Map` bug). Vitest forces in-memory store (`VITEST` / `NODE_ENV=test`).
- **sendOtp rate limits** — [`server/sendOtpRateLimit.ts`](../server/sendOtpRateLimit.ts): fixed-window counters **per email** and **per client IP** before calling Resend; uses **`REDIS_URL`** when set (same client as OTP store), otherwise an in-process `Map`. Defaults: **15 min** window, **4** sends/email/window, **20** sends/IP/window. Override with **`SEND_OTP_RATE_WINDOW_MS`**, **`SEND_OTP_MAX_PER_EMAIL_PER_WINDOW`**, **`SEND_OTP_MAX_PER_IP_PER_WINDOW`**. Client IP from `x-forwarded-for` (first hop) then Express `req.ip` / socket ([`getRequestClientIp`](../server/sendOtpRateLimit.ts)).
- **Server-side verify** — [`server/routers.ts`](../server/routers.ts) `member.verifyOtp` calls `verifyAndConsumeOtp` (one-time use).
- **Login flow** — [`client/src/pages/Login.tsx`](../client/src/pages/Login.tsx) calls `trpc.member.verifyOtp` with email + OTP + `memberId`; no `login_otp` in localStorage.
- **Member session** — After OTP success, server sets httpOnly cookie `links_member_session` with a **signed JWT** ([`server/memberJwt.ts`](../server/memberJwt.ts)); [`trpc.member.session`](../server/routers.ts) / [`member.logout`](../server/routers.ts); client gates via [`useHasMemberSession`](../client/src/hooks/useHasMemberSession.ts) and [`Dashboard`](../client/src/pages/Dashboard.tsx). [`MEMBER_SESSION_COOKIE`](../shared/const.ts) in shared const.
- **Welcome email (once per address)** — [`server/welcomeEmailOnce.ts`](../server/welcomeEmailOnce.ts): Redis key `links:welcome:sent:{email}` or in-memory `Set` after Resend succeeds. **Additionally**, when the service role loads the member row, [`fetchMemberWelcomeFields`](../server/memberWelcomeFromDb.ts) reads **`welcome_email_sent_at`**; if set, welcome is skipped. After a successful send, [`markWelcomeEmailSentAtMember`](../server/memberWelcomeFromDb.ts) updates that column. Apply [`references/migrations/supabase/001_members_welcome_email_sent_at.sql`](../references/migrations/supabase/001_members_welcome_email_sent_at.sql) on Supabase if the column is not present yet (code falls back to a select without the column).

### Still operational / follow-up

1. **`RESEND_API_KEY`** — Must be set in each deployed environment or emails return `false` / skip.
2. **`REDIS_URL`** — Set in **production** when running **more than one Node instance** or horizontal scale; otherwise in-memory fallback is single-process only. **Welcome-once** also benefits from Redis in multi-instance setups (otherwise each process has its own `Set`).
3. **`MEMBER_JWT_SECRET`** — Required in **production** (at least 32 characters). Signs the member session JWT; dev/test uses an in-code fallback only when `NODE_ENV` is not `production`.
4. **`SUPABASE_SERVICE_ROLE_KEY`** (plus `SUPABASE_URL` or `VITE_SUPABASE_URL`) — Optional; enables server-side welcome fields and binds welcome to a real `members` row for the verified email.
5. **E2E** — Manual or automated flow: OTP path, httpOnly cookie + `member.session`, real Resend inbox, Redis in staging, multi-replica check.
6. **Renewal / lifecycle emails (later)** — e.g. “Renews in X days” — not implemented; will need renewal dates in data + scheduler or Resend batch when product is ready.

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

_Add new sections below as other backlog themes appear._
