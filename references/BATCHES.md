# Roadmap batches (auth → abuse → product → design)

Use this file to **re-orient** when switching tasks or onboarding. For **concrete UI/engineering tickets**, see [`BACKLOG.md`](./BACKLOG.md).

Status is approximate; update when you ship a slice.

---

## Batch A — Auth & data honesty

**Goal:** Real member session; server-trusted verify path; tests runnable without production secrets.

| # | Item | Status (repo) |
|---|------|----------------|
| 1 | Replace client-forgeable `member_session` (`btoa`) with server-validated session (signed JWT + httpOnly cookie) | **Done** — `server/memberJwt.ts`, `member.session` / `member.logout`, `client` gates on `trpc.member.session`. |
| 2 | Do not trust client for welcome / profile on verify | **Done** — welcome fields from **service role** when configured (`server/memberWelcomeFromDb.ts`); after OTP, [`resolveMemberIdFromEmail`](../server/memberWelcomeFromDb.ts) sets session `sub` only (no client `memberId` on verify). See [`BACKLOG.md`](./BACKLOG.md) **Resend / member OTP → Implemented in code**. |
| 3 | `pnpm test` green without Resend/Supabase secrets | **Done** — `describe.skipIf` in `server/resend.test.ts`, `server/supabase.test.ts`. |

**Env:** `MEMBER_JWT_SECRET` (prod), optional `SUPABASE_SERVICE_ROLE_KEY` + URL for welcome, `TRUST_PROXY` behind proxies. See [`BACKLOG.md`](./BACKLOG.md) Resend / OTP and [`ENVIRONMENT.md`](./ENVIRONMENT.md).

---

## Batch B — Abuse & reliability around email

| # | Item | Status (repo) |
|---|------|----------------|
| 4 | Rate-limit `member.sendOtp` (per IP + per email; Redis or in-memory fallback) | **Done** — [`server/sendOtpRateLimit.ts`](../server/sendOtpRateLimit.ts), wired in [`server/routers.ts`](../server/routers.ts) before Resend. |
| 5 | Optional: persist “welcome sent” on `members` (e.g. `welcome_email_sent_at`) so multi-region / restarts don’t rely only on Redis | **Done** — column + [`markWelcomeEmailSentAtMember`](../server/memberWelcomeFromDb.ts); SQL in [`references/migrations/supabase/001_members_welcome_email_sent_at.sql`](../references/migrations/supabase/001_members_welcome_email_sent_at.sql). Redis/email key in [`welcomeEmailOnce`](../server/welcomeEmailOnce.ts) remains as fallback when the column is absent or for legacy sends. |

Item **5** shipped with **dual write**: after Resend succeeds we set **`members.welcome_email_sent_at`** (when migration applied) and still call **`markWelcomeEmailSent`** for Redis/memory dedupe across processes without DB reads.

---

## Batch C — Product surface vs reality

| # | Item | Status (repo) |
|---|------|----------------|
| 6 | Dashboard: real member data (Supabase or tRPC `member.me`) instead of mock Juan / static LGM | **Done** — [`trpc.member.me`](../server/routers.ts) + [`fetchMemberProfileForSession`](../server/memberProfileFromDb.ts); [`Dashboard`](../client/src/pages/Dashboard.tsx) uses session + profile, localized dates, photo URL when `http(s)`. |
| 7 | Footer / misc i18n (e.g. hardcoded nav labels in `FooterSection`) | **Done** — [`FooterSection`](../client/src/components/FooterSection.tsx) uses existing `footer.*` keys plus [`footer.supportTitle`](../client/src/contexts/LanguageContext.tsx), terms/privacy, bottom bar strings (EN/ES). |

---

## Batch D — Design / conversion polish

**Goal:** Layout, mobile course UX, social proof — best **after** A–C so auth/data paths are stable.

**All Batch D–related tickets** live in [`BACKLOG.md`](./BACKLOG.md) (start at **Open engineering (at a glance)**):

- **Courses map & partner UI** — implemented items + **ES partner names** in BACKLOG; **optional polish** there: custom pins, breakpoint QA, rich hover.
- **Marketing & conversion** — section shell **done** in BACKLOG; **open follow-up**: mobile course UX, social proof.
- **Internationalization** — Partner course Spanish labels **done** (see BACKLOG **Courses map → Implemented**).

**Batches A–C** (tables above): all rows **Done** in repo. **Batch D** remaining work is only what BACKLOG lists under **Open engineering**, **Optional polish**, and **Sign-up → Open follow-up**.

---

## Suggested order (when unsure)

1. **[`BACKLOG.md`](./BACKLOG.md)** — **Open engineering (at a glance)** first, then the detailed section.
2. **[`BATCHES.md`](./BATCHES.md)** — Batch-level **done vs open**; map remaining work to BACKLOG headings.
