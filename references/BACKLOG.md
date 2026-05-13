# Engineering backlog

Tracked follow-ups that are not yet implemented in code.

---

## Resend / member OTP (updated)

### Implemented in code

- **OTP storage** — [`server/otpStore.ts`](../server/otpStore.ts): uses **`REDIS_URL`** with `SETEX` when set; otherwise a **process-wide in-memory `Map`** with 10-minute TTL (fixes the old per-request `Map` bug). Vitest forces in-memory store (`VITEST` / `NODE_ENV=test`).
- **Server-side verify** — [`server/routers.ts`](../server/routers.ts) `member.verifyOtp` calls `verifyAndConsumeOtp` (one-time use).
- **Login flow** — [`client/src/pages/Login.tsx`](../client/src/pages/Login.tsx) calls `trpc.member.verifyOtp` with email + OTP; no `login_otp` in localStorage.
- **Welcome email** — After successful verify, optional `firstName` + `memberNumber` trigger `sendWelcomeEmail()` (fire-and-forget; login passes derived `LGM-…` from Supabase member `id`).

### Still operational / follow-up

1. **`RESEND_API_KEY`** — Must be set in each deployed environment or emails return `false` / skip.
2. **`REDIS_URL`** — Set in **production** when running **more than one Node instance** or horizontal scale; otherwise in-memory fallback is single-process only.
3. **JWT / server session** — Client still builds `member_session` with `btoa`; replace with signed token or httpOnly cookie when ready.
4. **E2E** — Manual or automated flow: real Resend inbox, Redis in staging, multi-replica check.

---

_Add new sections below as other backlog themes appear._
