/*
 * CoursesSection — "Our Network" (02)
 * Design: Full-bleed aerial photo (fixed attachment) with dark overlay,
 *         frosted dark-green content containers for legibility.
 *         Matches the visual language of Benefits (01), Pricing (04), and FAQ (05).
 */

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { scrollSelectorIntoViewMotionSafe } from "@/lib/scroll";
import { CoursesMap } from "./CoursesMap";
import { MEMBER_CARD_AERIAL_IMAGE } from "@/lib/memberCardDisplay";

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
}

export default function CoursesSection() {
  const { t } = useLanguage();
  const [typeFilter, setTypeFilter] = useState<DirectoryFilter>("all");

  const activeTabId = tabIds[typeFilter];

  return (
    <section
      id="courses"
      className="relative overflow-x-hidden"
      style={{
        backgroundImage: `url(${AERIAL_IMAGE})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Dark overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.55) 100%)",
        }}
        aria-hidden
      />

      <div className="container relative z-10 py-20 md:py-28">
        {/* Section header + filters — frosted container */}
        <div
          className="mb-8 rounded-xl px-6 py-6 md:px-8 md:py-8 fade-up"
          style={{
            background: "oklch(0.13 0.05 145 / 0.75)",
            backdropFilter: "blur(12px)",
            border: "1px solid oklch(0.30 0.08 145 / 0.45)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          }}
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <p className="section-label mb-2" style={{ color: "oklch(0.65 0.10 145)" }}>
                02 · {t("courses.label")}
              </p>
              <h2
                className="leading-tight fade-up"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(2.2rem, 5vw, 3.2rem)",
                  fontWeight: 600,
                  color: "white",
                }}
              >
                {t("courses.heading")}
              </h2>
              <p
                className="text-sm mt-2 fade-up md:max-w-xl lg:max-w-2xl"
                style={{ color: "oklch(0.65 0.05 145)", fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}
              >
                {t("courses.description")}
              </p>
            </div>

            {/* Type filters */}
            <div className="flex flex-col gap-2.5 w-full md:w-auto md:items-end md:shrink-0">
              <p
                className="text-xs font-semibold uppercase tracking-wider fade-up md:text-right"
                style={{ color: "oklch(0.55 0.06 145)", fontFamily: "'Outfit', sans-serif" }}
                id="courses-filter-label"
              >
                {t("courses.filterLabel")}
              </p>
              <div
                role="tablist"
                aria-labelledby="courses-filter-label"
                className="flex flex-wrap gap-2 justify-start md:justify-end fade-up w-full"
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
                    className="filter-pill px-4 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider transition-all duration-200 touch-manipulation whitespace-nowrap"
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      background: typeFilter === type ? "oklch(0.42 0.14 145)" : "oklch(0.20 0.06 145 / 0.7)",
                      color: typeFilter === type ? "white" : "oklch(0.72 0.05 145)",
                      border: `1px solid ${typeFilter === type ? "oklch(0.42 0.14 145)" : "oklch(0.35 0.08 145 / 0.5)"}`,
                      boxShadow: typeFilter === type ? "none" : "none",
                    }}
                  >
                    {homeDirectoryTypeLabel(type, t)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Map + course list — frosted container */}
        <div
          className="rounded-xl overflow-hidden fade-up"
          style={{
            background: "oklch(0.13 0.05 145 / 0.72)",
            backdropFilter: "blur(10px)",
            border: "1px solid oklch(0.30 0.08 145 / 0.45)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          }}
        >
          <div id="courses-network-panel" role="tabpanel" aria-labelledby={activeTabId}>
            <div className="courses-map-mount">
              <CoursesMap filter={typeFilter} />
            </div>
          </div>
        </div>

        {/* Bottom CTA — frosted container */}
        <div
          className="mt-6 rounded-xl px-6 py-5 md:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 fade-up"
          style={{
            background: "oklch(0.13 0.05 145 / 0.72)",
            backdropFilter: "blur(10px)",
            border: "1px solid oklch(0.30 0.08 145 / 0.45)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.30)",
          }}
        >
          <div className="flex flex-col gap-2 max-w-md">
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.9rem", color: "oklch(0.65 0.05 145)" }}>
              {t("courses.bottomText")}
            </p>
            <a
              href="/courses"
              className="courses-directory-link fairway-text-control lg:hidden inline-flex text-sm font-medium w-fit min-h-[44px] items-center rounded-sm underline-offset-4 decoration-1 hover:underline touch-manipulation"
              style={{ color: "oklch(0.65 0.10 145)", fontFamily: "'Outfit', sans-serif" }}
            >
              {t("courses.viewAll")}
            </a>
          </div>
          <button
            type="button"
            onClick={() => scrollSelectorIntoViewMotionSafe("#pricing")}
            className="btn-fairway text-xs py-3 px-6 min-h-[44px] inline-flex items-center justify-center gap-2 flex-shrink-0 touch-manipulation"
          >
            {t("nav.getCard")}
          </button>
        </div>
      </div>
    </section>
  );
}
