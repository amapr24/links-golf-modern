/**
 * useScrollReveal
 *
 * Observes every element matching `selector` inside `rootRef` (or the whole
 * document when rootRef is omitted) and adds the CSS class `visibleClass`
 * once the element crosses the viewport threshold.
 *
 * Stagger: elements that carry a `data-stagger` attribute get an inline
 * `transition-delay` equal to `(index * staggerMs)ms` before the class is
 * applied, creating a cascading reveal.
 *
 * Respects `prefers-reduced-motion`: when the user has requested reduced
 * motion, all elements are immediately marked visible with no delay.
 */

import { useEffect, useRef } from "react";

interface UseScrollRevealOptions {
  /** CSS selector for elements to observe. Default: "[data-reveal]" */
  selector?: string;
  /** Class added when element is visible. Default: "reveal-visible" */
  visibleClass?: string;
  /** IntersectionObserver threshold. Default: 0.12 */
  threshold?: number;
  /** Delay in ms between staggered children. Default: 80 */
  staggerMs?: number;
  /** Root margin passed to IntersectionObserver. Default: "0px 0px -40px 0px" */
  rootMargin?: string;
}

export function useScrollReveal(options: UseScrollRevealOptions = {}) {
  const {
    selector = "[data-reveal]",
    visibleClass = "reveal-visible",
    threshold = 0.12,
    staggerMs = 80,
    rootMargin = "0px 0px -40px 0px",
  } = options;

  // Stable ref so callers can scope the observer to a subtree
  const scopeRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const root = scopeRef.current ?? document;
    const elements = Array.from(root.querySelectorAll<HTMLElement>(selector));

    if (prefersReduced) {
      // Immediately reveal everything — no animation
      elements.forEach((el) => el.classList.add(visibleClass));
      return;
    }

    // Assign stagger delays before observing so the delay is ready when the
    // class fires.
    let staggerIndex = 0;
    elements.forEach((el) => {
      if (el.dataset.stagger !== undefined) {
        const delay = staggerIndex * staggerMs;
        el.style.transitionDelay = `${delay}ms`;
        staggerIndex++;
      } else {
        // Reset index for non-staggered groups
        staggerIndex = 0;
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add(visibleClass);
            observer.unobserve(entry.target); // fire once
          }
        });
      },
      { threshold, rootMargin }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [selector, visibleClass, threshold, staggerMs, rootMargin]);

  return scopeRef;
}
