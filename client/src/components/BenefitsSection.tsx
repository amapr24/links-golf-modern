/*
 * BenefitsSection — prototype: compact “Why join” strip
 * Tight vertical rhythm: quick scan, then on to courses / pricing.
 */

import { DollarSign, Smartphone, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { scrollSelectorIntoViewMotionSafe } from "@/lib/scroll";

export default function BenefitsSection() {
  const { t } = useLanguage();

  const benefits = [
    {
      id: "savings",
      icon: DollarSign,
      title: t("benefits.savings.title"),
      highlight: t("benefits.savings.highlight"),
    },
    {
      id: "card",
      icon: Smartphone,
      title: t("benefits.card.title"),
      highlight: t("benefits.card.highlight"),
    },
    {
      id: "network",
      icon: MapPin,
      title: t("benefits.network.title"),
      highlight: t("benefits.network.highlight"),
    },
  ];

  return (
    <section
      id="benefits"
      className="relative overflow-hidden border-t border-[oklch(0.42_0.1_145/0.45)] bg-[oklch(0.12_0.038_145)]"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 120% 80% at 20% 0%, oklch(0.55 0.12 145), transparent 55%), radial-gradient(ellipse 90% 60% at 100% 100%, oklch(0.35 0.08 145), transparent 50%)",
        }}
      />

      <div className="container relative z-10 py-6 md:py-7 lg:py-8">
        <div className="fade-up flex max-w-2xl flex-col gap-0.5 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-2.5">
          <p className="section-label text-[oklch(0.72_0.06_145)]">01 · {t("benefits.label")}</p>
          <span className="hidden text-white/30 sm:inline" aria-hidden>
            ·
          </span>
          <p
            className="text-xs leading-snug text-white/55 sm:font-light"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            {t("benefits.stripTagline")}
          </p>
        </div>

        <div
          className="mt-4 flex flex-col divide-y divide-white/10 border-y border-white/10 md:mt-5 md:flex-row md:divide-x md:divide-y-0"
          role="list"
        >
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <div
                key={b.id}
                role="listitem"
                className="fade-up min-w-0 flex-1 py-3 md:px-4 md:py-2 md:first:pl-0 md:last:pr-0 lg:px-5"
                style={{ transitionDelay: `${i * 45}ms` }}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm"
                    style={{ background: "oklch(0.42 0.14 145 / 0.22)" }}
                    aria-hidden
                  >
                    <Icon size={15} style={{ color: "oklch(0.72 0.12 145)" }} />
                  </div>
                  <div className="min-w-0">
                    <div
                      className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[oklch(0.7_0.1_145)]"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      {b.highlight}
                    </div>
                    <h3
                      className="text-white text-sm font-semibold leading-snug md:text-[0.9375rem] md:leading-snug"
                      style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}
                    >
                      {b.title}
                    </h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-center md:mt-7 fade-up">
          <button
            type="button"
            onClick={() => scrollSelectorIntoViewMotionSafe("#pricing")}
            className="btn-fairway text-[11px] py-2.5 px-5 tracking-[0.14em]"
          >
            {t("benefits.cta")}
          </button>
        </div>
      </div>
    </section>
  );
}
