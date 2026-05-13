/*
 * CoursesSection — Links Golf Membership
 * Design: Cream background, course discount card grid (desktop) / horizontal scroll (mobile)
 * 15 partner courses with location and discount percentage
 */

import { useLayoutEffect, useState } from "react";
import { MapPin, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { partnerCourses } from "@/data/partnerCourses";
import { scrollSelectorIntoViewMotionSafe } from "@/lib/scroll";

const AERIAL_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663654134519/4FsPe29zkxfgYYXFDn34Fq/course-aerial-Cx8xkxJjzpQ297eVUAemkv.webp";

const discountColor = (d: number) => {
  if (d >= 25) return { bg: "oklch(0.42 0.14 145)", text: "white" };
  if (d >= 20) return { bg: "oklch(0.35 0.12 145)", text: "white" };
  return { bg: "oklch(0.92 0.04 145)", text: "oklch(0.28 0.12 145)" };
};

export default function CoursesSection() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<"all" | "resort" | "club">("all");

  const filtered = partnerCourses.filter((c) => filter === "all" || c.tier === filter);

  // Course cards remount when `filter` changes; Home's IO only runs on mount/language,
  // so new nodes never get `.visible` and stay opacity-0 without this.
  useLayoutEffect(() => {
    const root = document.getElementById("courses");
    if (!root) return;
    root.querySelectorAll(".course-card.fade-up").forEach((el) => {
      el.classList.add("visible");
    });
  }, [filter]);

  const coursesBackgroundStyle = {
    backgroundImage: `url(${AERIAL_IMAGE})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
  };

  return (
    <section id="courses" className="relative" style={coursesBackgroundStyle}>
      {/* Medium overlay - reveals image gradually */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.2) 100%)",
        }}
      />
      {/* Top image band */}
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

      <div className="container pb-20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pt-4">
          <p
            className="text-sm fade-up"
            style={{ color: "oklch(0.45 0.06 145)", fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}
          >
            {t("courses.description")}
          </p>
          {/* Filter tabs */}
          <div className="flex gap-1 fade-up" style={{ background: "rgba(0,0,0,0.06)", borderRadius: "4px", padding: "3px" }}>
            {(["all", "resort", "club"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className="filter-pill px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  borderRadius: "2px",
                  background: filter === f ? "oklch(0.42 0.14 145)" : "transparent",
                  color: filter === f ? "white" : "oklch(0.45 0.06 145)",
                }}
              >
                {f === "all" ? t("courses.filter.all") : f === "resort" ? t("courses.filter.resort") : t("courses.filter.club")}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop: Grid layout */}
        <div className="hidden lg:grid grid-cols-3 gap-3">
          {filtered.map((course, i) => {
            const colors = discountColor(course.discount);
            return (
              <div
                key={course.name}
                className="course-card fade-up flex items-center justify-between gap-4"
                style={{ transitionDelay: `${i * 40}ms` }}
              >
                <div className="flex-1 min-w-0">
                  <div
                    className="font-semibold text-sm mb-0.5 truncate"
                    style={{ color: "oklch(0.13 0.05 145)", fontFamily: "'Outfit', sans-serif" }}
                  >
                    {course.name}
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
          <div className="overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory">
            <div className="flex gap-3 min-w-min">
              {filtered.map((course, i) => {
                const colors = discountColor(course.discount);
                return (
                  <div
                    key={course.name}
                    className="flex-shrink-0 w-56 course-card fade-up flex items-center justify-between gap-4 snap-start"
                    style={{ transitionDelay: `${i * 40}ms` }}
                  >
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-semibold text-sm mb-0.5 truncate"
                        style={{ color: "oklch(0.13 0.05 145)", fontFamily: "'Outfit', sans-serif" }}
                      >
                        {course.name}
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

        {/* Bottom CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-10 pt-8 fade-up" style={{ borderTop: "1px solid oklch(0.88 0.02 85)" }}>
          <div className="flex flex-col gap-2">
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.9rem", color: "oklch(0.45 0.06 145)" }}>
              {t("courses.bottomText")}
            </p>
            <a
              href="/courses"
              className="fairway-text-control text-sm font-semibold flex items-center gap-1 transition-colors duration-200 rounded-sm"
              style={{ color: "oklch(0.42 0.14 145)", fontFamily: "'Outfit', sans-serif" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {t("courses.viewAll")}
            </a>
          </div>
          <button
            type="button"
            onClick={() => scrollSelectorIntoViewMotionSafe("#pricing")}
            className="fairway-text-control flex items-center gap-2 text-sm font-semibold rounded-sm"
            style={{ color: "oklch(0.42 0.14 145)", fontFamily: "'Outfit', sans-serif" }}
          >
            {t("nav.getCard")} <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}
