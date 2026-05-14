/*
 * BenefitsSection — "Why Join" (01)
 * Design: Full-bleed aerial photo (fixed attachment) with dark overlay,
 *         entire section wrapped in a single frosted container for cohesion.
 * Animation: useScrollReveal drives fade-in + slide-up on the container.
 * Mobile-optimized: tighter padding, compact stats, single-col cards on xs.
 */

import { DollarSign, Smartphone, MapPin, CalendarCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { scrollSelectorIntoViewMotionSafe } from "@/lib/scroll";
import { MEMBER_CARD_AERIAL_IMAGE } from "@/lib/memberCardDisplay";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useParallax } from "@/hooks/useParallax";
import type { RefObject } from "react";

const AERIAL_IMAGE = MEMBER_CARD_AERIAL_IMAGE;

export default function BenefitsSection() {
  const { t } = useLanguage();
  // Scope the observer to this section
  const sectionRef = useScrollReveal({ threshold: 0.10 });
  const parallaxRef = useParallax({ intensity: 0.35 });

  const benefits = [
    {
      id: "savings",
      icon: DollarSign,
      highlight: t("benefits.savings.highlight"),
      title: t("benefits.savings.title"),
      body: t("benefits.savings.body"),
    },
    {
      id: "card",
      icon: Smartphone,
      highlight: t("benefits.card.highlight"),
      title: t("benefits.card.title"),
      body: t("benefits.card.body"),
    },
    {
      id: "network",
      icon: MapPin,
      highlight: t("benefits.network.highlight"),
      title: t("benefits.network.title"),
      body: t("benefits.network.body"),
    },
    {
      id: "price",
      icon: CalendarCheck,
      highlight: t("benefits.price.highlight"),
      title: t("benefits.price.title"),
      body: t("benefits.price.body"),
    },
  ];

  return (
    <section
      id="benefits"
      ref={(el) => {
        if (el) {
          (sectionRef as any).current = el;
          (parallaxRef as any).current = el;
        }
      }}
      className="relative overflow-hidden will-change-[background-position]"
      style={{
        backgroundImage: `url(${AERIAL_IMAGE})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
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

      <div className="container relative z-10 py-12 md:py-28 px-4 sm:px-6 md:px-8">

        {/* Single frosted container wrapping all content */}
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
          {/* Inner padding container */}
          <div className="px-4 py-5 sm:px-6 sm:py-7 md:px-8 md:py-10 lg:px-10 lg:py-12">

            {/* Section header */}
            <div className="mb-6 sm:mb-8 md:mb-10 lg:mb-12">
              <p
                className="section-label mb-2 text-[10px] sm:text-xs"
                style={{ color: "oklch(0.65 0.10 145)" }}
              >
                01 · {t("benefits.label")}
              </p>
              <h2
                className="leading-tight max-w-xl"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(1.9rem, 6vw, 3.6rem)",
                  fontWeight: 600,
                  color: "white",
                  letterSpacing: "-0.01em",
                }}
              >
                {t("benefits.heading")}
              </h2>
              <p
                className="mt-3 max-w-md text-sm sm:text-base leading-relaxed"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  color: "oklch(0.72 0.05 145)",
                  fontWeight: 300,
                }}
              >
                {t("benefits.description")}
              </p>
            </div>

            {/* Benefit cards — 1-col on xs, 2-col on sm, 4-col on lg */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 sm:gap-3 md:gap-4 mb-6 sm:mb-7 md:mb-8">
              {benefits.map((b) => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.id}
                    className="flex flex-row sm:flex-col gap-4 rounded-lg border p-4 sm:p-5 md:p-6"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      borderColor: "rgba(255,255,255,0.12)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                    }}
                  >
                    {/* Icon — left-aligned on mobile, top on sm+ */}
                    <div
                      className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg flex-shrink-0 self-start"
                      style={{ background: "oklch(0.42 0.14 145 / 0.25)" }}
                      aria-hidden
                    >
                      <Icon size={16} style={{ color: "oklch(0.72 0.12 145)" }} />
                    </div>

                    {/* Text */}
                    <div className="flex flex-col gap-1 sm:gap-1.5">
                      <p
                        className="text-[9px] font-semibold uppercase tracking-[0.15em]"
                        style={{
                          fontFamily: "'Outfit', sans-serif",
                          color: "oklch(0.65 0.10 145)",
                        }}
                      >
                        {b.highlight}
                      </p>
                      <h3
                        className="leading-snug"
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: "clamp(1.05rem, 3vw, 1.2rem)",
                          fontWeight: 600,
                          color: "white",
                        }}
                      >
                        {b.title}
                      </h3>
                      <p
                        className="text-xs sm:text-sm leading-relaxed"
                        style={{
                          fontFamily: "'Outfit', sans-serif",
                          color: "oklch(0.65 0.05 145)",
                          fontWeight: 300,
                        }}
                      >
                        {b.body}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 md:gap-4 mb-5 sm:mb-6 md:mb-7">
              {[
                { value: "15", label: t("benefits.stats.partnerCoursesLabel") },
                { value: "25%", label: t("benefits.stats.maxDiscountLabel") },
                { value: t("benefits.stats.breakEvenRange"), label: t("benefits.stats.breakEvenLabel") },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col gap-0.5">
                  <span
                    className="leading-none"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "clamp(1.5rem, 5vw, 2.8rem)",
                      fontWeight: 600,
                      color: "oklch(0.72 0.12 145)",
                    }}
                  >
                    {stat.value}
                  </span>
                  <span
                    className="text-[9px] sm:text-xs uppercase tracking-wider leading-tight"
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      color: "oklch(0.55 0.06 145)",
                    }}
                  >
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={() => scrollSelectorIntoViewMotionSafe("#pricing")}
              className="btn-fairway text-[11px] py-3 px-6 tracking-[0.14em] w-full sm:w-auto min-h-[48px]"
            >
              {t("benefits.cta")}
            </button>

          </div>
        </div>

      </div>
    </section>
  );
}
