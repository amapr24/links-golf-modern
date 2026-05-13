# Engineering backlog

Tracked follow-ups that are not yet implemented in code.

---

## Resend email integration status

### Partially integrated

1. **Email templates are built** — [`server/email.ts`](../server/email.ts): `sendOtpEmail()` and `sendWelcomeEmail()` include HTML templates.
2. **tRPC endpoint exists** — [`server/routers.ts`](../server/routers.ts): `member.sendOtp` mutation calls `sendOtpEmail()`.
3. **Login page calls the backend** — [`client/src/pages/Login.tsx`](../client/src/pages/Login.tsx): `handleSendOtp` uses `trpc.member.sendOtp.useMutation()` (around the `sendOtpMutation.mutateAsync` call).

### Issues

1. **OTP storage is in-memory and ineffective** — In `member.sendOtp`, a new `Map` is created **inside each request** ([`server/routers.ts`](../server/routers.ts)), so nothing persists between calls. Production should use **Redis (or similar) with a ~10 minute TTL** keyed by email.
2. **OTP verification is client-side / disconnected** — [`client/src/pages/Login.tsx`](../client/src/pages/Login.tsx) `handleVerifyOtp` compares the entered code to `localStorage.getItem("login_otp")`, but **`login_otp` is never set** when OTP is sent via the server flow, so verification does not match the emailed OTP. Server-side validation should live in `member.verifyOtp` (and the client should call that mutation instead of trusting localStorage).
3. **`member.verifyOtp` is a stub** — Same router file: verifies format only; comments note Redis / real validation still TODO.
4. **`sendWelcomeEmail()` never called** — No post-login / post-signup trigger wired from auth or member flows.
5. **`RESEND_API_KEY`** — Required env var; [`server/email.ts`](../server/email.ts) logs and bails when missing. Ensure it is set in deployment (e.g. via `webdev_request_secrets` or host env).

### What needs to be done

1. Set **`RESEND_API_KEY`** in every environment that should send mail.
2. Implement **Redis-backed OTP storage** (replace per-request in-memory map); single shared store with TTL.
3. **Move OTP verification to the server** — `verifyOtp` reads from Redis, enforces expiry, deletes or invalidates code on success; **Login.tsx** calls `trpc.member.verifyOtp` and removes reliance on `login_otp` in localStorage for validation.
4. **Call `sendWelcomeEmail()`** after successful member verification or signup (define the exact trigger with product).
5. **End-to-end test** — send OTP, receive email, verify via API, confirm session and optional welcome email.

---

_Add new sections below as other backlog themes appear._
