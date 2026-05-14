# Links Golf Modern — Audit & TODO

> Repository and live-site (`https://linksgolfpr.manus.space`) audit. Findings are grouped by severity. Each item lists the **problem**, **file:line refs**, and a **proposed fix**.
>
> The live site host is firewalled from this environment (`x-deny-reason: host_not_allowed`), so the runtime audit is inferred from source — anything marked _(verify in browser)_ should be re-checked once an unrestricted environment is available.

---

## P0 — Critical (ship-blockers, security, money)

### Payments / Stripe
- [ ] **Webhook is not idempotent.** Replayed `checkout.session.completed` events will reset `activatedAt` and could double-create members. — `server/stripe/webhook.ts`, `server/routers.ts:378-384`
  - **Fix:** Persist `stripe_event_id` in a `processed_stripe_events` table with a unique index; short-circuit handlers if the event id already exists. Wrap the upsert + activation in a transaction.
- [ ] **IDOR in `member.createCheckout`.** The procedure accepts a client-supplied `memberId` and trusts it when no session is present. — `server/routers.ts:217-284`
  - **Fix:** Require an authenticated member session for checkout; never read `memberId` from input. Derive it from `ctx.member.id`.
- [ ] **Subscription state transitions ignored.** `customer.subscription.updated` only stores the new id; `past_due`, `canceled`, `unpaid`, `incomplete_expired` are not reflected in member state. — `server/stripe/webhook.ts:94-118`
  - **Fix:** Map Stripe `status` to a `membership_status` enum and update on every relevant event. Also handle `invoice.payment_failed`.
- [ ] **`paymentType` silently defaults to `"one-time"`** when metadata is missing, breaking renewal accounting. — `server/stripe/webhook.ts:56`
  - **Fix:** Derive payment type from `mode` (`subscription` vs `payment`) on the Checkout Session, not metadata.
- [ ] **Unsafe `any` casts on Stripe period fields** (`current_period_end`, `cancel_at_period_end`). — `server/member.payments.ts:92,98`
  - **Fix:** Use the typed Stripe SDK fields; remove `as any`.
- [ ] **Stripe sandbox claim deadline 2026-07-12.** If unclaimed, all payments break.
  - **Fix:** Claim the sandbox, then update Settings → Payment with live keys once KYC clears.
- [ ] **Test card / minimum-amount checks never executed.** The P0 payment QA matrix in this very file (lines 24–28) is still un-ticked.
  - **Fix:** Run the listed scenarios end-to-end against the sandbox before any live launch.

### Authentication & sessions
- [ ] **OTP verify is not atomic.** `verifyAndConsumeOtp` does `GET` then `DEL` in Redis with no Lua / MULTI — concurrent verifies can both succeed. — `server/otpStore.ts:31-50`
  - **Fix:** Implement consumption with a Lua script or `WATCH/MULTI/EXEC` so the OTP is consumed exactly once.
- [ ] **No per-OTP attempt counter.** OTP rate limiting is IP/email-based only; a logged session could submit thousands of guesses per window. — `server/sendOtpRateLimit.ts`
  - **Fix:** Store an attempt counter alongside each OTP and invalidate after N (3) failures.
- [ ] **In-memory OTP fallback runs in production paths.** Plaintext OTPs in a `Map` survive in process memory. — `server/otpStore.ts:6-7`
  - **Fix:** Refuse to boot in `NODE_ENV=production` without Redis; hash OTPs before storing.
- [ ] **JWT fallback secret is hard-coded in the source.** If `MEMBER_JWT_SECRET` is missing or <32 chars, the dev secret is silently used. — `server/memberJwt.ts:12-23`
  - **Fix:** `throw` at module load when `NODE_ENV === 'production'` and the secret is missing/short. Remove the literal dev secret; require an env var in dev too.
- [ ] **No CSRF protection.** tRPC mutations use `credentials: "include"` with cookie auth and no token. — `client/src/main.tsx:71-84`, `server/routers.ts`
  - **Fix:** Add a CSRF middleware (double-submit cookie or `Origin`/`Referer` allowlist) for state-changing tRPC procedures.
- [ ] **Rate-limit IP source is spoofable.** `x-forwarded-for` is read without `app.set('trust proxy', …)` configured. — `server/sendOtpRateLimit.ts:52-70`, `server/_core/index.ts`
  - **Fix:** Set `trust proxy` to the actual hop count and use Express's `req.ip` (or `req.ips[0]`).
- [ ] **PII in `localStorage`.** Login email and language preference are written to `localStorage`. — `client/src/pages/Login.tsx:59`, `client/src/contexts/LanguageContext.tsx:720`
  - **Fix:** Email is fine as a remembered-username pattern if scoped; move anything session-related into the existing httpOnly cookie. Namespace all keys (`lg:`).

### Privacy / data handling
- [ ] **Manus debug collector writes session replays + network logs to disk.** Embedded as a Vite plugin and toggled by `MANUS_DEV_TOOLS=1`. — `vite.config.ts:12-70,78-152`
  - **Fix:** Confirm it cannot be enabled in production builds; gate behind `NODE_ENV !== 'production'`; add `.manus-logs/` to `.gitignore` (verify); document the privacy implication.
- [ ] **Resend / Supabase / Stripe error responses logged verbatim.** Any of these can echo headers including auth fragments. — `server/email.ts:7,52,119`, `server/routers.ts` throughout
  - **Fix:** Strip headers/keys before logging; log a request id instead.

### Platform lock-in
- [ ] **Hard coupling to the Manus platform.** `vite-plugin-manus-runtime`, `vite-plugin-manus-runtime`-style Manus debug collector, `client/public/__manus__/`, Manus domain allowlist, `ManusDialog` component, and Manus-issued `openId` in the DB schema. — `package.json:111`, `vite.config.ts:163,184-189`, `client/src/components/ManusDialog.tsx`, `drizzle/schema.ts:15`
  - **Fix:** Decide: stay on Manus (then drop the ambition to self-host), or extract a portable build path. At minimum, gate the Manus plugin behind an env flag so non-Manus builds succeed.

---

## P1 — High (correctness, accessibility, conversion)

### Accessibility
- [ ] **`maximum-scale=1` blocks pinch-zoom.** WCAG 2.5.5 (and Apple/Google a11y guidance). — `client/index.html:5`
  - **Fix:** `<meta name="viewport" content="width=device-width, initial-scale=1" />` — drop the maximum-scale clause.
- [ ] **`<html lang="en">` never changes** when the user switches to Spanish. Screen readers announce Spanish content in an English voice. — `client/index.html:2`, `client/src/contexts/LanguageContext.tsx`
  - **Fix:** In `LanguageProvider`, `useEffect(() => { document.documentElement.lang = language === 'es' ? 'es' : 'en'; }, [language])`.
- [ ] **Legal pages and `NotFound` are English-only.** App ships bilingual but `PrivacyPolicy`, `TermsOfService`, `RefundPolicy`, and `NotFound` ignore `useLanguage`. — `client/src/pages/NotFound.tsx`, `client/src/components/LegalPolicyShell.tsx`, `client/src/pages/{Privacy,Terms,Refund}*.tsx`
  - **Fix:** Translate the content into both languages, or render the Spanish version when `language === 'es'`. Translate at minimum 404 strings.
- [ ] **`ErrorBoundary` fallback is English-only.** — `client/src/components/ErrorBoundary.tsx:24-52`
  - **Fix:** Use the language context (or a translated string passed in via prop) for the fallback UI.
- [ ] **Brand and member photos use `alt=""`.** Logo and identity-relevant images are announced as decorative. — `client/src/components/DigitalMemberCard.tsx:97-99,105`, `client/src/components/PricingSection.tsx:560-562`
  - **Fix:** Provide meaningful alt text (`"Links Golf PR"`, `"Member photo"`).
- [ ] **No focus management or focus traps** in modal dialogs and the multi-step pricing form. — `client/src/components/ManusDialog.tsx`, `client/src/components/PricingSection.tsx`
  - **Fix:** Use the existing Radix Dialog primitives (already a dep) or `focus-trap-react` for any non-Radix overlay. Restore focus to the trigger on close.
- [ ] **Color contrast on `oklch(0.65 0.16 145)` green over the hero gradient.** — `client/src/components/HeroSection.tsx:107`
  - **Fix:** Run an automated axe-core pass; bump the green's lightness or add a text shadow / scrim if contrast drops below 4.5:1.
- [ ] **Semantic landmarks missing.** Several pages render under raw `<div>` shells with no `<main>` / `<header>` / `<footer>`. — `client/src/pages/NotFound.tsx`, etc.
  - **Fix:** Wrap each page in a single `<main>`; ensure the navbar/footer use `<nav>`/`<footer>`.

### Internationalisation
- [ ] **Hardcoded English in NotFound** ("Page Not Found", "404", "Go Home"). — `client/src/pages/NotFound.tsx:24-28`
- [ ] **`og:locale` static.** `en_US` / `es_PR` are set once; not updated when the user switches language. — `client/index.html:15-16`
  - **Fix:** Either render a separate Spanish index page at `/es/`, or update at runtime via `LanguageContext` (less SEO benefit but better than nothing). Pair with hreflang tags.
- [ ] **Translations baked into a 762-line `LanguageContext.tsx`.** All keys ship to every client on every page; no namespacing, no lazy loading. — `client/src/contexts/LanguageContext.tsx`
  - **Fix:** Move strings to `client/src/i18n/{en,es}/*.json` namespaced by section; lazy-import per route or use `react-i18next` (or a tiny custom loader). Failing that, at least move them into a TS-only data file outside React context.

### SEO
- [ ] **No `robots.txt` or `sitemap.xml`.** — `client/public/`
  - **Fix:** Add a `robots.txt` allowing all and pointing at a generated `sitemap.xml`. Generate the sitemap at build (vite plugin) listing `/`, `/courses`, `/login`, legal pages, with `hreflang` entries for `/es/`.
- [ ] **No structured data.** No `Organization`, `LocalBusiness`, or `Product`/`Offer` JSON-LD. — `client/index.html`
  - **Fix:** Inject a JSON-LD block at build (`Organization` + `Product` for the membership with `priceCurrency:"USD"`, `price:"199"`).
- [ ] **No per-page `<title>` / `<meta description>`.** The same title/description ships on `/dashboard`, `/courses`, `/success`, etc. — `client/index.html`
  - **Fix:** Use a tiny head manager (`react-helmet-async` or a custom hook) to set per-route title and description.
- [ ] **Canonical relies on `VITE_PUBLIC_SITE_ORIGIN` being set at build.** If unset, no canonical is emitted — and `linksgolfpr.manus.space` will be indexed as a canonical URL. — `vite-plugin-site-seo-html.ts`, `.env.example:9-11`
  - **Fix:** Make the deploy pipeline set `VITE_PUBLIC_SITE_ORIGIN`; fail the build if it's missing in `NODE_ENV=production`.
- [ ] **Open Graph image is one variant.** Just `/og-share.png`; no Spanish variant, no Twitter `summary` fallback for non-image clients. — `client/index.html:13-20`
  - **Fix:** Add a Spanish OG image and switch via `vite-plugin-site-seo-html` when building the `es` variant.

### Database
- [ ] **No foreign keys.** `members.userId` is `UNIQUE` but lacks a `references(users.id)` constraint; deleting a user orphans a member row. — `drizzle/schema.ts`
  - **Fix:** Add the FK with `onDelete: 'cascade'` (or `'restrict'` if member rows must outlive users).
- [ ] **No indexes on `stripe_customer_id` / `stripe_subscription_id`.** Webhook lookups are full scans. — `drizzle/schema.ts`
  - **Fix:** Add unique indexes; regenerate migration.
- [ ] **No `processed_stripe_events` table.** See P0 webhook idempotency.
- [ ] **No connection pool sizing.** `drizzle(DATABASE_URL)` with default mysql2 settings will exhaust under burst load. — `server/db.ts:10-19`
  - **Fix:** Use `mysql2/promise.createPool({ connectionLimit: 10, … })` and pass that to drizzle.
- [ ] **No documented rollback for migrations.** `pnpm db:push` chains `generate && migrate`; one-shot path is risky in prod. — `package.json:17`
  - **Fix:** Separate the scripts; never auto-migrate on deploy without a manual approval step.

### API / tRPC
- [ ] **No central auth middleware.** Each procedure that needs an authed member must remember to check the session. — `server/routers.ts`
  - **Fix:** Introduce `protectedProcedure` and `adminProcedure` builders in `server/_core/trpc.ts`; require them for anything member-scoped.
- [ ] **Error messages leak system state.** `"Failed to verify checkout session."`, raw Stripe errors, raw Supabase errors. — `server/routers.ts:323` etc.
  - **Fix:** Return generic error codes for tRPC clients; log the rich error server-side with a correlation id.
- [ ] **No request id / correlation id.** — `server/_core/context.ts`
  - **Fix:** Add an Express middleware that mints a UUID per request, attach to `ctx`, include in logs.

### Operational
- [ ] **No `/healthz`.** Load balancers cannot validate the server. — `server/_core/index.ts:73-78`
  - **Fix:** Add a simple `GET /healthz` returning `{ ok: true, ts }`; optionally check DB + Redis connectivity.
- [ ] **No graceful shutdown.** Active requests are killed on `SIGTERM`. — `server/_core/index.ts`
  - **Fix:** Trap `SIGTERM`/`SIGINT`, stop accepting new connections, drain in-flight requests, close DB + Redis.
- [ ] **No structured logging.** ~80 `console.log`/`console.error` calls.
  - **Fix:** Adopt `pino` (small, fast, JSON output); strip raw console calls; redact keys.

---

## P2 — Medium (architecture, performance, code quality)

### Bundle / performance
- [ ] **No route-level code splitting.** All page components are eagerly imported in `App.tsx`. — `client/src/App.tsx:4-14`
  - **Fix:** `const Dashboard = lazy(() => import('./pages/Dashboard'))` and wrap `<Router>` in `<Suspense fallback={…}>`. Same for `Success`, `Login`, `Courses`, legal pages.
- [ ] **`ComponentShowcase.tsx` is 1,437 lines of demo UI shipped to production users.** Not routed but bundled because it's imported by nothing — verify via `vite build --report`. — `client/src/pages/ComponentShowcase.tsx`
  - **Fix:** Delete the file (it's not referenced) or move it to a `dev/` folder excluded from the production build. Confirm tree-shaking with `vite-bundle-visualizer`.
- [ ] **`PricingSection.tsx` is 764 lines of mixed concerns** (form state, photo upload, validation, Stripe checkout, copy). — `client/src/components/PricingSection.tsx`
  - **Fix:** Split into `PricingTiers`, `MemberSignupForm`, `PhotoUploader`, `CheckoutHandoff`. Replace `useState`-per-field with `react-hook-form` (already a dep) + the existing Zod schema.
- [ ] **Form fields read via `document.getElementById`.** Uncontrolled anti-pattern; values don't survive language change re-render. — `client/src/components/PricingSection.tsx:65-68`
  - **Fix:** Use `react-hook-form` `register`/`getValues`.
- [ ] **No `loading="lazy"` on below-the-fold images.** Hero loads at full resolution on mobile with no `srcSet`/`sizes`. — `client/src/components/HeroSection.tsx:40`
  - **Fix:** Provide a `<picture>` with mobile/desktop variants; lazy-load non-hero images. Use AVIF/WebP.
- [ ] **Google Fonts loaded synchronously with no `display=swap` strategy** beyond the URL flag; three families is excessive. — `client/index.html:21-23`
  - **Fix:** Self-host the two families used in the hero; preload only the critical weight; drop a family if possible.
- [ ] **`IntersectionObserver` re-created on every language toggle.** — `client/src/pages/Home.tsx:38-52`
  - **Fix:** Drop `language` from the dependency array; the observer doesn't care about language.
- [ ] **Two scroll-reveal systems coexist.** `.fade-up` (class toggled imperatively) vs `useScrollReveal` (`[data-reveal]`, currently unused). — `client/src/pages/Home.tsx:39`, `client/src/hooks/useScrollReveal.ts`
  - **Fix:** Pick one; remove the other.
- [ ] **Build config has no chunk strategy, no source-map policy, no `build.reportCompressedSize`.** — `vite.config.ts:178-181`
  - **Fix:** Configure `manualChunks` for `react`, `recharts`, `radix`, `framer-motion`; emit hidden source maps for Sentry/etc.; turn on bundle size warnings.
- [ ] **26 individual `@radix-ui/react-*` deps**, several of which are likely unused by current pages (menubar, context-menu, hover-card, drawer/vaul, command, etc.).
  - **Fix:** `pnpm dlx depcheck`; drop unused Radix primitives; remove `cmdk`, `vaul`, `input-otp`, `embla-carousel-react`, `react-resizable-panels`, `react-day-picker` if not used on shipped routes.
- [ ] **`axios@1.12.0`** present alongside `fetch` everywhere else.
  - **Fix:** Remove; replace any axios call with `fetch`.
- [ ] **`framer-motion@12` (heavy) used for animations that could be CSS.**
  - **Fix:** Audit usage; replace static transitions with CSS where possible.

### Code quality / dead code
- [ ] **Delete `ComponentShowcase.tsx`** (not routed). — `client/src/pages/ComponentShowcase.tsx`
- [ ] **Delete or wire up `AIChatBox.tsx`** (1,400+ LoC, not imported, no AI route exists). — `client/src/components/AIChatBox.tsx`
- [ ] **Delete `ManusDialog.tsx`** if Manus coupling is being shed. — `client/src/components/ManusDialog.tsx`
- [ ] **Course list duplicated.** Hardcoded in `pages/Courses.tsx` and `data/partnerCourses.ts`. — `client/src/data/partnerCourses.ts`, `client/src/pages/Courses.tsx:22-38`
  - **Fix:** Single source of truth; import everywhere.
- [ ] **`getFeatures(t: any)`.** — `client/src/components/PricingSection.tsx:20`
  - **Fix:** Type as `(t: TFunction) => Feature[]` and memoize.
- [ ] **Commented-out cookie domain logic.** — `server/_core/cookies.ts:41-54`
  - **Fix:** Delete or extract to a TODO with an issue link.
- [ ] **Unused imports** (e.g. `howItWorksStepTitleStyle` in `BenefitsSection.tsx`).
  - **Fix:** Enable ESLint `no-unused-vars` and run.
- [ ] **`localStorage` keys lack a namespace** (`language`, `theme`, `login_email`, sidebar width).
  - **Fix:** Prefix everything with `lg:` (e.g. `lg:language`).
- [ ] **`sessionStorage.checkout_session_id` flow.** — `client/src/pages/Success.tsx:28,69-71`
  - **Fix:** Move the post-checkout session bootstrap to a server endpoint that returns the cookie directly given a Stripe session id (server-side Stripe verify).

### TypeScript / configuration
- [ ] **`tsconfig.json` missing `noUncheckedIndexedAccess`.** Currently every `array[i]` is `T` not `T | undefined`. — `tsconfig.json`
  - **Fix:** Enable; fix the resulting errors.
- [ ] **`skipLibCheck: true`** is fine in dev but hides upstream type drift.
  - **Fix:** Re-enable selectively, or run `tsc --noEmit --skipLibCheck false` in a nightly CI job.
- [ ] **`tsconfig.node.json` only includes `vite.config.ts`.** Drizzle/Playwright/Vitest configs are unchecked. — `tsconfig.node.json`
  - **Fix:** Add them to `include`.
- [ ] **No env validation schema.** Server reads `process.env.*` ad-hoc; missing values silently degrade. — `server/_core/env.ts`, `.env.example`
  - **Fix:** Create a Zod schema for all env vars, parse at boot in `server/_core/index.ts`, exit non-zero on failure. Reuse for `VITE_*` via `import.meta.env`.

### Testing & CI
- [ ] **No ESLint.** Only Prettier.
  - **Fix:** Add `@typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`. Wire to `pnpm check`.
- [ ] **No CI workflow.** No `.github/workflows/`.
  - **Fix:** Add a GitHub Actions workflow running `pnpm install`, `pnpm check`, `pnpm test`, `pnpm build` on PRs.
- [ ] **No browser test environment.** `vitest.config.ts` is node-only.
  - **Fix:** Add a second Vitest project with `environment: 'jsdom'` for component tests.
- [ ] **Playwright runs single-threaded, no retries.** — `playwright.config.ts:15`
  - **Fix:** `workers: 2`, `retries: process.env.CI ? 1 : 0`, `fullyParallel: true`.
- [ ] **No tests for: webhook idempotency, OTP race, payment history, language toggle, dashboard authed flow.**
  - **Fix:** Add unit + E2E coverage for each.
- [ ] **No pre-commit hook.** Formatting and types drift between contributors.
  - **Fix:** Add `husky` + `lint-staged` running `prettier --check` and `tsc --noEmit` on staged files.

### Hygiene
- [ ] **Stray `.gitkeep` at the repo root** (zero bytes, no purpose).
  - **Fix:** Delete.
- [ ] **`references/TODO.md` vs root `todo.md`** — duplicate sources of truth.
  - **Fix:** Pick one; archive the other.
- [ ] **No `engines` / `.nvmrc`.** Node version not pinned.
  - **Fix:** Add `"engines": { "node": ">=20.11" }` and a `.nvmrc`.
- [ ] **`pnpm-lock.yaml` is 330 KB**, no `pnpm audit` step.
  - **Fix:** Add `pnpm audit --prod` to CI.
- [ ] **`patches/wouter@3.7.1.patch` is undocumented.**
  - **Fix:** Add a `patches/README.md` explaining why the patch exists and what upstream issue tracks removing it.
- [ ] **`drizzle/relations.ts` and migrations checked in but no docs.**
  - **Fix:** Add a `drizzle/README.md` covering naming, generation, rollback.

---

## P3 — UX / Visual / Content polish

> These rely on inspecting the live site. Some are inferred from source and should be re-verified in browser once the host is reachable.

### Hero
- [ ] **Hero background scales `1.08 → 1.03` after image-loaded flag.** Visible "settle" on first paint. — `client/src/components/HeroSection.tsx:38-42`
  - **Fix:** Use `requestAnimationFrame` after decode, or skip the entry animation if `prefers-reduced-motion`.
- [ ] **Green emphasis word may fail contrast** on dark photos. _(verify in browser)_

### Sticky CTA
- [ ] **Sticky CTA toggle uses a single `IntersectionObserver` with threshold 0.1.** Rapid scroll can flicker the bar. — `client/src/components/StickyCTA.tsx`
  - **Fix:** Increase threshold, add a hysteresis state, or rely on `scrollY > heroBottom`.

### Pricing form
- [ ] **Multi-step form has 15+ `useState` hooks**, mixed with refs and `getElementById` reads.
  - **Fix:** Rebuild with `react-hook-form` + Zod resolver (`@hookform/resolvers` is already installed but unused for this form).
- [ ] **Photo uploader has no preview/crop step** _(verify)_.
- [ ] **"Subscribe Now" vs "Buy Once" labels are duplicated** with similar copy below the price.

### Courses
- [ ] **15 courses hardcoded** in two places (see code-quality section).
- [ ] **`courseCoordinates.ts` accuracy.** Existing TODO at root line 70 — verify especially resort entries against satellite imagery.
- [ ] **Map flagged as Google Maps**, requires `VITE_GOOGLE_MAPS_API_KEY`. Without the key the section degrades silently.
  - **Fix:** Render a static-map fallback when no key is present and surface a build warning.

### Dashboard
- [ ] **Multiple uncoordinated query states.** `sessionPending`, `profilePending`, manual `refetch()`. — `client/src/pages/Dashboard.tsx:44-54`
  - **Fix:** Compose queries with `useQueries`; surface a single combined loading state.
- [ ] **No empty/error states translated.** Hardcoded English fallback strings.
- [ ] **Member card photo upload** — verify the cropping/aspect handling end-to-end on mobile Safari _(verify)_.

### FAQ / Legal
- [ ] **Legal pages share `LegalPolicyShell`** but the body content is hardcoded English. — `client/src/components/LegalPolicyShell.tsx`
  - **Fix:** Translate; have a legal review pass on the policy text itself.
- [ ] **No "last updated" date** on legal pages.

### Footer
- [ ] **Footer support email/phone** — confirm they are real, monitored, and have an autoresponder _(verify)_.

### Copy / claims
- [ ] **"Up to 25% off every round"** claim repeats site-wide. Verify it matches the partner-course contracts and reflect any caps.
- [ ] **"15 partner courses"** — confirm count matches the data file and the contractual list. If a course drops, the homepage, FAQ, and OG description must update together.
- [ ] **Spanish copy proofread.** Auto-generated translations slip into idiom errors; run a native pass on:
  - `LanguageContext.tsx` (entire dictionary)
  - Legal pages once translated
  - Email templates (`server/email.ts`)

---

## P4 — Nice to have / future

- [ ] **Member card animation** (already on the old roadmap, line 76).
- [ ] **Success page celebration animation.**
- [ ] **Email template visual refresh** — current templates likely text-heavy.
- [ ] **Analytics + error tracking integration.** `VITE_ANALYTICS_*` is wired in `main.tsx`, but no Sentry/PostHog hookup exists. Add one.
- [ ] **PWA / offline shell.** Could be relevant for a "show your card at the pro shop" use case.
- [ ] **Apple/Google Wallet pass.** A real `.pkpass` would solve the "digital wallet" promise made in OG metadata more credibly than an HTML card.
- [ ] **WCAG 2.1 AA audit** (existing roadmap, line 80). Block on the P1 a11y items first.
- [ ] **Domain setup (`linksgolfpr.com`)** — currently the public origin is `linksgolfpr.manus.space`. Until a custom domain is live, the site looks like a Manus demo, which hurts trust.
- [ ] **Production monitoring** (uptime + APM).

---

## Proposed near-term fix order (one engineer, ~2 sprints)

1. **Security & money basics** — P0 webhook idempotency, IDOR in `createCheckout`, JWT secret enforcement, CSRF, OTP atomicity, trust-proxy. _(2–3 days)_
2. **Bilingual correctness** — `<html lang>` sync, translate `NotFound`, `ErrorBoundary`, legal pages; drop `maximum-scale=1`. _(1 day)_
3. **SEO baseline** — `robots.txt`, `sitemap.xml`, structured data, per-route titles, canonical hardening. _(1 day)_
4. **Bundle hygiene** — delete `ComponentShowcase`, `AIChatBox`, `ManusDialog`; lazy-load routes; drop unused Radix/axios/framer; bundle report. _(1–2 days)_
5. **Form rebuild** — `PricingSection` → `react-hook-form` + split files; remove `document.getElementById` reads. _(1 day)_
6. **Ops & CI** — `/healthz`, graceful shutdown, structured logging, GitHub Actions, ESLint + jsx-a11y, env Zod schema. _(2 days)_
7. **DB hardening** — FK on `members.userId`, indexes on Stripe IDs, `processed_stripe_events` table, pool sizing. _(1 day)_
8. **Manus decoupling decision** — choose path; if leaving, factor out the runtime plugin and dialog. _(scoped separately)_

---

---

## Standards-based audits (follow-up passes)

### Privacy / data-protection law review

> **Applicability:** Puerto Rico Act 39-2012 + Act 111-2005 — **High confidence applies** (merchant is PR-targeted, sells only to PR residents). GDPR/UK GDPR — **Medium risk** because there is no geo-block; if even one EU resident signs up, GDPR applies. CCPA/CPRA — **Low** if residency gate holds. COPPA/BIPA — N/A.

**Critical privacy items to add to the backlog:**

- [ ] **Manus debug collector is a session-data exfiltration risk.** `vite-plugin-manus-runtime`'s collector captures `browserConsole`, `networkRequests`, and `sessionReplay` and writes them to `.manus-logs/` on disk. The toggle is `MANUS_DEV_TOOLS=1`, but there is no `NODE_ENV === 'production'` hard-stop and `.manus-logs/` is NOT in `.gitignore`. — `vite.config.ts:78-152,156-189`, `.gitignore`
  - **Fix:** (a) Add `.manus-logs/` to `.gitignore` immediately. (b) Make the plugin return `null` when `process.env.NODE_ENV === 'production'`. (c) Strip `Authorization`, `Cookie`, `Set-Cookie`, and any `x-*-token` headers from logged network requests. (d) Add a CI check that builds with `NODE_ENV=production MANUS_DEV_TOOLS=1` and grep-fails the bundle if it contains any `__manus__` strings. (Also tracked under PCI v4 above.)
- [ ] **Privacy policy does not name a single processor.** The current copy says "service providers (for example: hosting, email, database, analytics)" — generic language is below the PR Act 39 / GDPR standard. — `client/src/contexts/LanguageContext.tsx:283-291`
  - **Fix:** Add a named processor schedule covering at minimum: Supabase (US/AWS) — auth, member DB, photo storage; Stripe (US) — payments; Resend (US) — transactional email; Upstash Redis (location depends on region selected) — OTP and rate-limit cache; AWS S3 / Forge proxy — file storage; Google Maps (Global) — course locations; Unsplash (US, optional) — member-card backgrounds. Confirm a signed DPA for each; reference the DPA availability in the policy.
- [ ] **No data retention schedule.** Privacy policy says retention is per an "internal schedule" — not disclosable. PR Act 39 expects a defined schedule.
  - **Fix:** Publish tiers — active members for the membership term + 12 months; payment records 7 years (PR tax requirements; verify with accountant); photos deleted with the member record or earlier on request; logs not retained in production beyond 30 days; dispute/fraud records 3 years.
- [ ] **No DSAR / self-service deletion path.** Members cannot export or delete their data through the dashboard; no documented support contact for these requests beyond a generic `info@`. — `client/src/pages/Dashboard.tsx`, `server/routers.ts`
  - **Fix:** Add tRPC `member.exportMyData` returning a JSON payload (profile, payment history minus PAN, photo URL) and `member.deleteAccount` which soft-deletes/anonymises the member row, revokes the Stripe subscription, deletes photos from S3/Supabase, and leaves only the tax-required payment shadow record. Surface both in the dashboard.
- [ ] **Residency gate is checkbox-only.** Anyone can tick the "I am a PR resident" box; downstream legal copy and tax claims depend on it being true. — `client/src/components/PricingSection.tsx`
  - **Fix:** Either accept this as a binding declaration (with the legal copy explicitly stating it's a representation that can void the membership if false) or add server-side geo-IP / address verification. Document the choice in the policy.
- [ ] **Marketing email consent bundled with transactional consent.** Today, agreeing to the privacy policy implicitly authorises renewal / "material change" emails. There's no separate opt-in for marketing or newsletter sends. — `client/src/components/PricingSection.tsx`, privacy copy
  - **Fix:** Add a separate, unchecked-by-default opt-in: "Send me Links Golf news, course offers, and special events." Keep transactional email (OTP, receipts, renewal notices) outside the opt-in (necessary for service).
- [ ] **Address field collected but unused.** Optional field on signup but persisted to Supabase. Unjustified PII collection. — `client/src/components/PricingSection.tsx:504`, `server/memberProfileFromDb.ts`, `drizzle/schema.ts`
  - **Fix:** Delete the field from the form and the schema (drizzle migration). Or, if address is needed for tax/IVU, mark it required and explain why.
- [ ] **Photo upload lacks specific consent language.** Verification photo is required for signup but the legal copy doesn't mention it. — `client/src/components/PricingSection.tsx:518-562`
  - **Fix:** Add an inline consent line near the upload: "I consent to Links Golf storing this photo solely for identity verification and my digital pass, and to delete it on request or 12 months after my membership ends." Store the version + timestamp alongside the other policy acceptances.
- [ ] **Member photos served via Supabase public URLs.** Once issued, the URL works indefinitely; deleting the row does not revoke the URL until the object itself is purged. — `client/src/lib/supabase.ts`
  - **Fix:** Move the `members` bucket to private; serve via short-TTL signed URLs (`createSignedUrl` with `expiresIn: 86400`). When deleting a member, also delete the object.
- [ ] **`sidebar_state` cookie lacks `Secure` / `SameSite` flags.** Persisted preferences should still carry security attributes. — `client/src/components/ui/sidebar.tsx`
  - **Fix:** Set `document.cookie = 'sidebar_state=…; Path=/; Secure; SameSite=Lax; Max-Age=…'` (Lax is fine for a UI preference; Strict if you prefer).
- [ ] **No cookies / tracking section in the privacy policy.** Even with only first-party functional cookies, EU/PR-aware users expect a section. Google Maps additionally drops third-party cookies once loaded.
  - **Fix:** Add a "Cookies and similar technologies" section listing the session cookie, the sidebar preference cookie, and the Google Maps embed's behaviour with a link to Google's privacy notice.
- [ ] **No breach-notification procedure documented.** PR Act 39 expects notification within timelines (commonly read as without unreasonable delay, with documented protocol).
  - **Fix:** Add `docs/incident-response.md` covering detection, containment, internal notification, customer notification ≤ 48h, regulator notification (where applicable), and post-incident review. Reference it in the privacy policy.
- [ ] **Legal pages are English-only.** Already in P1 i18n, restated here because PR-targeted Spanish-speaking residents are entitled to the policy in Spanish.
  - **Fix:** Translate Privacy, Terms, Refund, and the dashboard's account-deletion copy into Spanish; have a native PR speaker review.
- [ ] **GDPR posture.** No geo-block, no consent banner, no Records of Processing Activities (RoPA), no DPO appointment. Currently relying on "not targeted at EU" — but the site is bilingual and accepts any email.
  - **Fix:** Make a deliberate choice — either (a) **explicitly exclude EU/UK residents** (declaration on signup + Terms clause + decline emails with EU-resolving IPs), or (b) actually comply (CMP for cookies, lawful-basis matrix, DPAs, DSAR endpoint, data minimisation review, breach-notification SLA, RoPA). Option (a) is the realistic one for a PR-only product.
- [ ] **Children's data — confirm and document.** Membership is for adults (golf course access). The privacy policy should state "we do not knowingly collect data from anyone under 18" and Terms should include a 18+ representation.
- [ ] **OTP storage hygiene.** OTPs are in Redis with the email as the key. If Redis is shared / not encrypted at rest, this is a low-level PII exposure. — `server/otpStore.ts`
  - **Fix:** Hash the email (sha256) as the Redis key; store OTP encrypted-at-rest if possible; verify the Upstash/Redis instance uses TLS and at-rest encryption.

**Suggested updates to the existing privacy / terms / refund pages:**

The current `LanguageContext.tsx` legal text reads as a placeholder draft. Before launch, expand to include at minimum:
1. Identity of the controller (full registered business name, PR address — currently placeholder).
2. Categories of personal data collected, source, purpose, legal basis (or "contractual necessity" for PR-specific).
3. Named processor list (see above).
4. Retention schedule (see above).
5. Data-subject rights and how to exercise them (email + dashboard self-service when available).
6. International transfers note (US, possibly EU for Supabase/Stripe sub-processors).
7. Cookies section (see above).
8. Children's data clause.
9. Updates / version history.
10. Effective date / "Last updated" stamp.

Same exercise applies to the Terms (residency representation, photo licence, dispute resolution, governing law = PR, class-action waiver if desired) and the Refund Policy (must match what `charge.refunded` actually does — see Stripe checklist above).

---

### SEO standards (Schema.org / OG / hreflang / robots / sitemap)

> Most foundational SEO findings are already captured in the P1 SEO section above (`robots.txt`, `sitemap.xml`, per-route titles, structured data, canonical hardening). This pass adds standards-specific items and concrete copy-pasteable snippets.

**New items to add to the backlog:**

- [ ] **`hreflang` not declared anywhere.** `og:locale:alternate` is set but the matching `<link rel="alternate" hreflang="...">` is missing. The app serves both languages from the same URL, which Google handles best when you also declare `hreflang="x-default"`. — `client/index.html:3-16`
  - **Fix:** Until separate `/` and `/es/` routes exist, add (in `index.html` and via the SEO plugin):
    ```html
    <link rel="alternate" hreflang="en-US" href="https://linksgolfpr.com/" />
    <link rel="alternate" hreflang="es-PR" href="https://linksgolfpr.com/" />
    <link rel="alternate" hreflang="x-default" href="https://linksgolfpr.com/" />
    ```
- [ ] **`og:locale` does not update at runtime.** Switching to Spanish leaves `og:locale="en_US"`. Less impactful than hreflang because OG tags are read at share-time from the rendered DOM by Slack/Facebook/etc., but still wrong. — `client/index.html:15`
  - **Fix:** When `LanguageContext` switches, also update the `og:locale` meta via DOM (or, better, ship a separate `/es/` index route the SEO plugin builds for the Spanish copy).
- [ ] **`og:image` lacks declared dimensions.** Facebook and LinkedIn fall back to re-fetching the image to discover its size if `og:image:width`/`og:image:height` are absent.
  - **Fix:** Add `<meta property="og:image:width" content="1200" /><meta property="og:image:height" content="630" /><meta property="og:image:type" content="image/png" />` adjacent to the existing `og:image` tag.
- [ ] **No `application/ld+json` structured data.** A high-leverage SEO win for a small business with one product. — `client/index.html`, `vite-plugin-site-seo-html.ts`
  - **Fix:** Inject the following at build time (replace placeholders before launch):

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://linksgolfpr.com/#org",
      "name": "Links Golf PR",
      "url": "https://linksgolfpr.com",
      "logo": "https://linksgolfpr.com/links-golf-membership-brand.png",
      "sameAs": [],
      "contactPoint": [{
        "@type": "ContactPoint",
        "contactType": "customer support",
        "email": "info@linksgolfpr.com",
        "areaServed": "PR",
        "availableLanguage": ["en", "es"]
      }],
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "PR",
        "addressRegion": "Puerto Rico"
      }
    },
    {
      "@type": "Product",
      "@id": "https://linksgolfpr.com/#membership",
      "name": "Links Golf Annual Membership",
      "description": "One membership. 15 partner courses across Puerto Rico. Up to 25% off every round. Digital wallet pass.",
      "brand": { "@id": "https://linksgolfpr.com/#org" },
      "offers": {
        "@type": "Offer",
        "url": "https://linksgolfpr.com/#pricing",
        "priceCurrency": "USD",
        "price": "199.00",
        "availability": "https://schema.org/InStock",
        "eligibleRegion": { "@type": "Country", "name": "Puerto Rico" }
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", "name": "<FAQ 1 title>", "acceptedAnswer": { "@type": "Answer", "text": "<FAQ 1 body>" } }
      ]
    }
  ]
}
</script>
```

  Pull the FAQ entries from `LanguageContext.tsx` at build so the schema mirrors the rendered FAQ. Validate with Google's Rich Results Test before launch.

- [ ] **`SportsActivityLocation` schema for partner courses.** Each of the 15 courses could carry a per-course schema entry that links to a Google Business Profile and surfaces the course in Google Maps SEO. — `client/src/data/partnerCourses.ts`, `client/src/data/courseCoordinates.ts`
  - **Fix:** Either emit a per-course `<script type="application/ld+json">` block on `/courses`, or expose `/courses/{slug}` routes (each with its own schema). The data files already have coordinates, so wiring this up is mostly mechanical.
- [ ] **NotFound page returns HTTP 200 with no `noindex`.** Soft-404. Google may index it as a real page. — `client/src/pages/NotFound.tsx`
  - **Fix:** In the NotFound page component, set `document.title = '404 …'` and inject `<meta name="robots" content="noindex" />` (via the per-route head manager when added). At minimum, render `<meta name="robots" content="noindex">` unconditionally on the 404 page.
- [ ] **No `<link rel="preload" as="image">` for the hero LCP image.** The hero image is loaded via `HeroSection.tsx` style attribute, which the preload scanner can't see, so it competes with the JS bundle and CSS for bandwidth on first paint. — `client/src/components/HeroSection.tsx`
  - **Fix:** Inject `<link rel="preload" as="image" href="<hero-image-url>" fetchpriority="high" />` for the chosen hero into `index.html`. If the hero rotates, preload only the first variant.
- [ ] **Three Google Fonts families is excessive** (Cormorant Garamond, DM Mono, Outfit). Each one adds a render-blocking request unless self-hosted. — `client/index.html:21-23`
  - **Fix:** Drop one family if possible; for the rest, self-host the specific weights actually used; emit `<link rel="preload" as="font" type="font/woff2" crossorigin>` for the LCP-critical face only. Keep `&display=swap` if you stay on Google Fonts.
- [ ] **No geo meta tags.** Optional for SEO, but cheap. — `client/index.html`
  - **Fix:** `<meta name="geo.region" content="PR" /><meta name="geo.placename" content="Puerto Rico" />`.
- [ ] **No `theme-color` / iOS PWA hints.**
  - **Fix:** Add `<meta name="theme-color" content="#…">`, `<link rel="apple-touch-icon" href="...">`, `<link rel="manifest" href="/site.webmanifest">`.
- [ ] **No favicon set explicitly.** Browsers fall back to `/favicon.ico` 404.
  - **Fix:** Generate a favicon set; reference from `index.html`.
- [ ] **`vite-plugin-site-seo-html.ts` is the right place to grow.** It already handles canonical and `og:image` URL absolutisation; extend it to also (a) emit `robots.txt`, (b) emit `sitemap.xml`, (c) inject the JSON-LD block, (d) inject hreflang tags, (e) inject preload links.
- [ ] **NAP (Name, Address, Phone) not present in footer.** Legal pages explicitly say "Registered legal name and principal mailing address will appear here after corporate formation." Until that's done, structured data should not lie — leave `address`/`telephone` out of the schema rather than ship placeholders.
  - **Fix:** Track a launch blocker — get a real PR business address and phone, populate both in the footer and in the Organization schema, then claim a matching Google Business Profile.

**Copy-pasteable `robots.txt` to ship today:**

```
User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /success

Sitemap: https://linksgolfpr.com/sitemap.xml
```

(Disallow the member-only pages so they don't get indexed even on accidental external link.)

**Sitemap plan:** generate at build via the existing SEO plugin; include `/`, `/courses`, `/privacy`, `/terms`, `/refunds`, `/login`. Each entry needs `<lastmod>` (read from git via `child_process.execSync('git log -1 --format=%cI -- <file>')`), a `<priority>`, and the same `hreflang` block as in `index.html`.

---

### PCI DSS SAQ-A boundary review

> Verdict: **Eligible for SAQ-A** today (Stripe Checkout full redirect; no client-side Stripe SDK; no card data in merchant systems; webhook signature verified). But PCI DSS v4.0 (effective March 2025) tightened SAQ-A requirements 6.4.3 and 11.6.1 — the merchant now has to manage scripts and HTTP headers on the payment-adjacent pages. Two new operational items below cover that gap; the rest is record-keeping.

**Confirmed positives (do not regress):**

- Full-redirect Checkout via `stripe.checkout.sessions.create()` (`server/stripe/checkout.ts:47`) — no Elements, no Payment Element, no Stripe.js mounted on the merchant site.
- No `@stripe/stripe-js`, `@stripe/react-stripe-js`, `CardElement`, `CardNumberElement`, `PaymentElement` anywhere in `client/` — confirmed by source search.
- Server `stripe` SDK (`package.json` dep) only used in `server/stripe/*`, never imported by the client bundle.
- Webhook signature verified with `stripe.webhooks.constructEvent` (`server/stripe/routes.ts:32-36`) and raw-body parser mounted before `express.json()`.
- No PAN/CVV/expiry/cardholder-name logged in the payment flow — verified across `server/stripe/*`, `server/routers.ts`, and `client/src/pages/Success.tsx`.

**New PCI v4.0-specific items to add to the backlog:**

- [ ] **6.4.3 — Inventory and manage every script on payment-adjacent pages.** Required for SAQ-A under v4.0. Today there is no inventory and no review gate.
  - **Fix:** Add `docs/pci/payment-page-scripts.md` listing every script loaded on `/`, `/pricing`, `/success`, `/dashboard` (the pages that initiate or terminate the redirect). For each: source, business justification, integrity-check method. Add a PR template checkbox: "Does this change add or modify a script on a payment-adjacent page? If yes, update the inventory."
- [ ] **11.6.1 — Tamper-detection on payment-page headers and scripts.** Required for SAQ-A from 31 March 2025; the website must detect unauthorised modifications to HTTP headers and script content on the payment redirect pages.
  - **Fix:** Cheapest compliant option — a synthetic monitor that hits `/`, `/pricing`, `/success` every ~5 minutes and verifies (a) the security-headers set matches an expected baseline and (b) the SHA-256 of each script `src` matches a recorded baseline. Alert on diff. Document the procedure. (More expensive options: client-side script integrity beacons such as Source Defense or Jscrambler.)
- [ ] **MANUS_DEV_TOOLS hard-off in production.** The `vite-plugin-manus-runtime` debug collector injects a third-party script that captures console logs, network requests, and (in the worst case) session replay. If it ever ends up on a payment-adjacent page in production, the merchant falls into SAQ-A-EP scope. — `vite.config.ts:12-70,156-189`
  - **Fix:** Wrap the plugin so it is _physically impossible_ to enable in a production build (`process.env.NODE_ENV === 'production' ? null : manusDebugCollector()`), not just a runtime env flag. Add a CI test that builds with `NODE_ENV=production` and greps the bundle for `__manus__` / `manus-logs` strings.
- [ ] **HTTP security headers on payment-adjacent pages.** Currently none (covered under ASVS V9.2.1 / V14.4.1 above). For PCI specifically, the minimum is CSP that locks down `script-src` and a Permissions-Policy that disables payment APIs not in use.
  - **Fix:** See the ASVS V9.2.1 item above. PCI adds the requirement that the CSP must be tight enough that an injected script on the pricing page cannot reach card-collection territory — practically that means `script-src 'self' https://js.stripe.com` (Stripe.js loaded **only** on routes that use it; for full-redirect it should not be loaded at all) and `frame-src https://js.stripe.com https://hooks.stripe.com`.
- [ ] **Restrict the webhook endpoint to Stripe egress IPs.** Defence-in-depth on top of signature verification.
  - **Fix:** Maintain an allowlist of [Stripe's documented egress IP ranges](https://docs.stripe.com/ips) at the WAF / reverse proxy. Reject other clients with 404.
- [ ] **Record-keeping checklist for the annual SAQ-A submission:**
  - [ ] Obtain Stripe's PCI DSS Level 1 Attestation of Compliance (renewed annually); store in `docs/pci/`.
  - [ ] Designate a responsible person and submission cadence with the acquiring bank.
  - [ ] Maintain a one-page network/data-flow diagram showing that card data never crosses merchant infrastructure.
  - [ ] Retain SAQ-A signed AOCs for ≥1 year (PCI requirement 12.10.4) — many banks ask for 3.
  - [ ] Document the change-control gate for anything that touches payment-adjacent pages.
- [ ] **Vulnerability scan** (ASV scan) — not required for SAQ-A by default, but some acquirers ask for one. Confirm with the bank.

**Risk if the items above are not done:** the merchant remains _technically_ SAQ-A but cannot honestly attest to PCI DSS v4.0 6.4.3 / 11.6.1 on the next renewal — banks will increasingly enforce this in 2026.

---

### Stripe Integration Checklist — source-based audit

> Walked against Stripe's official integration checklist for Checkout + subscriptions + webhooks. New findings below; existing P0 Payments items remain authoritative for those topics.

**New findings to add to the backlog:**

- [ ] **Open-redirect risk in Checkout `success_url`.** `client/src/components/PricingSection.tsx` builds `successUrl` from `window.location.origin` + user-controlled email/memberId. If the page is ever rendered via an iframe/redirect on a malicious host, the user-controlled portion can be abused to bounce off `linksgolfpr.com@evil.tld`. — `client/src/components/PricingSection.tsx:149-154`
  - **Fix:** Build the origin server-side from `VITE_PUBLIC_SITE_ORIGIN` (already used by the SEO plugin); validate the final URL with `new URL(...).origin === EXPECTED_ORIGIN` before passing to Stripe. Strip `email` from the URL entirely — it's already in the Stripe Session.
- [ ] **No idempotency key on `stripe.checkout.sessions.create()`.** A retried request could create a second session and a second charge attempt for the same user. — `server/stripe/checkout.ts:47`
  - **Fix:** Pass `{ idempotencyKey: crypto.randomUUID() }` as the second argument; cache the key for ~24h keyed by `(memberId, paymentType)` so genuine retries reuse it.
- [ ] **PII in Checkout Session `metadata`.** `customer_email` and `customer_name` are duplicated into metadata. Stripe metadata is visible to anyone with a read API key. — `server/stripe/checkout.ts:52-57`
  - **Fix:** Remove email/name from metadata; rely on the native `customer_email` parameter. Keep only opaque ids (member id, internal request id).
- [ ] **No Puerto Rico IVU handling.** The annual membership is a digital service taxable in PR (IVU 10.5% state + 1% municipal in San Juan; verify with counsel). Currently sold tax-inclusive without disclosure.
  - **Fix:** Decide on the tax position with an accountant. Most likely: enable `automatic_tax: { enabled: true }` on the Checkout Session and add a Tax registration for PR in the Stripe dashboard. Update pricing copy to show "+ IVU" or "tax included".
- [ ] **Missing critical webhook events.** Currently handled: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`. Missing:
  - `invoice.payment_failed` — needed to mark `past_due` and to email the member.
  - `checkout.session.expired` — needed to clean up server-side state on abandoned checkouts.
  - `checkout.session.async_payment_failed` — relevant for bank-debit / ACH retries.
  - `charge.refunded` — must revoke membership when a refund is issued (or you'll keep serving customers who got their money back).
  - `charge.dispute.created` / `closed` — chargeback handling; needs ops alert + evidence capture.
  - `customer.subscription.trial_will_end` — N/A while no trial exists.
  - — `server/stripe/webhook.ts:17-44`
  - **Fix:** Add handlers; map each to the `membership_status` enum (see ASVS data-model item).
- [ ] **Webhook returns 2xx even when the DB write fails.** The handler catches errors and still responds `200`, so Stripe never retries. — `server/stripe/webhook.ts:40-46`
  - **Fix:** Return `res.status(500).json(...)` on any unhandled exception. Only respond 2xx after the side-effects are durably committed.
- [ ] **No webhook-event timestamp tolerance.** `event.created` is not compared to current time, so a stolen-but-not-replayed-yet event can be replayed indefinitely. — `server/stripe/routes.ts`
  - **Fix:** Reject events where `Math.abs(Date.now()/1000 - event.created) > 300`. (Stripe's own SDK does this via the `tolerance` argument to `constructEvent` if you set it — pass `{ tolerance: 300 }`.)
- [ ] **No `livemode` cross-check.** Test events to a production server (or vice versa) silently process. — `server/stripe/webhook.ts`, `server/stripe/client.ts`
  - **Fix:** Refuse to process events whose `event.livemode` does not match `NODE_ENV === 'production'`.
- [ ] **No pinned `apiVersion` on the Stripe client.** Stripe will auto-upgrade SDK behaviour on new dashboard versions, which can change webhook payloads mid-flight. — `server/stripe/client.ts`
  - **Fix:** `new Stripe(secret, { apiVersion: '2024-11-20.acacia' })` (use the version your code was tested against; bump deliberately with a regression pass).
- [ ] **No Stripe Billing Portal session.** Members cannot self-serve cancellation, payment-method changes, invoice downloads. The dashboard rolls its own custom cancellation UI instead. — `server/member.payments.ts`, `client/src/components/PaymentHistory.tsx`
  - **Fix:** Add a tRPC mutation `member.createBillingPortalSession` that calls `stripe.billingPortal.sessions.create({ customer, return_url })` and link to it from the dashboard. Keep the in-app cancel button as a shortcut.
- [ ] **No reactivation flow.** Once a member toggles "cancel at period end", the only recourse is to wait until expiry and re-checkout.
  - **Fix:** Allow `stripe.subscriptions.update(id, { cancel_at_period_end: false })` while still inside the active period; expose in the dashboard.
- [ ] **Dashboard does not surface "pending cancellation" or "past due" prominently.** — `client/src/components/PaymentHistory.tsx`, `client/src/pages/Dashboard.tsx`
  - **Fix:** Banner styles for `cancelAtPeriodEnd === true` ("Your membership ends on …") and for `status === 'past_due'` ("Payment failed — update your card").
- [ ] **No `statement_descriptor`.** Members will see a generic Stripe-default string on their card statement and may dispute the charge ("I don't recognise this").
  - **Fix:** `payment_intent_data: { statement_descriptor_suffix: 'LINKS GOLF PR' }` for one-time mode, or set the descriptor on the Stripe Product for subscriptions. Max 22 chars; uppercase A-Z plus space/dash.
- [ ] **Apple Pay / Google Pay not advertised.** Stripe Checkout supports them via `payment_method_types`, but currently restricted to `card`. — `server/stripe/checkout.ts:48`
  - **Fix:** Use `payment_method_types: ['card']` only if intentional; otherwise remove the field so Checkout enables wallets automatically.
- [ ] **No test-mode vs live-mode guardrail.** Nothing prevents booting prod with a `sk_test_…` key (or vice versa). — `server/stripe/client.ts`
  - **Fix:** At boot, assert `NODE_ENV === 'production'` ⇒ secret key starts with `sk_live_` (and webhook secret with `whsec_` issued by the live endpoint).
- [ ] **`drizzle` schema lacks a `membership_status` enum.** Only `isActive` / `isCanceled` booleans, which can't represent `past_due`, `incomplete`, `unpaid`, `trialing`. — `drizzle/schema.ts`
  - **Fix:** Add `mysqlEnum('membership_status', ['active','past_due','canceled','unpaid','incomplete','incomplete_expired','trialing'])` with default `'active'`; backfill from existing booleans.
- [ ] **Webhook tests cover only happy paths.** No tests for: replayed event, out-of-order events, signature failure, `invoice.payment_failed`, refund, dispute, livemode mismatch. — `server/stripe.webhook.test.ts`
  - **Fix:** Add a test per case.
- [ ] **Webhook-secret rotation not documented.** No process for zero-downtime rotation (Stripe supports multiple active endpoint secrets — your code must accept either).
  - **Fix:** Allow `STRIPE_WEBHOOK_SECRET` to be a comma-separated list; try each in turn; document the rotation procedure in `docs/stripe-operations.md`.
- [ ] **Refund policy page must match webhook behaviour.** If `charge.refunded` revokes membership, the policy needs to say so explicitly. — `client/src/pages/RefundPolicy.tsx`
  - **Fix:** Reconcile the legal copy with the implemented behaviour before launch; add a "last updated" date.
- [ ] **No reconciliation tooling.** No way to fix the inevitable Stripe ↔ DB drift (e.g. webhook delivery failures during incidents).
  - **Fix:** Add an admin script `pnpm tsx server/scripts/reconcile-stripe.ts` that pages through `stripe.subscriptions.list({status:'all'})` and rebuilds member rows from Stripe truth.
- [ ] **Stripe CLI not in scripts.** Local webhook testing is not one command away.
  - **Fix:** Add `"stripe:listen": "stripe listen --forward-to localhost:3000/api/stripe/webhook"` and `"stripe:trigger": "stripe trigger checkout.session.completed"` to `package.json`.

**Risk-ranked top 10 (combining new + existing P0 Stripe items):**

1. Webhook not idempotent (existing P0).
2. Open-redirect risk in `success_url` (new).
3. Webhook returns 2xx on DB error → Stripe never retries (new).
4. No `invoice.payment_failed` handler → failed renewals don't revoke access (new).
5. Subscription `status` transitions ignored (existing P0).
6. No `charge.refunded` handler → refunded members stay active (new).
7. IDOR in `member.createCheckout` (existing P0).
8. No `membership_status` enum / no FK / no Stripe-id indexes (existing P1 DB items).
9. PII in Checkout Session metadata (new).
10. No Stripe Billing Portal — manual cancel/refund/payment-method flows hit support (new).

---

### OWASP ASVS 4.0.3 (Level 1 + key Level 2) — source-based audit

> Estimated conformance: **~28 of 45 audited L1+L2 reqs PASS (≈ 62 %)**. Categories with the worst pass rate: V9 Communication (headers), V7 Logging, V11 Business logic, V12 SSRF, V14 Config.
>
> Each item below maps to an ASVS requirement ID. The existing P0/P1 audit already covers many ASVS findings; only **new** items are listed here. The "Existing → ASVS mapping" block at the end cross-references the P0/P1 items for traceability.

**New ASVS findings to add to the backlog:**

- [ ] **V9.2.1 / V14.4.1 — No HTTP security headers.** Express ships no CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, or `Cross-Origin-Resource-Policy`. — `server/_core/index.ts`
  - **Fix:** Add `helmet()` middleware before the tRPC router. Minimum CSP: `default-src 'self'; script-src 'self' https://js.stripe.com https://maps.googleapis.com; img-src 'self' data: https://*.unsplash.com https://*.googleusercontent.com; frame-src https://js.stripe.com; connect-src 'self' https://api.stripe.com`. HSTS: `max-age=31536000; includeSubDomains; preload` (prod only). Frame-options: `DENY`.
- [ ] **V12.6.1 — Server-side request forgery in image/voice handlers.** `voiceTranscription.ts` and `imageGeneration.ts` fetch arbitrary external URLs supplied by request input. An attacker can probe internal services (cloud metadata `169.254.169.254`, internal IPs). — `server/_core/voiceTranscription.ts`, `server/_core/imageGeneration.ts`
  - **Fix:** Validate URLs against an allowlist (S3 bucket(s), Supabase storage, public CDN); reject private IP ranges (`10/8`, `172.16/12`, `192.168/16`, `127/8`, `169.254/16`, `::1`); enforce response-size and timeout limits; disable redirects (or follow with the same checks). Or remove these endpoints entirely if they're vestigial (see V14.3.1 below).
- [ ] **V7.1.1 / V7.1.3 — PII and OTP logged.** OTP is logged in dev mode (`server/routers.ts:119-120`); email addresses are logged in `sendOtpEmail` and `verifyOtp` happy paths; raw Resend/Supabase/Stripe error responses are logged verbatim and can contain auth headers. — `server/email.ts:52,119`, `server/routers.ts`
  - **Fix:** Remove OTP from logs entirely (even in dev). Hash emails before logging (`sha256(email).slice(0,8)`). Wrap third-party calls in a helper that strips known sensitive keys (`authorization`, `set-cookie`, `api-key`) before logging.
- [ ] **V14.1.1 — Build-time source map policy.** `esbuild` step has no `--sourcemap` flag (so server source maps are off, good), but Vite default behaviour for production is no source maps (good). However there is no explicit policy or assertion, so a config change could silently start shipping them.
  - **Fix:** In `vite.config.ts`, explicitly set `build.sourcemap: 'hidden'` and upload them to your error tracker out-of-band. Add a CI check that `dist/public/assets/*.map` is not present.
- [ ] **V10.2.1 — No dependency audit in CI.** `pnpm-lock.yaml` is checked in but no automated audit runs. — `package.json`, no `.github/workflows/`
  - **Fix:** Add a job that runs `pnpm audit --prod --audit-level=moderate` on every PR. Pin tool versions; review the lockfile in code review.
- [ ] **V10.3.1 — No SBOM / provenance.**
  - **Fix:** Generate a CycloneDX SBOM at build (`pnpm dlx @cyclonedx/cyclonedx-npm`) and attach to releases.
- [ ] **V7.2.1 — No request correlation id, no structured logging.** ≈ 80 raw `console.*` calls.
  - **Fix:** Adopt `pino`; mint a `x-request-id` UUID in an Express middleware, attach to `ctx` for tRPC, include in every log line.
- [ ] **V6.1.1 — No data classification.** Email, phone, member photo, Stripe customer id, subscription state, payment history — no documented sensitivity level.
  - **Fix:** Add a short `docs/data-classification.md` mapping every column to one of {Public, Internal, Confidential, Restricted}. Use it to drive log redaction and access-control reviews.
- [ ] **V14.3.1 / V1.2.1 — Unused-but-registered server modules.** `server/_core/{heartbeat,notification,dataApi,storageProxy,systemRouter,map,oauth,imageGeneration,voiceTranscription,llm,sdk}.ts` exist. Each one that's wired into the Express/tRPC router is reachable attack surface; each one that's dead code is maintenance debt.
  - **Fix:** Audit `server/_core/index.ts` and `server/_core/systemRouter.ts` for which of these modules are actually mounted. Delete every unused module. For the ones that stay, ensure each has auth + rate-limit + input validation.
- [ ] **V14.2.1 — No Subresource Integrity on third-party scripts.** If/when Stripe.js or Google Maps are loaded from their CDN.
  - **Fix:** For Stripe.js, SRI isn't supported by Stripe (they require their live CDN script). For Google Maps, document why SRI is intentionally absent.
- [ ] **V3.4.2 — `Secure` cookie flag conditional on `req.protocol`.** Correct when `trust proxy` is set; risky if it isn't (cookie issued without `Secure` over an HTTPS load balancer). — `server/_core/cookies.ts`, `server/_core/index.ts`
  - **Fix:** Force `secure: true` whenever `NODE_ENV === 'production'`; let dev opt out via env var.
- [ ] **V11.1.4 — Rate limiting only covers OTP send.** Login verify, checkout creation, profile updates, photo upload, payment history queries are unlimited per client.
  - **Fix:** Add an Express-level rate limiter (`express-rate-limit` with a Redis store) keyed by IP + member id where applicable. Suggested ceilings: 60 req/min/IP global, 10 checkouts/hr/member, 30 verify attempts/hr/email.
- [ ] **V5.1.2 — `as any` casts on Stripe period fields.** — `server/member.payments.ts:92,98` (already P0 but tagged here for ASVS traceability).

**Existing P0/P1 items mapped to ASVS IDs (for traceability):**

| ASVS req | Existing TODO item |
|---|---|
| V2.2.1 | Hard-coded JWT fallback secret |
| V2.6.1 | Non-atomic OTP `verifyAndConsumeOtp` |
| V2.6.2 | No per-OTP attempt cap |
| V2.9.1 | In-memory OTP fallback in production |
| V3.7.1 | No CSRF protection on tRPC mutations |
| V4.1.1 | IDOR in `member.createCheckout` |
| V8.2.1 | PII in `localStorage` |
| V11.1.2 | Webhook not idempotent |
| V11.1.3 | Subscription state transitions ignored |
| V14.3.1 | Manus platform coupling / debug collector |

**Threat-model gap (V1):** there is no `docs/threat-model.md`; before launch it should at least cover (a) the OTP flow, (b) the Stripe checkout/webhook flow, (c) the photo upload + S3 path, (d) the Supabase service-role data path. Even a one-page STRIDE-style listing is enough.

---

### WCAG 2.1 Level A + AA — per-criterion source walk

> axe-core could not be run (no browser available in sandbox; Playwright Chromium download blocked). This is a source-based walk; criteria not listed below were N/A or PASS. Re-run axe-core in a browser once available to confirm.

Pass summary (Level A + AA): **PASS** — 1.3.2, 1.3.3, 1.3.4, 1.3.5, 1.4.1, 1.4.4, 1.4.5, 1.4.10, 1.4.11, 1.4.12, 2.1.2, 2.1.4, 2.2.1, 2.3.1, 2.4.3, 2.4.4, 2.4.7, 2.5.1, 2.5.2, 2.5.3, 2.5.4, 3.2.1, 3.2.2, 3.2.3, 3.2.4, 3.3.1, 3.3.3, 4.1.1, 4.1.3.

**New failures (not already in the P1 Accessibility section above):**

- [ ] **1.3.1 / 3.3.2 / 2.4.6 — Form labels are not associated with their inputs.** `<label>` tags lack `htmlFor`; inputs have `id` but no programmatic binding. Screen readers cannot announce labels when focusing the input. — `client/src/components/PricingSection.tsx:454-510`, `client/src/pages/Login.tsx:162-176,221`
  - **Fix:** Add `htmlFor="inp-firstname"` (etc.) on every `<label>`; or use Radix `<Label>` with `htmlFor`. Same for OTP / email fields on Login.
- [ ] **2.1.1 / 2.4.1 — No skip-to-main-content link.** Keyboard users must tab through the full navbar on every page. — `client/src/App.tsx`, `client/index.html`
  - **Fix:** Inject `<a href="#main" class="sr-only focus:not-sr-only">Skip to main content</a>` as the first focusable element, and wrap each page in `<main id="main" tabindex="-1">`.
- [ ] **2.4.2 — Page Titled.** Every route shares one static `<title>`. Dashboard, Success, Login, 404, legal pages all announce as "Links Golf Membership · Play More, Pay Less". — `client/index.html:6`
  - **Fix:** Update `document.title` per route (small `usePageTitle(title)` hook), or use `react-helmet-async`. Suggested titles: `"Member dashboard · Links Golf PR"`, `"Welcome aboard · Links Golf PR"`, `"Sign in · Links Golf PR"`, `"Page not found · Links Golf PR"`, `"Privacy policy · Links Golf PR"`, etc.
- [ ] **2.4.5 — Multiple Ways.** No sitemap, no breadcrumbs, no search; only the in-page nav exposes content. — `client/public/`
  - **Fix:** Adding the `sitemap.xml` listed in P1 SEO also satisfies this criterion.
- [ ] **3.1.2 — Language of Parts.** When Spanish is selected, Spanish content inside an `<html lang="en">` document needs `lang="es"` on each translated block, OR the document `lang` must switch (preferred — see P1 Accessibility). Additionally any English brand name inside Spanish text (e.g. "Links Golf") could carry `lang="en"` for screen-reader pronunciation. — `client/index.html:2`, `client/src/contexts/LanguageContext.tsx`
  - **Fix:** Switching `document.documentElement.lang` (already in P1) handles the page-level case. Apply `lang="en"` selectively to "Links Golf"/"Stripe" in Spanish copy if pronunciation testing reveals issues.
- [ ] **3.3.4 — Error Prevention (Legal, Financial, Data).** Signup posts directly to Stripe with no confirmation step ("review your details"). Photo upload has no preview/crop before submit. — `client/src/components/PricingSection.tsx`
  - **Fix:** Add a final review step (name / email / phone / photo preview) before triggering `createCheckout`. Allow "Edit" to go back without losing entered data.
- [ ] **4.1.2 — Name, Role, Value.** The four legal-consent checkboxes (residency, terms, privacy, refund) have visible text adjacent but no programmatic name. — `client/src/components/PricingSection.tsx:435,584,600,616`
  - **Fix:** Each `<input type="checkbox">` needs an `id` and the surrounding text needs a `<label htmlFor>` (or an `aria-labelledby`).
- [ ] **Navbar logo `href="#"` with `e.preventDefault()`.** Not an A/AA failure in itself, but `href="#"` is a known anti-pattern for keyboard users (it focuses the URL bar in some browsers). — `client/src/components/Navbar.tsx:56-70`
  - **Fix:** Use `href="/"` and let Wouter intercept, or switch to a `<button>` with the scroll handler.

**Already-listed failures re-confirmed against WCAG (now mapped to specific criteria):**

- 2.5.5 / 1.4.4 — `maximum-scale=1` (already P1).
- 3.1.1 — `<html lang>` never updates (already P1).
- 1.1.1 — Brand/member photos use `alt=""` (already P1).
- 2.4.7 / 2.1.2 — Modal focus management (already P1; note Radix Dialog gives this for free where used; verify ManusDialog and any custom overlays).
- 1.4.3 — Contrast on hero green em-text (already P1; needs browser-based contrast measurement to confirm).
- 1.3.1 — Missing semantic landmarks (already P1).
- 3.1.2 — Legal pages, NotFound, ErrorBoundary are English-only despite bilingual app (already P1).

**Items needing browser/axe-core verification (cannot be confirmed from source alone):**

- 1.4.3 Contrast (Minimum) on every text/background pair — particularly hero `oklch(0.65 0.16 145)` over the gradient, eyebrow labels on the F7F3EC cream, and any frosted-container text.
- 1.4.11 Non-text Contrast on form borders, focus rings against frosted backgrounds, and the filter pills.
- 1.4.13 Content on Hover/Focus — verify any tooltip/popover dismisses with `Escape` and remains visible while hovered.
- 2.4.7 Focus Visible against every background (some backgrounds may hide a white outline).
- 4.1.3 Status Messages — verify form submission errors and the photo-upload spinner are announced (need `aria-live="polite"`/`aria-busy`).

---

## Archive — historical project checklist (prior state)

> Preserved verbatim from the previous `todo.md`. Many of these are claimed complete but several items below overlap with the audit findings above and should be re-verified.

### Batch D — Payments & Membership Management
- [x] Stripe sandbox provisioned and environment variables configured
- [x] Database schema: `members` table with Stripe identifiers and membership status
- [x] Backend Stripe helpers: `products.ts`, `checkout.ts`, `webhook.ts`
- [x] Database query helpers: `getMemberByUserId`, `getMemberByStripeCustomerId`, `upsertMember`
- [x] Webhook handler: processes `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`
- [x] tRPC procedure: `member.createCheckout` for initiating checkout sessions
- [x] Unit tests: webhook event handling (5 tests) and database operations
- [x] Webhook route: `/api/stripe/webhook` Express endpoint to receive Stripe events
- [x] Pricing section: add "Subscribe Now" / "Buy Once" buttons that trigger checkout
- [x] Checkout modal or redirect: call `trpc.member.createCheckout` and open Stripe session URL
- [x] Success page: display membership confirmation and digital member card
- [x] Member dashboard: show subscription status, renewal date, payment history
- [x] tRPC procedures: `paymentHistory`, `subscriptionStatus`, `cancelSubscription`
- [x] PaymentHistory component: display invoices and subscription status
- [ ] Test card 4242 4242 4242 4242 end-to-end (still unchecked — see P0)
- [ ] Verify webhook delivery and member record updates
- [ ] Test subscription renewal flow
- [ ] Test cancellation flow

### Batches A–C (Marketing, OTP/auth, Dashboard) — claimed complete
- [x] All bilingual hero / benefits / courses / how-it-works / pricing / FAQ / footer sections
- [x] OTP generation + rate limiting + welcome email + Supabase service-role fetches
- [x] Member session JWT in httpOnly cookie, dashboard, logout

### Known issues carried over
- [ ] Stripe sandbox must be claimed by 2026-07-12
- [ ] Update Settings → Payment with live credentials post-KYC
- [ ] Test 99% discount promo code in live mode
- [ ] Stripe minimum transaction is $0.50 USD
- [ ] Course coordinates: verify remaining resorts on satellite map

### Design / polish backlog
- [ ] Member card animation and interactions
- [ ] Checkout form styling and validation
- [ ] Success page celebration animation
- [ ] Email template improvements
- [ ] Mobile-specific optimizations
- [ ] WCAG 2.1 AA audit

### Deployment & go-live
- [ ] Final QA pass on all flows
- [ ] Stripe KYC verification and live key activation
- [ ] Custom domain (linksgolfpr.com)
- [ ] Analytics integration
- [ ] Monitoring + error tracking
- [ ] Launch announcement
