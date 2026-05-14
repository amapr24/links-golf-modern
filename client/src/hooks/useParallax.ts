import { useEffect, useRef, useState } from "react";

interface UseParallaxOptions {
  /**
   * Parallax intensity: 0.3 = subtle, 0.5 = moderate, 0.7+ = aggressive
   * Default: 0.35 (gentle depth effect)
   */
  intensity?: number;
}

/**
 * useParallax: Applies a gentle scroll-triggered parallax effect to a section.
 * 
 * The hook calculates the scroll offset as the element enters the viewport,
 * applying a subtle translateY transform to create depth. Respects prefers-reduced-motion.
 * 
 * The section should have `backgroundAttachment: fixed` to create the parallax effect naturally.
 * 
 * Usage:
 * ```tsx
 * const ref = useParallax({ intensity: 0.35 });
 * <section ref={ref} style={{ backgroundImage: "url(...)", backgroundAttachment: "fixed" }}>
 * ```
 */
export function useParallax(options: UseParallaxOptions = {}) {
  const { intensity = 0.35 } = options;
  const ref = useRef<HTMLElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check prefers-reduced-motion on mount
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || !ref.current) return;

    const element = ref.current;
    let animationFrameId: number;

    const handleScroll = () => {
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate how far the element has scrolled into view
      // When element is at bottom of viewport: scrollProgress = -1
      // When element is at center of viewport: scrollProgress = 0
      // When element is at top of viewport: scrollProgress = 1
      const elementCenter = rect.top + rect.height / 2;
      const distanceFromCenter = windowHeight / 2 - elementCenter;
      const scrollProgress = Math.max(-1, Math.min(1, distanceFromCenter / (windowHeight / 2)));

      // Apply subtle vertical offset using transform (GPU accelerated)
      // Reduced multiplier (20px instead of rect.height) for subtle effect
      const offset = scrollProgress * 20 * intensity;

      element.style.transform = `translateY(${offset}px)`;
    };

    const handleScrollThrottled = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener("scroll", handleScrollThrottled, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener("scroll", handleScrollThrottled);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      // Reset transform on cleanup
      element.style.transform = "translateY(0)";
    };
  }, [intensity, prefersReducedMotion]);

  return ref;
}
