# Multi-model design review (screenshot-driven) — results

**Inputs:** PNG pack from `e2e/screenshots/output/` after `pnpm screenshots` (30 files: 3 viewports × 2 languages × 5 captures). **Reviewer brief:** [`design-review-reviewer-brief.md`](design-review-reviewer-brief.md).

**Scope note:** Captures were inspected via the screenshot set (hero, pricing desktop/tablet/mobile, courses mobile, login mobile EN). Login frames in this environment show **“Supabase is not configured”** when `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are absent; re-run screenshots with a configured `.env` to review the real OTP UI.

---

## Model A — Conversion / CRO lens

Bias: LIFT-style value clarity, CTA prominence, objection handling, trust near money.

| Finding | Goal | Page / file | Viewport | Sev | Evidence | Recommendation |
|--------|------|-------------|----------|-----|----------|----------------|
| Above-the-fold mobile lacks a **primary revenue CTA** in the first viewport | 1 | `home-hero-iphone16pro402-en.png` | iphone16pro402 | L | Only logo, hamburger, and small “Exclusive for Puerto Rico residents” pill; no “Get membership” or scroll hint in frame | Add an in-hero primary button or short subline + chevron (“See plans”) above the fold on narrow breakpoints |
| Desktop hero exposes **GET YOUR MEMBERSHIP** next to Login and language | 1 | `home-hero-desktop1440-en.png` | desktop1440 | S | Green CTA visible top-right; standard pattern | Keep; A/B microcopy only if conversion data stalls |
| Pricing block pairs **$199/yr**, checklist, and **savings math** (“membership already paid for”) | 1 | `home-pricing-desktop1440-en.png`, `home-pricing-iphone16pro402-en.png` | desktop1440, iphone16pro402 | S | Strong proof stack beside or above form | Consider repeating savings headline inside Payment tab for users who skip hero |
| Mobile pricing shows **sticky bar** with price summary + **GET YOUR MEMBERSHIP** | 1 | `home-pricing-iphone16pro402-en.png` | iphone16pro402 | S | Footer bar persists while form/tabs visible | Validate sticky does not cover inputs keyboard on iOS |
| Multi-step tabs (**Details / Payment / Digital ID**) set expectation of commitment | 1 | `home-pricing-*.png` | all | M | Three steps visible before card completion | Add progress % or “Step 1 of 3” microcopy if drop-off is high |
| Course directory buries **GET YOUR MEMBERSHIP** below a long table | 1 | `courses-directory-iphone16pro402-en.png` | iphone16pro402 | M | Strong closing CTA block after many rows | Add mid-page CTA or compact “Join” strip after filters / first 5 rows |
| Login frame is a **tech blocker**, not a member journey | 1 | `login-email-iphone16pro402-en.png` | iphone16pro402 | L (staging) | Amber box: Supabase env missing | Configure secrets for screenshot CI and prod; keep friendly copy for misconfig |
| “Puerto Rico residents” exclusivity is visible but **small on mobile hero** | 1 | `home-hero-iphone16pro402-en.png` | iphone16pro402 | M | Badge present but low visual weight vs scenery | Slightly larger badge or repeat near pricing |

---

## Model B — UX / friction & usability lens

Bias: Nielsen-style heuristics, readability, density, error states, bilingual consistency.

| Finding | Goal | Page / file | Viewport | Sev | Evidence | Recommendation |
|--------|------|-------------|----------|-----|----------|----------------|
| **Center nav links** may sit over bright sky — contrast risk | 2 | `home-hero-desktop1440-en.png` | desktop1440 | M | White text on variable photo luminance | Add scrim behind nav row on scroll, or `text-shadow` / solid bar; verify with contrast tooling |
| Mobile hero: **hamburger-only** navigation hides Benefits / FAQ paths | 2 | `home-hero-iphone16pro402-en.png` | iphone16pro402 | M | No in-viewport anchors | Ensure menu exposes same IA; consider one-tap “Pricing” in menu |
| Pricing form: many fields in **Details** tab | 2 | `home-pricing-desktop1440-en.png` | desktop1440 | S | Clear labels and placeholders (Juan / PR phone) | Keep autofill hints; group address as optional if allowed by business rules |
| **“No blackout dates”** uses different icon than other bullets (per tablet frame) | 2 | `home-pricing-tablet834-en.png` | tablet834 | S | Visual inconsistency in checklist | Align iconography for scan speed |
| Course table on **402px width**: dense columns, type chips near edge | 2 | `courses-directory-iphone16pro402-en.png` | iphone16pro402 | M | Long scroll; wrapped names | Card layout or horizontal scroll for row details on `sm` |
| Sticky CTA + tabs reduce visible form height | 2 | `home-pricing-iphone16pro402-en.png` | iphone16pro402 | S | Footer + tabs consume vertical space | QA focus order and scroll padding when keyboard opens |
| Login misconfiguration message is **clear and calm** | 2 | `login-email-iphone16pro402-en.png` | iphone16pro402 | S | Amber panel, monospace env names | Add “Contact support” link for members stuck in prod misconfig |
| Spanish parity | 2 | `*-es.png` (not individually inspected in this pass) | all | S | Filenames exist for full matrix | Spot-check ES for line breaks in pricing and directory |

---

## Synthesis (third pass)

**Merged themes:** Mobile first viewport is **brand-strong but CTA-weak**; pricing and sticky UI **recover conversion** once users scroll; **courses** page is informative but **late CTA** on small screens; **login** capture is **env-dependent**.

### Top 10 (ordered for Goal 1 impact)

1. **Mobile hero CTA gap** — Add visible primary action or explicit scroll affordance in hero on `iphone16pro402` (and verify `es`). *[`HeroSection.tsx`](client/src/components/HeroSection.tsx), [`Navbar.tsx`](client/src/components/Navbar.tsx)*  
2. **Ensure real login UI in review artifacts** — Wire `.env` in screenshot CI so `login-email-*` show OTP flow, not misconfig. *[`Login.tsx`](client/src/pages/Login.tsx), Playwright env*  
3. **Courses mobile: earlier conversion path** — Mid-page or sticky mini-CTA before end of table. *[`Courses.tsx`](client/src/pages/Courses.tsx)*  
4. **Nav contrast on photo** — Reduce risk of illegible white-on-sky for Benefits / FAQ links. *[`Navbar.tsx`](client/src/components/Navbar.tsx)*  
5. **Sticky pricing bar vs keyboard** — iOS QA for field overlap when entering Details. *[`PricingSection.tsx`](client/src/components/PricingSection.tsx), [`StickyCTA.tsx`](client/src/components/StickyCTA.tsx)*  
6. **Multi-step transparency** — “Step 1 of 3” (or %) on Details tab if analytics show abandonment. *[`PricingSection.tsx`](client/src/components/PricingSection.tsx)*  
7. **Residency badge prominence (mobile)** — Slightly stronger treatment so eligibility is not missed. *[`HeroSection.tsx`](client/src/components/HeroSection.tsx)*  
8. **Savings proof in Payment step** — One-line reminder of savings example for users landing deep-linked to `#pricing`. *[`PricingSection.tsx`](client/src/components/PricingSection.tsx)*  
9. **Directory row density** — Card or accordion pattern on narrow widths to cut horizontal tension. *[`Courses.tsx`](client/src/pages/Courses.tsx)*  
10. **Checklist icon consistency** — Align “no blackout dates” marker with other benefit checks. *[`PricingSection.tsx`](client/src/components/PricingSection.tsx)*  

**Conflicts resolved:** Model A flagged “no CTA” on mobile hero as large; Model B emphasized nav contrast and hamburger friction. **Synthesis:** Treat missing **first-screen action** as higher priority than contrast polish, but track nav readability as a close second — both affect drop-off before pricing.

---

## How to regenerate

```bash
pnpm screenshots
```

Outputs: `e2e/screenshots/output/*.png` (gitignored).
