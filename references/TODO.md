# Links Golf PR — Site Fix Backlog

Source site: https://linksgolfpr.manus.space
Goal: Ship-ready, conversion-focused, bilingual membership site for Puerto Rico residents.

---

## P0 — Launch Blockers

### Responsive / layout
- [ ] Raise the mobile-nav breakpoint so the hamburger appears no later than ~1024px. Currently the desktop nav remains visible at 768–1024px and "Links Golf" / "How It Works" wrap onto two and three lines, breaking the header bar.
- [ ] Verify nav, hero, feature grid, course grid, and form all reflow cleanly at 1440 / 1024 / 768 / 414 / 375 / 320 widths.
- [ ] Replace the horizontal-scroll course "carousel" used below desktop widths with a vertical 2-column (tablet) or 1-column (mobile) grid. Remove the "Scroll sideways to see every course." instruction.
- [ ] Fix "Why Join" section so the left-column copy and the right-column feature cards reflow together (single column under ~900px), instead of the cards growing absurdly tall next to a fixed-width left column.

### Trust / credibility
- [ ] Move the site to the production domain `linksgolfpr.com` (currently lives at `linksgolfpr.manus.space`, mismatching the `info@linksgolfpr.com` contact email). Provision SSL on the production domain.
- [ ] Remove the initial OAuth redirect to `manus.im` for anonymous visitors. The marketing site must be publicly viewable without any login.
- [ ] Replace placeholder OpenGraph/Twitter meta description ("A modern conversion-focused membership website…") with real marketing copy in both EN and ES.
- [ ] Replace the auto-generated `manuscdn.com` og:image with a branded social share image.

### Residency verification
- [ ] Surface the Puerto Rico residency requirement *before* the form, not in fine print at the bottom. Add a prominent residency confirmation gate (radio or checkbox) at the top of the signup flow.
- [ ] Decide and document the real verification method (PR ID upload, address validation, etc.) and implement it *before* the $199 charge, not after.
- [ ] Reconcile the FAQ ("valid Puerto Rico ID or proof of residency") with the form's self-attestation checkbox. They currently contradict each other.

### Refund / cancellation policy
- [ ] Publish a refund and cancellation policy and link it from the form, footer, and FAQ. An annual prepaid product without visible refund terms is a regulatory and trust risk.

---

## P1 — Major UX Issues

### Hero
- [ ] Add a dark gradient/scrim overlay on the hero photo so headline text stays legible across image swaps and seasons. "Pay Less." in pale green currently sits against the bright sky and loses contrast.
- [ ] Verify all headline + sub-headline copy passes WCAG AA contrast over the hero image.
- [ ] Reduce visual weight of the secondary "VIEW ALL COURSES" button so the primary "GET YOUR MEMBERSHIP — $199/YR" is clearly dominant (ghost button at smaller scale, or text link with arrow).
- [ ] Promote the "EXCLUSIVE FOR PUERTO RICO RESIDENTS" pill so non-residents see the restriction immediately.

### Repetition / information design
- [ ] De-duplicate the "15 / 25% / $199" (or "15 / 25% / 3–4" / "15 / 25% / 365") stat strip. It currently appears three times within the first three sections. Keep at most one canonical instance plus one summary near the form.

### Navigation
- [ ] Visually separate utility nav (Login, language toggle) from content nav (Benefits, Courses, How It Works, FAQ). Use a divider, different weight, or distinct grouping.
- [ ] Remove the underline on "Login" so it doesn't appear to be the active page on every screen.
- [ ] Replace the EN/ES toggle with a clearer pattern (e.g., `EN | ES` with an explicit active state). The current pill makes ES look like an inactive label rather than a clickable option.
- [ ] Make footer link labels match nav labels exactly: "Our Network" → "Courses", "Get Your Card" → "Get Your Membership", etc. Same destination = same label.

### Courses section
- [ ] Group the "View Mode" (List/Map) and "Filter by Course Type" (All/Resort/Semi-Private/Public/Country Club) as two clearly labeled, separate control groups.
- [ ] Verify the Map toggle loads a real, functional map. If not, build it or remove the toggle.
- [ ] Make course cards clickable to a per-course detail view containing: hero photo, location, course type, hours, standard green fee range, example dollar savings, official website link, and any booking flow.
- [ ] Give flagship courses (TPC Dorado Beach, Royal Isabela) a featured/hero treatment instead of an identical grid tile.
- [ ] Add `aria-pressed` (or equivalent) to the active filter pill so screen-reader users can identify the current filter.

### Digital ID / wallet
- [ ] Replace the 🍎 and 🤖 emoji on the wallet buttons with the official "Add to Apple Wallet" and "Add to Google Wallet" badge assets per Apple and Google brand guidelines.
- [ ] Reconcile membership model: pick *either* anniversary-based renewal *or* season-based ("2026/2027") and use it everywhere. Drop "SEASON 2026/2027" framing if renewal is truly anniversary-based.

### Signup form
- [ ] Add a real progress stepper that reflects the DETAILS / PAYMENT / DIGITAL ID stages, plus an estimated time ("about 5 minutes").
- [ ] Split the single ADDRESS field into Street / City / ZIP, or add address autocomplete. Validate PR ZIP codes.
- [ ] Add real-time inline validation for PHONE and EMAIL fields.
- [ ] Show accepted payment methods on the "Continue to Payment" button area. Add ATH Móvil support (dominant payment method in Puerto Rico).
- [ ] Make the Terms of Service and Privacy Policy actual checkboxes the user must tick, not a passive "by continuing you agree" footer.

### FAQ
- [ ] Fix the mismatched column heights — the sticky left "Common questions." heading causes a third of a screen of dead space when the right column scrolls. Either un-stick the heading or shorten the right column.
- [ ] Ensure each accordion item has correct `aria-expanded` state and keyboard support (Enter / Space toggles).

---

## P2 — Visual Design / Brand

### Typography & hierarchy
- [ ] Establish a typographic system with at least two clearly distinct title weights/sizes so section titles ("Why Join", "15 Partner Courses", "From sign-up to first tee", "Start playing more today", "Common questions") don't all read at the same scale and tone.
- [ ] Differentiate eyebrow labels (`01 · WHY JOIN`) from button labels (`GET YOUR MEMBERSHIP`). They currently share the same all-caps, tracked-out treatment and look interchangeable.
- [ ] Audit body copy across all photographic sections for contrast; add consistent overlays where needed.

### Brand voice
- [ ] Rewrite generic SaaS-style body copy to reflect Puerto Rican identity: place names, year-round-golf angle, "while the mainland is iced in" framing, local Spanish where natural.
- [ ] Ensure parity and quality between EN and ES translations (not machine-translated).

### Social proof
- [ ] Add real partner-course logos (with permission). The page lists 15 named partners and shows none of their marks.
- [ ] Add testimonials or founding-member quotes once available.
- [ ] Add an endorsement from Puerto Rico Tourism Co. or relevant golf association if available.
- [ ] Consider a founding-member counter or "X members joined this month" social-proof element.

---

## P3 — Accessibility

- [ ] Run WCAG 2.1 AA audit; fix any contrast failures (especially hero headline over sunset photo, eyebrow labels on photographic backgrounds, green-on-green badges).
- [ ] Ensure the italicized accent-color words ("Pay Less.", "first tee", "more") are not the only differentiator — italics + color is borderline OK, verify.
- [ ] Add proper alt text or `aria-hidden` to all decorative imagery.
- [ ] Replace emoji icons (🍎, 🤖) so screen readers don't announce "red apple" / "robot face".
- [ ] Verify keyboard tab order is logical across nav → hero CTAs → sections → form → footer.
- [ ] Verify focus rings are visible on all interactive elements (buttons, links, filter pills, accordion headers, form fields).
- [ ] Confirm the mobile menu (`aria-label="Toggle menu"` / "Close menu") traps focus while open and returns focus to the toggle on close.

---

## P4 — Content / Polish

- [ ] Add a per-course example savings line so the "save up to $200/yr" claim is grounded in concrete numbers users can verify.
- [ ] Clarify what happens if a partner course leaves the network mid-year (prorated refund? replacement course?).
- [ ] Add a "Members FAQ" section for post-signup questions (how to re-add a lost pass, what to show at the pro shop, etc.).
- [ ] Add a press / about page with founder bio and Puerto Rico Tourism Co. context.
- [ ] Add a contact form, not just a `mailto:` link, with subject categorization (membership question, partner course inquiry, press, etc.).

---

## QA Checklist Before Re-Launch

- [ ] Test full signup flow end-to-end at 1440 / 1024 / 768 / 414 / 375 widths in Chrome, Safari, and Firefox.
- [ ] Test on a real iPhone (Safari) and a real Android device (Chrome).
- [ ] Test EN and ES versions for content parity, layout integrity, and form labels.
- [ ] Verify all in-page anchors (Benefits, Courses, How It Works, FAQ) scroll to the right section.
- [ ] Verify all footer links resolve (Terms, Privacy, Contact, FAQ).
- [ ] Verify the OG/Twitter share previews render correctly on Facebook, X, iMessage, WhatsApp, and LinkedIn.
- [ ] Verify the "Add to Apple Wallet" / "Add to Google Wallet" flows succeed on iOS and Android after a test purchase.
- [ ] Verify ATH Móvil and credit-card payment paths both complete and issue a digital pass.
- [ ] Verify the residency-verification step blocks non-PR users before charging.
