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
