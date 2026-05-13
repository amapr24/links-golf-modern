/*
 * CoursesSection — Links Golf Membership
 * Design: Cream background; map + scrollable course list (directory type filters)
 */

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { scrollSelectorIntoViewMotionSafe } from "@/lib/scroll";
import { CoursesMap } from "./CoursesMap";

const AERIAL_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663654134519/4FsPe29zkxfgYYXFDn34Fq/course-aerial-Cx8xkxJjzpQ297eVUAemkv.webp";

const DIRECTORY_TYPES = ["all", "Resort", "Semi-Private", "Public", "Country Club"] as const;

type DirectoryFilter = (typeof DIRECTORY_TYPES)[number];

const tabIds: Record<DirectoryFilter, string> = {
  all: "courses-tab-all",
  Resort: "courses-tab-resort",
  "Semi-Private": "courses-tab-semi-private",
  Public: "courses-tab-public",
  "Country Club": "courses-tab-country-club",
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
    case "Country Club":
      return t("courses.homeFilter.countryClub");
  }
}

export default function CoursesSection() {
  const { t } = useLanguage();
  const [typeFilter, setTypeFilter] = useState<DirectoryFilter>("all");

  const activeTabId = tabIds[typeFilter];

  return (
    <section id="courses" className="relative overflow-x-hidden bg-[#F7F3EC]">
      <div
        className="w-full h-56 md:h-72 bg-cover bg-center relative overflow-hidden"
        style={{ backgroundImage: `url(${AERIAL_IMAGE})` }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, rgba(247,243,236,0) 0%, rgba(247,243,236,0.95) 100%)",
          }}
        />
        <div className="absolute inset-0 flex items-end pb-8 container">
          <div>
            <p className="section-label mb-2">02 · {t("courses.label")}</p>
            <h2
              className="leading-tight fade-up"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2.2rem, 5vw, 3.2rem)",
                fontWeight: 600,
                color: "oklch(0.13 0.05 145)",
              }}
            >
              {t("courses.heading")}
            </h2>
          </div>
        </div>
      </div>

      <div className="container pb-20 md:pb-28">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8 pt-4">
          <p
            className="text-sm fade-up md:max-w-xl lg:max-w-2xl"
            style={{ color: "oklch(0.45 0.06 145)", fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}
          >
            {t("courses.description")}
          </p>
          <div className="flex flex-col gap-2.5 w-full md:w-auto md:items-end md:shrink-0">
            <p
              className="text-xs font-semibold uppercase tracking-wider fade-up md:text-right"
              style={{ color: "oklch(0.45 0.06 145)", fontFamily: "'Outfit', sans-serif" }}
              id="courses-filter-label"
            >
              {t("courses.filterLabel")}
            </p>
            <div className="flex flex-col gap-3 w-full md:items-end">
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
                      background: typeFilter === type ? "oklch(0.42 0.14 145)" : "white",
                      color: typeFilter === type ? "white" : "oklch(0.55 0.06 145)",
                      border: `1px solid ${typeFilter === type ? "oklch(0.42 0.14 145)" : "oklch(0.88 0.02 85)"}`,
                      boxShadow: typeFilter === type ? "none" : "0 1px 0 rgba(0,0,0,0.04)",
                    }}
                  >
                    {homeDirectoryTypeLabel(type, t)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div id="courses-network-panel" role="tabpanel" aria-labelledby={activeTabId}>
          <div className="courses-map-mount">
            <CoursesMap filter={typeFilter} />
          </div>
        </div>

        {/* Bottom CTA — primary membership vs secondary directory link */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mt-10 pt-8 fade-up" style={{ borderTop: "1px solid oklch(0.88 0.02 85)" }}>
          <div className="flex flex-col gap-2 max-w-md">
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.9rem", color: "oklch(0.45 0.06 145)" }}>
              {t("courses.bottomText")}
            </p>
            <a
              href="/courses"
              className="courses-directory-link fairway-text-control lg:hidden inline-flex text-sm font-medium w-fit min-h-[44px] items-center rounded-sm underline-offset-4 decoration-1 hover:underline touch-manipulation"
              style={{ color: "oklch(0.45 0.06 145)", fontFamily: "'Outfit', sans-serif" }}
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
