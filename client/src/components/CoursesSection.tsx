/*
 * CoursesSection — "Our Network" (02)
 * Design: Full-bleed aerial photo (fixed attachment) with dark overlay,
 *         entire section wrapped in a single frosted container for cohesion.
 * Animation: useScrollReveal drives fade-in on the container.
 * Mobile-optimized: heading + filters in a two-column band (filters bottom-right from md).
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
      {/* Top feather: mirror of Why Join bottom feather — keep opacity in sync with BenefitsSection. */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 h-28 z-[1]"
        style={{
          background: "linear-gradient(to bottom, oklch(0.22 0.05 145 / 0.36) 0%, transparent 100%)",
        }}
        aria-hidden
      />
      {/* Bottom feather: mirror How It Works top — same band as BenefitsSection bottom. */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 z-[1]"
        style={{
          background: "linear-gradient(to top, oklch(0.22 0.05 145 / 0.36) 0%, transparent 100%)",
        }}
        aria-hidden
      />

      {/* Slightly tighter md+ chrome than Benefits so Our Network reads less airy on desktop. */}
      <div className="container relative z-10 pt-7 sm:pt-9 md:pt-8 pb-7 sm:pb-9 md:pb-8 px-4 sm:px-6 md:px-8">
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
          <div className="px-[4%] py-[4%] sm:px-[5%] sm:py-[5%] md:px-[5%] md:py-[3.25%] lg:py-[3.75%]">
            <div className="mb-6 sm:mb-7 md:mb-5 lg:mb-6 grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-stretch md:gap-x-8 lg:gap-x-10 md:gap-y-0">
              <div className="max-w-3xl min-w-0">
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

              <div className="flex min-h-0 min-w-0 w-full flex-col justify-end gap-1.5 sm:gap-2 md:max-w-[min(100%,22rem)] lg:max-w-[24rem] md:items-end">
                <p
                  className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide sm:tracking-wider text-right w-full"
                  style={{ color: "oklch(0.62 0.08 145)", fontFamily: "'Outfit', sans-serif" }}
                  id="courses-filter-label"
                >
                  {t("courses.filterLabel")}
                </p>
                <div
                  role="tablist"
                  aria-labelledby="courses-filter-label"
                  className="flex w-full flex-wrap content-end justify-end gap-1.5 sm:gap-2"
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
                      className="filter-pill flex min-h-[36px] items-center justify-center rounded-sm px-2 py-1.5 text-[10px] font-semibold uppercase leading-tight tracking-wide transition-all duration-200 touch-manipulation whitespace-nowrap sm:min-h-[38px] sm:px-2.5 sm:py-1.5 sm:text-xs sm:tracking-wider md:min-h-[36px] md:px-2 md:py-1"
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

            <div className="mb-6 sm:mb-7 md:mb-5 lg:mb-6 rounded-lg overflow-hidden">
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
