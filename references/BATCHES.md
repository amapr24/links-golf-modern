# Roadmap batches (auth → abuse → product → design)

Use this file to **re-orient** when switching tasks or onboarding. For **concrete UI/engineering tickets**, see [`BACKLOG.md`](BACKLOG.md).

Status is approximate; update when you ship a slice.

---

## Batch A — Auth & data honesty

**Goal:** Real member session; server-trusted verify path; tests runnable without production secrets.

| # | Item | Status (repo) |
|---|------|----------------|
| 1 | Replace client-forgeable `member_session` (`btoa`) with server-validated session (signed JWT + httpOnly cookie) | **Done** — `server/memberJwt.ts`, `member.session` / `member.logout`, `client` gates on `trpc.member.session`. |
| 2 | Do not trust client for welcome / profile on verify | **Mostly done** — welcome fields from **service role** when configured (`server/memberWelcomeFromDb.ts`); `memberId` still supplied by client after anon member lookup. |
| 3 | `pnpm test` green without Resend/Supabase secrets | **Done** — `describe.skipIf` in `server/resend.test.ts`, `server/supabase.test.ts`. |

**Env:** `MEMBER_JWT_SECRET` (prod), optional `SUPABASE_SERVICE_ROLE_KEY` + URL for welcome. See [`BACKLOG.md`](BACKLOG.md) Resend / OTP section.

---

## Batch B — Abuse & reliability around email

| # | Item | Status (repo) |
|---|------|----------------|
| 4 | Rate-limit `member.sendOtp` (per IP + per email; Redis or in-memory fallback) | **Not done** |
| 5 | Optional: persist “welcome sent” on `members` (e.g. `welcome_email_sent_at`) so multi-region / restarts don’t rely only on Redis | **Not done** |

---

## Batch C — Product surface vs reality

| # | Item | Status (repo) |
|---|------|----------------|
| 6 | Dashboard: real member data (Supabase or tRPC `member.me`) instead of mock Juan / static LGM | **Not done** — `client/src/pages/Dashboard.tsx` still static placeholder. |
| 7 | Footer / misc i18n (e.g. hardcoded nav labels in `FooterSection`) | **Partial** |

---

## Batch D — Design / conversion polish

**Goal:** Layout, mobile course UX, social proof — best **after** A–C so auth/data paths are stable.

Many **map / “02 · Our Network”** items live in [`BACKLOG.md`](BACKLOG.md) under **Courses map & partner UI**.

---

## Suggested order (when unsure)

1. **B** if OTP email is live or will be soon (cost + abuse).  
2. **C** so post-login matches Supabase and marketing.  
3. **D** / **BACKLOG** polish when core flows are settled.
