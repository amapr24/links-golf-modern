/*
 * BenefitsSection — "Why Join" (01)
 * Design: Full-bleed aerial photo (fixed attachment) with dark overlay,
 *         frosted dark-green content containers for legibility.
 *         Matches the visual language of Pricing (04) and FAQ (05).
 */

import { DollarSign, Smartphone, MapPin, CalendarCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { scrollSelectorIntoViewMotionSafe } from "@/lib/scroll";
import { MEMBER_CARD_AERIAL_IMAGE } from "@/lib/memberCardDisplay";

const AERIAL_IMAGE = MEMBER_CARD_AERIAL_IMAGE;

export default function BenefitsSection() {
  const { t } = useLanguage();

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
      className="relative overflow-hidden"
      style={{
        backgroundImage: `url(${AERIAL_IMAGE})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Dark overlay — same depth as Pricing (04) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.55) 100%)",
        }}
        aria-hidden
      />

      <div className="container relative z-10 py-20 md:py-28">
        {/* Section header — frosted container */}
        <div
          className="mb-12 md:mb-16 fade-up rounded-xl px-8 py-8 md:py-10 inline-block"
          style={{
            background: "oklch(0.13 0.05 145 / 0.75)",
            backdropFilter: "blur(12px)",
            border: "1px solid oklch(0.30 0.08 145 / 0.45)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          }}
        >
          <p className="section-label mb-3" style={{ color: "oklch(0.65 0.10 145)" }}>
            01 · {t("benefits.label")}
          </p>
          <h2
            className="leading-tight max-w-xl"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2.4rem, 5vw, 3.6rem)",
              fontWeight: 600,
              color: "white",
              letterSpacing: "-0.01em",
            }}
          >
            {t("benefits.heading")}
          </h2>
          <p
            className="mt-4 max-w-md text-base leading-relaxed"
            style={{
              fontFamily: "'Outfit', sans-serif",
              color: "oklch(0.72 0.05 145)",
              fontWeight: 300,
            }}
          >
            {t("benefits.description")}
          </p>
        </div>

        {/* Benefit cards — 2-col on md, 4-col on lg — frosted containers */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <div
                key={b.id}
                className="fade-up flex flex-col gap-4 rounded-xl border p-6"
                style={{
                  transitionDelay: `${i * 60}ms`,
                  background: "oklch(0.13 0.05 145 / 0.72)",
                  borderColor: "oklch(0.30 0.08 145 / 0.5)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.30)",
                }}
              >
                {/* Icon */}
                <div
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ background: "oklch(0.42 0.14 145 / 0.25)" }}
                  aria-hidden
                >
                  <Icon size={18} style={{ color: "oklch(0.72 0.12 145)" }} />
                </div>

                {/* Text */}
                <div className="flex flex-col gap-1.5">
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
                      fontSize: "1.2rem",
                      fontWeight: 600,
                      color: "white",
                    }}
                  >
                    {b.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
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

        {/* Stats row — frosted container */}
        <div
          className="mt-8 rounded-xl px-8 py-6 fade-up"
          style={{
            background: "oklch(0.13 0.05 145 / 0.72)",
            backdropFilter: "blur(10px)",
            border: "1px solid oklch(0.30 0.08 145 / 0.45)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.30)",
          }}
        >
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "15", label: t("benefits.stats.partnerCoursesLabel") },
              { value: "25%", label: t("benefits.stats.maxDiscountLabel") },
              { value: t("benefits.stats.breakEvenRange"), label: t("benefits.stats.breakEvenLabel") },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <span
                  className="leading-none"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "clamp(2rem, 4vw, 2.8rem)",
                    fontWeight: 600,
                    color: "oklch(0.72 0.12 145)",
                  }}
                >
                  {stat.value}
                </span>
                <span
                  className="text-xs uppercase tracking-wider"
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
        </div>

        {/* CTA */}
        <div className="mt-8 fade-up">
          <button
            type="button"
            onClick={() => scrollSelectorIntoViewMotionSafe("#pricing")}
            className="btn-fairway text-[11px] py-2.5 px-6 tracking-[0.14em]"
          >
            {t("benefits.cta")}
          </button>
        </div>
      </div>
    </section>
  );
}
