/*
 * BenefitsSection — "Why Join"
 * Design: Full-bleed aerial photo (fixed attachment) with light wash + texture;
 *         alternates with dark 02/04 on the home aerial stack (starts light at 01).
 *         entire section wrapped in a single frosted container for cohesion.
 * Animation: useScrollReveal drives fade-in + slide-up on the container.
 * Benefit cards: icon + (eyebrow + headline), reference-style; no body copy under cards.
 * Mobile: stacked (eyebrow → H2 → description → cards). lg+: 2×3 grid — full-width eyebrow, H2 | cards, full-width description.
 */

import { DollarSign, Smartphone, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { MEMBER_CARD_AERIAL_IMAGE } from "@/lib/memberCardDisplay";
import {
  howItWorksStepTitleStyle,
} from "@/lib/howItWorksStepTypography";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";
import type { RefObject } from "react";

const AERIAL_IMAGE = MEMBER_CARD_AERIAL_IMAGE;

export default function BenefitsSection() {
  const { t } = useLanguage();
  const coarsePointer = useCoarsePointer();
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
        backgroundAttachment: coarsePointer ? "scroll" : "fixed",
      }}
    >
      {/* Light wash + texture — home aerial stack: light 01 / 03 / 05, dark 02 / 04. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.1) 100%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.3) 40px, rgba(255,255,255,0.3) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.3) 40px, rgba(255,255,255,0.3) 41px)",
        }}
        aria-hidden
      />
      {/* Bottom feather: pairs with Our Network top (same image + fixed bg reads as one hand-off). */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 z-[1]"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.22) 0%, transparent 100%)",
        }}
        aria-hidden
      />

      <div className="container relative z-10 py-7 sm:py-9 md:py-10 px-3 sm:px-5 md:px-6">
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
            <div
              className="grid grid-cols-1 gap-3 sm:gap-3.5 lg:grid-cols-[min(16rem,26vw)_1fr] xl:grid-cols-[min(18rem,22vw)_1fr] lg:items-start lg:gap-x-6 xl:gap-8 lg:gap-y-2 xl:gap-y-2.5"
            >
              <p
                className="section-label mb-2.5 sm:mb-3 lg:mb-0 text-center text-[10px] sm:text-xs lg:col-span-2 lg:row-start-1 lg:leading-none"
                style={{ color: "oklch(0.65 0.10 145)" }}
              >
                01 · {t("benefits.label")}
              </p>
              <h2
                className="text-center lg:text-left leading-[1.12] lg:leading-tight lg:row-start-2 lg:col-start-1 lg:min-w-0"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(1.8rem, 4.5vw, 2.8rem)",
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
                className="mt-2 sm:mt-2.5 max-w-md mx-auto lg:max-w-none lg:mx-0 lg:mt-0 text-sm sm:text-base leading-[1.65] sm:leading-[1.7] text-center lg:text-left lg:col-span-2 lg:row-start-3"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  color: "oklch(0.72 0.05 145)",
                  fontWeight: 400,
                  letterSpacing: "0.015em",
                }}
              >
                {t("benefits.description")}
              </p>
              <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 lg:row-start-2 lg:col-start-2 lg:gap-3 xl:gap-3.5 justify-items-stretch mb-6 sm:mb-7 md:mb-6.5 lg:mb-0">
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
