import { useEffect, useRef, useState } from "react";

interface UseParallaxOptions {
  /**
   * Parallax intensity: 0.3 = subtle, 0.5 = moderate, 0.7+ = aggressive
   * Default: 0.4 (gentle depth effect)
   */
  intensity?: number;
  /**
   * Threshold for triggering parallax (0–1, where 1 = fully visible)
   * Default: 0.1 (start effect when 10% visible)
   */
  threshold?: number;
}

/**
 * useParallax: Applies a gentle scroll-triggered parallax effect to a background image.
 * 
 * The hook calculates the scroll offset as the element enters the viewport,
 * applying a CSS transform to create depth. Respects prefers-reduced-motion.
 * 
 * Usage:
 * ```tsx
 * const ref = useParallax({ intensity: 0.4 });
 * <section ref={ref} style={{ backgroundImage: "url(...)" }}>
 * ```
 */
export function useParallax(options: UseParallaxOptions = {}) {
  const { intensity = 0.4, threshold = 0.1 } = options;
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

      // Calculate how far the element has scrolled into view (0–1)
      const elementCenter = rect.top + rect.height / 2;
      const distanceFromCenter = windowHeight / 2 - elementCenter;
      const scrollProgress = Math.max(-1, Math.min(1, distanceFromCenter / (windowHeight / 2)));

      // Apply parallax offset: negative scroll = image moves up (depth effect)
      const offset = scrollProgress * rect.height * intensity;

      // Use transform for GPU acceleration
      element.style.backgroundPosition = `center calc(50% + ${offset}px)`;
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
    };
  }, [intensity, prefersReducedMotion]);

  return ref;
}
