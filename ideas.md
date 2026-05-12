# Links Golf Membership — Design Concepts

## Concept A: "Fairway Luxe"

<response>
<text>
**Design Movement:** Contemporary Golf Club Prestige — inspired by luxury resort branding (Augusta National meets modern Caribbean hospitality)

**Core Principles:**
- Deep forest green as the dominant tone, contrasted with warm champagne/gold accents
- Asymmetric editorial layouts that feel like a premium golf magazine spread
- Conversion-first hierarchy: price, savings, and CTA are always within thumb reach on mobile
- Photography-forward: full-bleed course imagery anchors every section

**Color Philosophy:**
Anchored in deep forest green `#1A3A2A` and warm off-white `#F5F0E8` (parchment), with a burnished gold `#C9A84C` as the accent. The palette evokes the smell of fresh-cut fairways and the warmth of a Puerto Rico afternoon. Green communicates trust, nature, and sport; gold signals exclusivity and value.

**Layout Paradigm:**
Diagonal section dividers cut across the page at 4–6 degree angles, creating a sense of forward motion. The hero is a full-viewport split: left 60% is a vivid course photograph with overlaid headline text, right 40% is a dark card with the membership price and CTA. On mobile, the photograph fills the full viewport with text overlaid at the bottom third.

**Signature Elements:**
- A thin gold horizontal rule that appears under section headings
- Circular course "badge" cards with course name, location, and discount percentage
- A subtle fairway-stripe texture (alternating very slightly lighter/darker green bands) in the hero background

**Interaction Philosophy:**
Hover states reveal additional course details. CTAs pulse subtly on mobile. Scroll-triggered fade-ins from below for each section.

**Animation:**
Entrance animations use `translateY(24px) → 0` with `opacity: 0 → 1` over 500ms ease-out. Course cards scale from `0.97` to `1.0` on hover. CTA button has a shimmer sweep on hover.

**Typography System:**
- Display: `Playfair Display` — serif, editorial weight for headlines
- Body: `DM Sans` — clean, modern, highly readable
- Accent labels: `DM Mono` — for discount percentages and course codes
</text>
<probability>0.07</probability>
</response>

---

## Concept B: "Tropical Modern"

<response>
<text>
**Design Movement:** Tropical Modernism — the visual language of contemporary Caribbean luxury (think Aman Resorts meets a boutique surf brand)

**Core Principles:**
- Warm, sun-drenched palette that immediately signals Puerto Rico without clichés
- Bold, oversized typography that commands attention on first scroll
- Horizontal scrolling course gallery for tactile mobile engagement
- Minimal UI chrome — content and imagery do the work

**Color Philosophy:**
Warm sand `#E8DCC8` background with deep teal `#0D4A4A` as the primary brand color, accented with a vivid coral-orange `#E8622A` for CTAs and highlights. The palette captures the island's dual identity: lush tropical greens and warm Atlantic sunsets.

**Layout Paradigm:**
The hero is a full-bleed photograph of a Puerto Rico golf course at golden hour, with a massive bold headline stacked vertically on the left edge. A floating membership card widget anchors the bottom-right. Sections alternate between full-width image bleeds and tight typographic panels, creating a rhythm of visual intensity and breathing room.

**Signature Elements:**
- A bold oversized number counter (e.g., "15 Courses · Up to 25% Off") as a visual anchor
- Horizontal scroll course strip with card-flip interaction revealing discount details
- A "savings calculator" interactive element showing how quickly the membership pays for itself

**Interaction Philosophy:**
Everything is touch-optimized. Horizontal swipe for courses, tap-to-reveal for FAQ items, and a sticky bottom CTA bar on mobile that appears after 50% scroll.

**Animation:**
Hero headline letters animate in with a stagger (30ms per character) using `clip-path: inset(0 100% 0 0) → inset(0 0% 0 0)`. Scroll-triggered counters count up from 0 to their target value. Course cards slide in from right on scroll.

**Typography System:**
- Display: `Bebas Neue` — condensed, bold, impactful for hero numbers and section titles
- Body: `Lato` — neutral, warm, highly legible
- Accent: `Courier Prime` — for course codes and member ID elements
</text>
<probability>0.06</probability>
</response>

---

## Concept C: "Links Modern" (Selected)

<response>
<text>
**Design Movement:** Refined Athletic Modernism — the visual language of premium sports membership brands (Peloton meets Soho House Golf)

**Core Principles:**
- Dark, immersive hero that feels like standing on the first tee at dusk
- Stark contrast between deep charcoal/black sections and bright white content sections
- Every element earns its place: no decorative noise, only purposeful visual signals
- Mobile hero is a full-screen golf course photograph with a bold headline and a single CTA

**Color Philosophy:**
Near-black `#0F1A12` (dark forest) as the hero background, transitioning to clean white `#FFFFFF` for content sections. The brand accent is a vivid fairway green `#2D7A3A` used exclusively for CTAs, highlights, and key numbers. A warm cream `#F7F3EC` provides a soft alternative background for alternating sections. This creates a dramatic day/night contrast that makes the site feel premium and intentional.

**Layout Paradigm:**
The hero spans the full viewport height with a full-bleed golf course image overlaid with a dark gradient. The headline is left-aligned, large, and bold. Below the fold, sections use a clean two-column asymmetric grid (60/40 or 40/60) that alternates direction. The course network uses a tight masonry-style grid of discount cards. The membership sign-up section is a dark, full-width panel with a centered conversion card.

**Signature Elements:**
- A thin animated green underline that sweeps under key words in headlines on scroll
- Discount "badge" cards with a bold percentage number as the dominant visual element
- A sticky mobile CTA bar that slides up from the bottom after the hero exits the viewport

**Interaction Philosophy:**
Restrained but satisfying. Hover states are subtle (slight lift + shadow). Scroll animations are clean and directional. The sign-up form feels like a premium application, not a generic web form.

**Animation:**
Hero text fades in from `opacity: 0, translateY(20px)` over 600ms. Section entrances use `IntersectionObserver` with a 100ms stagger. CTA button has a `scale(1.03)` on hover with a 200ms ease-out. The sticky mobile CTA slides up with `translateY(100%) → 0` over 300ms.

**Typography System:**
- Display: `Cormorant Garamond` — high-contrast serif for headlines, evokes classic golf club elegance
- Body: `Outfit` — geometric, modern, clean for all body copy and UI labels
- Numbers/Data: `Outfit` bold — for discount percentages, prices, and course counts
</text>
<probability>0.09</probability>
</response>

---

## Selected Direction: **Concept C — "Links Modern"**

Refined Athletic Modernism with a dark immersive hero, vivid fairway-green CTAs, and clean asymmetric content sections. The design prioritizes mobile-first golf immersion, strong conversion hierarchy, and a premium feel that matches the quality of the partner courses.
