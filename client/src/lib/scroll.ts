/** Respects `prefers-reduced-motion` for scroll behavior (WCAG 2.3.3). */
export function scrollElementIntoViewMotionSafe(el: Element | null | undefined): void {
  if (!el) return;
  const reduce =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
}

export function scrollSelectorIntoViewMotionSafe(selector: string): void {
  scrollElementIntoViewMotionSafe(document.querySelector(selector));
}
