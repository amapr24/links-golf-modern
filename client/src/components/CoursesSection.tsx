/*
 * CoursesSection — Links Golf Membership
 * Design: Cream background, course discount card grid (desktop) / horizontal scroll (mobile)
 * 15 partner courses with location and discount percentage
 */

import { useLayoutEffect, useState } from "react";
import { MapPin, Map as MapIcon, List } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { partnerCourses } from "@/data/partnerCourses";
import { partnerCourseName } from "@/lib/partnerCourseName";
import { scrollSelectorIntoViewMotionSafe } from "@/lib/scroll";
import { CoursesMap } from "./CoursesMap";

const AERIAL_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663654134519/4FsPe29zkxfgYYXFDn34Fq/course-aerial-Cx8xkxJjzpQ297eVUAemkv.webp";

const discountColor = (d: number) => {
  if (d >= 25) return { bg: "oklch(0.42 0.14 145)", text: "white" };
  if (d >= 20) return { bg: "oklch(0.35 0.12 145)", text: "white" };
  return { bg: "oklch(0.92 0.04 145)", text: "oklch(0.28 0.12 145)" };
};

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
  const { t, language } = useLanguage();
  const [typeFilter, setTypeFilter] = useState<DirectoryFilter>("all");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  const filtered = partnerCourses.filter(
    (c) => typeFilter === "all" || c.courseType === typeFilter,
  );

  // Course cards remount when `typeFilter` or `viewMode` changes; Home's IO only runs on
  // mount/language, so new nodes never get `.visible` and stay opacity-0 without this.
  useLayoutEffect(() => {
    const root = document.getElementById("courses");
    if (!root) return;
    root.querySelectorAll(".course-card.fade-up").forEach((el) => {
      el.classList.add("visible");
    });
  }, [typeFilter, viewMode]);

  const activeTabId = tabIds[typeFilter];

  return (
    <section id="courses" className="relative bg-[#F7F3EC]">
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
              {/* View mode: compact two-button control */}
              <div
                className="inline-flex gap-1 self-end rounded-md p-1 touch-manipulation"
                style={{ background: "rgba(0,0,0,0.06)" }}
                role="group"
                aria-label={t("courses.viewModeGroup")}
              >
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className="min-h-[44px] min-w-[44px] px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 inline-flex items-center justify-center gap-1.5 rounded-sm"
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    background: viewMode === "list" ? "oklch(0.42 0.14 145)" : "transparent",
                    color: viewMode === "list" ? "white" : "oklch(0.45 0.06 145)",
                  }}
                  title={t("courses.viewList")}
                >
                  <List size={16} aria-hidden />
                  <span className="sr-only sm:not-sr-only sm:inline">{t("courses.viewList")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("map")}
                  className="min-h-[44px] min-w-[44px] px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 inline-flex items-center justify-center gap-1.5 rounded-sm"
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    background: viewMode === "map" ? "oklch(0.42 0.14 145)" : "transparent",
                    color: viewMode === "map" ? "white" : "oklch(0.45 0.06 145)",
                  }}
                  title={t("courses.viewMap")}
                >
                  <MapIcon size={16} aria-hidden />
                  <span className="sr-only sm:not-sr-only sm:inline">{t("courses.viewMap")}</span>
                </button>
              </div>
              {/* Course type filters — same set as full directory, natural width + wrap */}
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

        <div
          id="courses-network-panel"
          role="tabpanel"
          aria-labelledby={activeTabId}
        >
        {/* Map View */}
        {viewMode === "map" && (
          <div className="courses-map-mount">
            <CoursesMap filter={typeFilter} />
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <>
        {/* Desktop: Grid layout */}
        <div className="hidden lg:grid grid-cols-3 gap-3">
          {filtered.map((course, i) => {
            const colors = discountColor(course.discount);
            const displayName = partnerCourseName(course.slug, course.name, language, t);
            return (
              <div
                key={course.slug}
                className="course-card fade-up flex items-center justify-between gap-4"
                style={{ transitionDelay: `${i * 40}ms` }}
              >
                <div className="flex-1 min-w-0">
                  <div
                    className="font-semibold text-sm mb-0.5 truncate"
                    style={{ color: "oklch(0.13 0.05 145)", fontFamily: "'Outfit', sans-serif" }}
                  >
                    {displayName}
                  </div>
                  <div
                    className="flex items-center gap-1 text-xs"
                    style={{ color: "oklch(0.55 0.06 145)", fontFamily: "'Outfit', sans-serif" }}
                  >
                    <MapPin size={10} />
                    {course.location}
                  </div>
                </div>
                <div
                  className="flex-shrink-0 w-16 h-12 rounded-sm flex flex-col items-center justify-center"
                  style={{ background: colors.bg }}
                >
                  <span
                    className="font-bold leading-none"
                    style={{ color: colors.text, fontFamily: "'Outfit', sans-serif", fontSize: "1.1rem" }}
                  >
                    {course.discount}%
                  </span>
                  <span
                    className="text-[9px] uppercase tracking-wider mt-0.5"
                    style={{ color: colors.text, opacity: 0.75, fontFamily: "'Outfit', sans-serif" }}
                  >
                    {t("courses.discountOff")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile & Tablet: Horizontal scrollable list */}
        <div className="lg:hidden">
          <div className="overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory touch-pan-x overscroll-x-contain [scrollbar-width:thin]">
            <div className="flex gap-3 min-w-min">
              {filtered.map((course, i) => {
                const colors = discountColor(course.discount);
                const displayName = partnerCourseName(course.slug, course.name, language, t);
                return (
                  <div
                    key={course.slug}
                    className="flex-shrink-0 w-[min(17.5rem,calc(100vw-2.5rem))] min-h-[5.25rem] course-card fade-up flex items-center justify-between gap-4 snap-start"
                    style={{ transitionDelay: `${i * 40}ms` }}
                  >
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-semibold text-sm mb-0.5 truncate"
                        style={{ color: "oklch(0.13 0.05 145)", fontFamily: "'Outfit', sans-serif" }}
                      >
                        {displayName}
                      </div>
                      <div
                        className="flex items-center gap-1 text-xs"
                        style={{ color: "oklch(0.55 0.06 145)", fontFamily: "'Outfit', sans-serif" }}
                      >
                        <MapPin size={10} />
                        {course.location}
                      </div>
                    </div>
                    <div
                      className="flex-shrink-0 w-16 h-12 rounded-sm flex flex-col items-center justify-center"
                      style={{ background: colors.bg }}
                    >
                      <span
                        className="font-bold leading-none"
                        style={{ color: colors.text, fontFamily: "'Outfit', sans-serif", fontSize: "1.1rem" }}
                      >
                        {course.discount}%
                      </span>
                      <span
                        className="text-[9px] uppercase tracking-wider mt-0.5"
                        style={{ color: colors.text, opacity: 0.75, fontFamily: "'Outfit', sans-serif" }}
                      >
                        {t("courses.discountOff")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div
            className="text-center text-xs mt-3"
            style={{ fontFamily: "'Outfit', sans-serif", color: "oklch(0.55 0.06 145)" }}
          >
            {t("courses.scrollHint")}
          </div>
        </div>
          </>
        )}
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
