# Deploy smoke — trust / SEO (Sprint B)

## Automated (local CI)

From the repo root, with Chromium installed (`pnpm playwright:install`):

```bash
pnpm smoke
```

This runs Playwright against the dev server (`e2e/screenshots/deploy-smoke.spec.ts`). It asserts `/`, `/courses`, and `/login` stay on the app origin after load (no surprise redirect to Manus OAuth hosts).

To hit a **deployed** preview instead:

```bash
PLAYWRIGHT_BASE_URL=https://linksgolfpr.manus.space pnpm exec playwright test e2e/screenshots/deploy-smoke.spec.ts --config=playwright.config.ts
```

Omit `webServer` by setting `CI=1` and ensuring the server is already running, or add a dedicated smoke config later if you need that path often.

## Production build — canonical + Open Graph URL

Set in the environment **before** `pnpm build`:

| Variable | Purpose |
|----------|---------|
| `VITE_PUBLIC_SITE_ORIGIN` | e.g. `https://linksgolfpr.com` (no trailing slash). Injects `<link rel="canonical">`, `<meta property="og:url">`, and absolute `og:image` / `twitter:image` for `/og-share.png`. |
| `VITE_OG_TITLE_ES` | Optional. Spanish site name hint in JSON-LD (`alternateName`). |
| `VITE_OG_DESCRIPTION_ES` | Optional. Spanish summary in JSON-LD (`abstract`). |

Leave `VITE_PUBLIC_SITE_ORIGIN` **unset** on temporary hosts so canonical URLs do not point at the wrong domain.

### Manus preview (`linksgolfpr.manus.space`)

When Manus builds and hosts this repo at **https://linksgolfpr.manus.space**, you can either:

- **Leave `VITE_PUBLIC_SITE_ORIGIN` unset** — share tags keep **relative** `/og-share.png` (fine for links shared as the Manus URL; no canonical / `og:url` in HTML).
- **Set `VITE_PUBLIC_SITE_ORIGIN=https://linksgolfpr.manus.space`** in Manus build env (if the platform exposes Vite env vars) — canonical + `og:url` + absolute image URLs match the **preview** host. Use this only for Manus builds; use `https://linksgolfpr.com` for Cloudflare production builds.

Do **not** set `VITE_PUBLIC_SITE_ORIGIN` to `linksgolfpr.com` on the Manus pipeline unless the files Manus deploys are actually what visitors get at that domain.

Verify the built HTML:

```bash
VITE_PUBLIC_SITE_ORIGIN=https://linksgolfpr.com pnpm build && grep -E 'canonical|og:url|og:image' dist/public/index.html
```

For a Manus-aligned local check:

```bash
VITE_PUBLIC_SITE_ORIGIN=https://linksgolfpr.manus.space pnpm build && grep -E 'canonical|og:url|og:image' dist/public/index.html
```

## Manual — share debuggers (after deploy)

- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [X (Twitter) Card Validator](https://cards-dev.twitter.com/validator) or post a test link
- iMessage / WhatsApp: paste the production URL in a note-to-self thread

Re-scrape after each OG image or copy change.

## Manual — no extra login wall

1. Open the site in a **private window** (no cookies).
2. Load `/`, `/courses`, `/login` — each should render without redirecting to `manus.im` / OAuth before you click **Login**.
