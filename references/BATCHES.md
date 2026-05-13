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

**All Batch D–related tickets** live in [`BACKLOG.md`](BACKLOG.md) (open the file and jump to these headings):

- **Courses map & partner UI** — pins, hover popover, click card width, desktop pin typography, “View full course directory” mobile-only, decorative arrows.
- **Marketing & conversion (Batch D — beyond map)** — section shell / rhythm, broader mobile course UX, featured row / social proof.
- **Internationalization (optional)** — e.g. Spanish display names for `partnerCourses` in map/list/pages.

**Auth remainder (Batch A #2)** — same file, **Still operational / follow-up** item **7** (server-resolved member id after OTP; no client-supplied `memberId`).

---

## Suggested order (when unsure)

1. **[`BACKLOG.md`](BACKLOG.md)** — Work down the sections (ops → map → i18n → marketing → sign-up) as priority dictates.
2. **[`BATCHES.md`](BATCHES.md)** — Use only for **done vs open** at the batch level; every open slice should map to a **BACKLOG** heading or numbered item.
