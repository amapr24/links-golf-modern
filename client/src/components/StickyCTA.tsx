/*
 * StickyCTA — Links Golf Membership
 * Design: Slides up from bottom on smaller viewports after hero exits viewport.
 * Hidden from 900px up so it never overlaps the home map + course list (same breakpoint as CoursesMap).
 */

import { scrollSelectorIntoViewMotionSafe } from "@/lib/scroll";
import { useLanguage } from "@/contexts/LanguageContext";
import { PARTNER_COURSE_COUNT } from "@/data/partnerCourses";

interface StickyCTAProps {
  visible: boolean;
}

export default function StickyCTA({ visible }: StickyCTAProps) {
  const { t } = useLanguage();
  const scrollToPricing = () => {
    scrollSelectorIntoViewMotionSafe("#pricing");
  };

  return (
    <div
      className="min-[900px]:hidden sticky-cta"
      style={{
        transform: visible ? "translateY(0)" : "translateY(100%)",
        transition: "transform 350ms cubic-bezier(0.23, 1, 0.32, 1)",
      }}
    >
      <div
        className="flex items-center justify-between gap-3 px-4 py-3 shadow-2xl"
        style={{
          background: "oklch(0.13 0.05 145)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div>
          <div
            className="text-white font-bold text-lg leading-none"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            {t("pricing.price")}
          </div>
          <div
            className="text-white/40 text-sm"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            {t("sticky.subline", { count: PARTNER_COURSE_COUNT })}
          </div>
        </div>
        <button
          type="button"
          onClick={scrollToPricing}
          className="btn-fairway text-sm py-3 px-6 flex-shrink-0 leading-snug text-center"
        >
          {t("nav.getCard")}
        </button>
      </div>
    </div>
  );
}
