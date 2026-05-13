/*
 * TrustStrip — compact social proof / stats row before pricing
 * Cream band, typography aligned with marketing sections
 */

import { useLanguage } from "@/contexts/LanguageContext";
import { PARTNER_COURSE_COUNT } from "@/data/partnerCourses";

export default function TrustStrip() {
  const { t } = useLanguage();

  const cols = [
    { value: t("trustStrip.col1Value", { count: PARTNER_COURSE_COUNT }), labelKey: "trustStrip.col1Label" as const },
    { value: t("trustStrip.col2Value"), labelKey: "trustStrip.col2Label" as const },
    { value: t("trustStrip.col3Value"), labelKey: "trustStrip.col3Label" as const },
  ];

  return (
    <section
      aria-label={t("trustStrip.headline")}
      className="border-y border-[oklch(0.88_0.02_85)] bg-[oklch(0.965_0.01_85)] py-9 md:py-11"
    >
      <div className="container">
        <p
          className="text-center text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-[oklch(0.45_0.06_145)] mb-6 md:mb-8 px-2"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          {t("trustStrip.headline")}
        </p>
        <div className="grid grid-cols-3 gap-3 sm:gap-10 max-w-2xl mx-auto text-center">
          {cols.map((c) => (
            <div key={c.labelKey} className="min-w-0">
              <div
                className="text-xl sm:text-2xl md:text-3xl font-semibold leading-none text-[oklch(0.13_0.05_145)]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {c.value}
              </div>
              <div
                className="mt-1.5 text-[9px] sm:text-[10px] md:text-xs uppercase tracking-wider text-[oklch(0.5_0.05_145)] leading-snug px-0.5"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {t(c.labelKey)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
