/*
 * BenefitsSection — Links Golf Membership
 * Design: Golf course background with dark overlay, continues hero experience
 */

import { DollarSign, Smartphone, ShieldCheck, CalendarDays } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PARTNER_COURSE_COUNT, MAX_PARTNER_DISCOUNT } from "@/data/partnerCourses";
import { scrollSelectorIntoViewMotionSafe } from "@/lib/scroll";

const AERIAL_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663654134519/4FsPe29zkxfgYYXFDn34Fq/course-aerial-Cx8xkxJjzpQ297eVUAemkv.webp";

export default function BenefitsSection() {
  const { t } = useLanguage();

  const benefits = [
    {
      id: "savings",
      icon: DollarSign,
      title: t("benefits.savings.title"),
      highlight: t("benefits.savings.highlight"),
      body: t("benefits.savings.body"),
    },
    {
      id: "card",
      icon: Smartphone,
      title: t("benefits.card.title"),
      highlight: t("benefits.card.highlight"),
      body: t("benefits.card.body"),
    },
    {
      id: "identity",
      icon: ShieldCheck,
      title: t("benefits.identity.title"),
      highlight: t("benefits.identity.highlight"),
      body: t("benefits.identity.body"),
    },
    {
      id: "price",
      icon: CalendarDays,
      title: t("benefits.price.title"),
      highlight: t("benefits.price.highlight"),
      body: t("benefits.price.body"),
    },
  ];

  return (
    <section
      id="benefits"
      className="relative overflow-hidden"
      style={{
        backgroundImage: `url(${AERIAL_IMAGE})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Dark overlay - continues hero fade */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      <div className="container py-20 md:py-28 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left: Text panel */}
          <div>
            <p className="section-label mb-4 text-white/50">01 · {t("benefits.label")}</p>
            <h2
              className="text-white leading-tight mb-6 fade-up"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontWeight: 400,
              }}
            >
              {t("benefits.heading")}
            </h2>
            <p
              className="text-white/70 leading-relaxed mb-8 fade-up"
              style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1rem", fontWeight: 300 }}
            >
              {t("benefits.description")}
            </p>
            <div className="fade-up">
              <button
                type="button"
                onClick={() => scrollSelectorIntoViewMotionSafe("#pricing")}
                className="btn-fairway text-xs py-3 px-6"
              >
                {t("benefits.cta")}
              </button>
            </div>

            {/* Stat row */}
            <div className="flex gap-8 mt-10 pt-10 border-t fade-up" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
              {(
                [
                  {
                    id: "courses",
                    num: String(PARTNER_COURSE_COUNT),
                    labelKey: "benefits.stats.partnerCoursesLabel" as const,
                  },
                  {
                    id: "discount",
                    num: `${MAX_PARTNER_DISCOUNT}%`,
                    labelKey: "benefits.stats.maxDiscountLabel" as const,
                  },
                  {
                    id: "breakeven",
                    num: t("benefits.stats.breakEvenRange"),
                    labelKey: "benefits.stats.breakEvenLabel" as const,
                  },
                ] as const
              ).map((s) => (
                <div key={s.id}>
                  <div
                    className="text-white font-bold text-2xl"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    {s.num}
                  </div>
                  <div
                    className="text-white/50 text-xs uppercase tracking-wider mt-0.5"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    {t(s.labelKey)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: 2x2 benefit cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.id}
                  className="fade-up rounded-sm p-6"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    transitionDelay: `${i * 80}ms`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-sm flex items-center justify-center mb-4"
                    style={{ background: "oklch(0.42 0.14 145 / 0.2)" }}
                  >
                    <Icon size={18} style={{ color: "oklch(0.65 0.14 145)" }} />
                  </div>
                  <div
                    className="text-xs font-semibold uppercase tracking-widest mb-1"
                    style={{ color: "oklch(0.65 0.14 145)", fontFamily: "'Outfit', sans-serif" }}
                  >
                    {b.highlight}
                  </div>
                  <h3
                    className="text-white font-semibold text-lg mb-2"
                    style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}
                  >
                    {b.title}
                  </h3>
                  <p
                    className="text-white/60 text-sm leading-relaxed"
                    style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}
                  >
                    {b.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
