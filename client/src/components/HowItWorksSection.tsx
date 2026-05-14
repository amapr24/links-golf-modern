/*
 * HowItWorksSection — "How It Works" (03)
 * Design: Full-bleed aerial photo (fixed attachment) with light wash + texture;
 *         alternates with dark 02/04 on the home aerial stack.
 *         entire section wrapped in a single frosted container for cohesion.
 * Animation: useScrollReveal drives fade-in on the container.
 * Mobile-optimized: tighter padding, steps + member card column layout on large screens.
 */

import { CreditCard, UserCheck, Flag } from "lucide-react";
import { useLayoutEffect, useState, type RefObject } from "react";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import { DigitalMemberCard } from "@/components/DigitalMemberCard";
import { MEMBER_CARD_AERIAL_IMAGE } from "@/lib/memberCardDisplay";
import {
  howItWorksStepBodyClassName,
  howItWorksStepBodyStyle,
  howItWorksStepTitleStyle,
} from "@/lib/howItWorksStepTypography";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";

const AERIAL_IMAGE = MEMBER_CARD_AERIAL_IMAGE;

function AppleWalletGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09z" />
    </svg>
  );
}

function GoogleWalletGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
        stroke="#4285F4"
        strokeWidth="2"
      />
      <circle cx="17" cy="12" r="1.5" fill="#EA4335" />
    </svg>
  );
}

function getSteps(language: Language) {
  const L = language === "es";
  return [
    {
      number: "01",
      icon: CreditCard,
      title: L ? "Únete en línea" : "Join Online",
      body: L
        ? "Completa el registro abajo para activar tu membresía."
        : "Become a member by completing the sign up below.",
    },
    {
      number: "02",
      icon: UserCheck,
      title: L ? "Obtén tu pase" : "Get Your Pass",
      body: L ? "Tu ID digital se emite al instante." : "Your digital ID is issued instantly.",
    },
    {
      number: "03",
      icon: Flag,
      title: L ? "Juega y ahorra" : "Play & Save",
      body: L ? "Muestra tu pase y ahorra en cada ronda." : "Show your pass and save on every round.",
    },
  ];
}

function useMinWidthLg() {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 1024px)").matches : false,
  );
  useLayoutEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setMatches(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return matches;
}

export default function HowItWorksSection() {
  const { language, t } = useLanguage();
  const coarsePointer = useCoarsePointer();
  const isDesktopLayout = useMinWidthLg();
  const steps = getSteps(language);
  const sectionRef = useScrollReveal({ threshold: 0.1 });

  const memberCardWalletFooter = (
    <div className="dmc-wallet-footer-split">
      <div className="dmc-wallet-footer-split__cell">
        <div className="dmc-wallet-pill">
          <AppleWalletGlyph className="h-3.5 w-3.5 shrink-0 text-white/90 sm:h-4 sm:w-4" />
          <span>Apple Wallet</span>
        </div>
      </div>
      <div className="dmc-wallet-footer-split__cell">
        <div className="dmc-wallet-pill">
          <GoogleWalletGlyph className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
          <span>Google Wallet</span>
        </div>
      </div>
    </div>
  );

  return (
    <section
      id="how-it-works"
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
      {/* Top feather: mirror CoursesSection bottom — keep in sync with BenefitsSection top feather. */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 h-28 z-[1]"
        style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.22) 0%, transparent 100%)",
        }}
        aria-hidden
      />
      {/* Bottom feather: mirror Pricing top — same band as BenefitsSection bottom. */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 z-[1]"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.22) 0%, transparent 100%)",
        }}
        aria-hidden
      />

      {/* Slightly tighter md+ chrome (matches Our Network / CoursesSection rhythm). */}
      <div className="container relative z-10 pt-7 sm:pt-9 md:pt-8 pb-7 sm:pb-9 md:pb-8 lg:pt-6 lg:pb-6 px-4 sm:px-6 md:px-8">
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
          <div className="px-[4%] py-[4%] sm:px-[5%] sm:py-[5%] md:px-[5%] md:py-[3.25%] lg:py-[2.1%]">
            <div className="text-center mb-4 sm:mb-5 md:mb-5 lg:mb-2">
              <p
                className="section-label mb-1 sm:mb-1.5 lg:mb-0.5 text-[10px] sm:text-xs"
                style={{ color: "oklch(0.65 0.10 145)" }}
              >
                03 · {t("nav.howItWorks")}
              </p>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(2rem, 5.5vw, 3.2rem)",
                  fontWeight: 600,
                  color: "white",
                }}
              >
                {language === "es" ? "Del registro al " : "From sign-up to "}
                <em style={{ color: "oklch(0.55 0.14 145)", fontStyle: "italic" }}>
                  {language === "es" ? "primer tee" : "first tee"}
                </em>
                {language === "es" ? " en minutos." : " in minutes."}
              </h2>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:gap-6 xl:gap-7">
              <div className="flex flex-col gap-0 flex-1 min-w-0">
                {steps.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.number}
                      className="grid grid-cols-[auto_minmax(0,1fr)] items-stretch gap-x-3 sm:gap-x-4 border-b border-white/[0.12] py-2 sm:py-2.5 lg:py-1.5 last:border-b-0"
                    >
                      {/* Left column: icon vertically centered in the row */}
                      <div className="flex items-center justify-center self-stretch pr-0.5 sm:pr-1">
                        <div
                          className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:h-14 sm:w-14"
                          style={{
                            background: "oklch(0.42 0.14 145 / 0.20)",
                            border: "1px solid oklch(0.42 0.14 145 / 0.35)",
                          }}
                        >
                          <Icon size={22} style={{ color: "oklch(0.72 0.14 145)" }} />
                          <span
                            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white sm:h-6 sm:w-6 sm:text-xs"
                            style={{ background: "oklch(0.42 0.14 145)", fontFamily: "'Outfit', sans-serif" }}
                          >
                            {i + 1}
                          </span>
                        </div>
                      </div>
                      {/* Right column: title + body stacked, centered as a block */}
                      <div className="flex min-h-0 min-w-0 flex-col justify-center gap-0.5 sm:gap-1">
                        <h3 className="text-white font-semibold leading-snug min-w-0" style={howItWorksStepTitleStyle}>
                          {step.title}
                        </h3>
                        <p className={howItWorksStepBodyClassName} style={howItWorksStepBodyStyle}>
                          {step.body}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex w-full shrink-0 flex-col items-center self-center lg:sticky lg:top-24 lg:mt-0 lg:max-w-[min(806px,62%)] xl:max-w-[min(858px,60%)]">
                <div className="relative flex w-full max-w-[min(280px,85vw)] justify-center lg:max-w-none">
                  <DigitalMemberCard
                    compact={!isDesktopLayout}
                    showcase={isDesktopLayout}
                    displayName={language === "es" ? "Tu nombre aquí" : "YOUR NAME HERE"}
                    memberNumber="LGM-00000"
                    validUntil="05/27"
                    photoUrl={null}
                    footer={memberCardWalletFooter}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
