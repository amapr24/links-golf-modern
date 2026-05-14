/*
 * BenefitsSection — "Why Join"
 * Design: Full-bleed aerial photo (fixed attachment) with dark overlay,
 *         entire section wrapped in a single frosted container for cohesion.
 * Animation: useScrollReveal drives fade-in + slide-up on the container.
 * Benefit cards: icon + (eyebrow + headline), reference-style; no body copy under cards.
 * Mobile: stacked; lg+: horizontal strip (heading | cards). No section CTA — nav + hero carry membership.
 */

import { DollarSign, Smartphone, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { MEMBER_CARD_AERIAL_IMAGE } from "@/lib/memberCardDisplay";
import {
  howItWorksStepTitleStyle,
} from "@/lib/howItWorksStepTypography";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import type { RefObject } from "react";

const AERIAL_IMAGE = MEMBER_CARD_AERIAL_IMAGE;

export default function BenefitsSection() {
  const { t } = useLanguage();
  const sectionRef = useScrollReveal({ threshold: 0.1 });

  const benefits = [
    {
      id: "savings",
      icon: DollarSign,
      highlight: t("benefits.savings.highlight"),
      title: t("benefits.savings.title"),
    },
    {
      id: "card",
      icon: Smartphone,
      highlight: t("benefits.card.highlight"),
      title: t("benefits.card.title"),
    },
    {
      id: "network",
      icon: MapPin,
      highlight: t("benefits.network.highlight"),
      title: t("benefits.network.title"),
    },
  ];

  return (
    <section
      id="benefits"
      ref={sectionRef as RefObject<HTMLElement>}
      className="relative overflow-hidden"
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

      <div className="container relative z-10 py-3 sm:py-4 md:py-5 px-3 sm:px-5 md:px-6">
        <div
          data-reveal
          data-frosted
          className="rounded-lg overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          }}
        >
          {/* Strip: title + cards only; primary CTAs live in nav + hero */}
          <div className="px-3 py-2.5 sm:px-4 sm:py-3 md:px-4 md:py-3 lg:py-2.5 lg:px-5">
            <div className="flex flex-col gap-3 sm:gap-3.5 lg:flex-row lg:items-start lg:gap-6 xl:gap-8">
              <div className="text-center lg:text-left lg:shrink-0 lg:max-w-[min(16rem,26vw)] xl:max-w-[min(18rem,22vw)]">
                <p
                  className="section-label mb-1.5 sm:mb-2 text-[10px] sm:text-xs"
                  style={{ color: "oklch(0.65 0.10 145)" }}
                >
                  01 · {t("benefits.label")}
                </p>
                <h2
                  className="leading-[1.12] lg:leading-tight"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "clamp(1.35rem, 3.8vw, 2.1rem)",
                    fontWeight: 600,
                    color: "white",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {t("benefits.headingBefore")}
                  <em style={{ color: "oklch(0.55 0.14 145)", fontStyle: "italic" }}>Links</em>
                  {t("benefits.headingAfter")}
                </h2>
                <p
                  className="mt-2 sm:mt-2.5 max-w-md mx-auto lg:mx-0 text-sm sm:text-base leading-relaxed"
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    color: "oklch(0.72 0.05 145)",
                    fontWeight: 300,
                  }}
                >
                  {t("benefits.description")}
                </p>
              </div>

              <div className="grid flex-1 min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 lg:gap-3 xl:gap-3.5 justify-items-stretch">
                {benefits.map((b) => {
                  const Icon = b.icon;
                  return (
                    <div
                      key={b.id}
                      className="flex flex-row items-start gap-3 rounded-md border px-2 py-2.5 sm:px-2.5 sm:py-2.5 lg:py-2.5 text-left"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        borderColor: "rgba(255,255,255,0.12)",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                      }}
                    >
                      <div
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
                        style={{ background: "oklch(0.42 0.14 145 / 0.35)" }}
                        aria-hidden
                      >
                        <Icon size={17} strokeWidth={2.25} color="white" />
                      </div>
                      <div className="min-w-0 flex-1 flex flex-col gap-1">
                        <p
                          className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.12em] leading-snug"
                          style={{
                            fontFamily: "'Outfit', sans-serif",
                            color: "oklch(0.72 0.10 145)",
                          }}
                        >
                          {b.highlight}
                        </p>
                        <h3
                          className="text-left leading-snug font-semibold"
                          style={{
                            ...howItWorksStepTitleStyle,
                            color: "white",
                          }}
                        >
                          {b.title}
                        </h3>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
