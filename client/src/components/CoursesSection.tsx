/*
 * CoursesSection — "Our Network" (02)
 * Design: Full-bleed aerial photo (fixed attachment) with dark overlay,
 *         entire section wrapped in a single frosted container for cohesion.
 * Animation: useScrollReveal drives fade-in on the container.
 * Mobile-optimized: tighter padding, stacked header/filters, compact CTA bar.
 */

import { useState } from "react";
import type { RefObject } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { scrollSelectorIntoViewMotionSafe } from "@/lib/scroll";
import { CoursesMap } from "./CoursesMap";
import { MEMBER_CARD_AERIAL_IMAGE } from "@/lib/memberCardDisplay";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const AERIAL_IMAGE = MEMBER_CARD_AERIAL_IMAGE;

const DIRECTORY_TYPES = ["all", "Resort", "Semi-Private", "Public"] as const;

type DirectoryFilter = (typeof DIRECTORY_TYPES)[number];

const tabIds: Record<DirectoryFilter, string> = {
  all: "courses-tab-all",
  Resort: "courses-tab-resort",
  "Semi-Private": "courses-tab-semi-private",
  Public: "courses-tab-public",
};

function homeDirectoryTypeLabel(type: DirectoryFilter, t: (key: string) => string): string {
  const counts: Record<DirectoryFilter, number> = {
    all: 15,
    Resort: 8,
    "Semi-Private": 4,
    Public: 3,
  };
  const label = (() => {
    switch (type) {
      case "all":
        return t("courses.homeFilter.all");
      case "Resort":
        return t("courses.homeFilter.resort");
      case "Semi-Private":
        return t("courses.homeFilter.semiPrivate");
      case "Public":
        return t("courses.homeFilter.public");
    }
  })();
  return `${label} (${counts[type]})`;
}

export default function CoursesSection() {
  const { t } = useLanguage();
  const [typeFilter, setTypeFilter] = useState<DirectoryFilter>("all");
  const sectionRef = useScrollReveal({ threshold: 0.1 });

  const activeTabId = tabIds[typeFilter];

  return (
    <section
      id="courses"
      ref={sectionRef as RefObject<HTMLElement>}
      className="relative overflow-x-hidden"
      style={{
        backgroundImage: `url(${AERIAL_IMAGE})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.55) 100%)",
        }}
        aria-hidden
      />
      {/* Top fade: same hand-off as How It Works → Join Now (forest into section) */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 h-28 z-10"
        style={{ background: "linear-gradient(to bottom, oklch(0.13 0.05 145) 0%, transparent 100%)" }}
        aria-hidden
      />

      <div className="container relative z-10 py-12 md:py-28 px-4 sm:px-6 md:px-8">
        <div
          data-reveal
          data-frosted
          className="rounded-xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          }}
        >
          <div className="px-[4%] py-[4%] sm:px-[5%] sm:py-[5%] md:px-[5%] md:py-[6%]">
            <div className="mb-6 sm:mb-7 md:mb-8 lg:mb-10 flex flex-col gap-4">
              <div className="max-w-3xl">
                <p className="section-label mb-2 text-[10px] sm:text-xs" style={{ color: "oklch(0.65 0.10 145)" }}>
                  02 · {t("courses.label")}
                </p>
                <h2
                  className="leading-tight"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "clamp(1.9rem, 6vw, 3.2rem)",
                    fontWeight: 600,
                    color: "white",
                  }}
                >
                  {t("courses.heading")}
                </h2>
                <p
                  className="text-sm sm:text-base mt-2 md:max-w-2xl leading-relaxed"
                  style={{ color: "oklch(0.72 0.05 145)", fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}
                >
                  {t("courses.description")}
                </p>
              </div>

              <div className="flex flex-col gap-2 w-full">
                <p
                  className="text-xs sm:text-sm font-semibold uppercase tracking-wider"
                  style={{ color: "oklch(0.62 0.08 145)", fontFamily: "'Outfit', sans-serif" }}
                  id="courses-filter-label"
                >
                  {t("courses.filterLabel")}
                </p>
                <div
                  role="tablist"
                  aria-labelledby="courses-filter-label"
                  className="flex flex-wrap gap-2 w-full"
                >
                  {DIRECTORY_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      role="tab"
                      id={tabIds[type]}
                      aria-selected={typeFilter === type}
                      aria-controls="courses-network-panel"
                      onClick={() => setTypeFilter(type)}
                      className="filter-pill px-3 sm:px-4 py-2 rounded-sm text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all duration-200 touch-manipulation whitespace-nowrap min-h-[44px] flex items-center"
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        background: typeFilter === type ? "oklch(0.42 0.14 145)" : "oklch(0.20 0.06 145 / 0.7)",
                        color: typeFilter === type ? "white" : "oklch(0.78 0.05 145)",
                        border: `1px solid ${typeFilter === type ? "oklch(0.42 0.14 145)" : "oklch(0.35 0.08 145 / 0.5)"}`,
                      }}
                    >
                      {homeDirectoryTypeLabel(type, t)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div
              className="mb-6 sm:mb-7 md:mb-8 lg:mb-10 rounded-lg overflow-hidden border"
              style={{ borderColor: "rgba(255,255,255,0.12)" }}
            >
              <div id="courses-network-panel" role="tabpanel" aria-labelledby={activeTabId}>
                <div className="courses-map-mount">
                  <CoursesMap filter={typeFilter} />
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => scrollSelectorIntoViewMotionSafe("#pricing")}
                className="btn-fairway text-xs sm:text-sm py-3 px-6 min-h-[48px] inline-flex items-center justify-center gap-2 flex-shrink-0 touch-manipulation w-full sm:w-auto"
              >
                {t("pricing.joinNow")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
