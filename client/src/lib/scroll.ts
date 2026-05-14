/**
 * Scroll to an element with an offset to account for the fixed navbar.
 * Respects `prefers-reduced-motion` (WCAG 2.3.3).
 */
export function scrollElementIntoViewMotionSafe(el: Element | null | undefined): void {
  if (!el) return;
  const reduce =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Measure the fixed navbar height dynamically so we don't hardcode a pixel value.
  const navbar = document.querySelector("nav") as HTMLElement | null;
  const navbarHeight = navbar ? navbar.getBoundingClientRect().height : 64;
  const elementTop = el.getBoundingClientRect().top + window.scrollY;
  const targetY = elementTop - navbarHeight - 8; // 8px breathing room
  window.scrollTo({ top: Math.max(0, targetY), behavior: reduce ? "auto" : "smooth" });
}

export function scrollSelectorIntoViewMotionSafe(selector: string): void {
  scrollElementIntoViewMotionSafe(document.querySelector(selector));
}
