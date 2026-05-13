# Screenshot design review — reviewer brief

Use this brief for **every** model or human reviewer. Attach the PNG pack from `e2e/screenshots/output/` (run `pnpm screenshots` from repo root; outputs are gitignored until generated).

## Product context

- **Site:** Links Golf membership marketing + member login + course directory.
- **Audience:** Prospective and current members in Puerto Rico (bilingual EN/ES).
- **Primary goal:** **Member conversion** (understand value, trust the offer, move toward signup / payment / login).
- **Secondary:** Reduce friction and improve ease of use.
- **Tertiary:** Modern styling and brand cohesion.

## Goal stack (weighting)

Tag each finding with **Goal 1, 2, or 3**:

1. **Conversion** — Value prop clarity, trust, CTAs, pricing/checkout path, objections (FAQ, proof), mobile conversion (thumb reach, sticky CTA).
2. **Friction / usability** — Scanability, forms (login OTP), map and directory density, errors and empty states, language toggle discoverability.
3. **Aesthetics** — Typography, spacing, imagery, dark/light transitions. Use sparingly; do not let tier 3 crowd out tier 1.

## Viewport matrix (always cite in findings)

Screenshots are named with slugs. When you write a finding, include the **viewport slug** exactly as in the filename:

| Slug | Size (CSS px) | Role |
|------|----------------|------|
| `desktop1440` | 1440×900 | Desktop marketing, dense layouts |
| `tablet834` | 834×1194 | Breakpoint between stacked and multi-column |
| `iphone16pro402` | **402×874** | **Minimum mobile** (iPhone 16 Pro logical viewport) |

Languages: `en`, `es` in filenames (e.g. `home-hero-iphone16pro402-es.png`).

## Artifact map (what each file is)

| Pattern | Content |
|---------|---------|
| `home-full-*` | Full home scroll (lazy sections warmed) |
| `home-hero-*` | Above the fold: nav + hero only |
| `home-pricing-*` | `#pricing` scrolled into view |
| `login-email-*` | `/login` (email step, or “Supabase not configured” if env lacks keys) |
| `courses-directory-*` | `/courses` table directory |

## Severity (S / M / L)

- **S (small):** Copy tweak, minor spacing, polish; low risk to conversion.
- **M (medium):** Ambiguous CTA, cramped tap targets, unclear hierarchy on one breakpoint; likely hurts a segment of users.
- **L (large):** Broken trust, blocked or confusing primary conversion path, unreadable or misleading pricing/login on a primary viewport.

## Required output schema (per reviewer)

One table row per finding:

| Finding | Goal (1/2/3) | Page / screenshot file | Viewport slug | Severity (S/M/L) | Evidence (what you see in the image) | Recommendation |

**Rules**

- One finding per row; split combined issues.
- **Evidence** must describe observable pixels (colors, position, truncation), not assumptions about code.
- **WCAG / contrast:** If unsure, write “needs tooling” rather than claiming pass/fail.

## Multi-model workflow

1. Give **this brief** + the **same PNG folder** to **≥2 reviewers** (different models or different human lenses).
2. Compare tables: merge duplicates, note disagreements.
3. **Synthesis owner** produces a **top-10** list ordered by impact on **Goal 1**, with file/component pointers for engineering.

## Limits

- Maps and fonts depend on network; captures may differ slightly between runs.
- Do not treat vision-only review as a legal or WCAG audit.

## Example output (this repo)

A completed two-model pass plus synthesis lives in [`design-review-multi-model-output.md`](design-review-multi-model-output.md) (regenerate screenshots and re-run reviewers periodically).
