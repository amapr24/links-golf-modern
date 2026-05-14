/*
 * HowItWorksSection — "How It Works" (03)
 * Design: Full-bleed aerial photo (fixed attachment) with dark overlay,
 *         entire section wrapped in a single frosted container for cohesion.
 * Animation: useScrollReveal drives fade-in on the container.
 * Mobile-optimized: tighter padding, steps + member card column layout on large screens.
 */

import { CreditCard, UserCheck, Flag } from "lucide-react";
import type { RefObject } from "react";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import { DigitalMemberCard } from "@/components/DigitalMemberCard";
import { MEMBER_CARD_AERIAL_IMAGE } from "@/lib/memberCardDisplay";
import {
  howItWorksStepBodyClassName,
  howItWorksStepBodyStyle,
  howItWorksStepTitleStyle,
} from "@/lib/howItWorksStepTypography";
import { useScrollReveal } from "@/hooks/useScrollReveal";

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

export default function HowItWorksSection() {
  const { language, t } = useLanguage();
  const steps = getSteps(language);
  const sectionRef = useScrollReveal({ threshold: 0.1 });

  return (
    <section
      id="how-it-works"
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
      {/* Top feather: mirror CoursesSection bottom — keep in sync with BenefitsSection top feather. */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 h-28 z-[1]"
        style={{
          background: "linear-gradient(to bottom, oklch(0.22 0.05 145 / 0.36) 0%, transparent 100%)",
        }}
        aria-hidden
      />
      {/* Bottom feather: mirror Pricing top — same band as BenefitsSection bottom. */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 z-[1]"
        style={{
          background: "linear-gradient(to top, oklch(0.22 0.05 145 / 0.36) 0%, transparent 100%)",
        }}
        aria-hidden
      />

      {/* Top / bottom padding matches CoursesSection (tight band). */}
      <div className="container relative z-10 py-7 sm:py-9 md:py-10 px-4 sm:px-6 md:px-8">
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
          <div className="px-[4%] py-[4%] sm:px-[5%] sm:py-[5%] md:px-[5%] md:py-[6%]">
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <p className="section-label mb-3 text-[10px] sm:text-xs" style={{ color: "oklch(0.65 0.10 145)" }}>
                03 · {t("nav.howItWorks")}
              </p>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(1.9rem, 6vw, 3.2rem)",
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

            <div className="flex flex-col lg:flex-row lg:items-start lg:gap-12 xl:gap-16">
              <div className="flex flex-col gap-8 sm:gap-10 flex-1 min-w-0">
                {steps.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.number}
                      className="border-b border-white/[0.12] pb-8 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-center gap-4 flex-wrap">
                        <div
                          className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shrink-0"
                          style={{
                            background: "oklch(0.42 0.14 145 / 0.20)",
                            border: "1px solid oklch(0.42 0.14 145 / 0.35)",
                          }}
                        >
                          <Icon size={22} style={{ color: "oklch(0.72 0.14 145)" }} />
                          <span
                            className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold"
                            style={{ background: "oklch(0.42 0.14 145)", fontFamily: "'Outfit', sans-serif" }}
                          >
                            {i + 1}
                          </span>
                        </div>
                        <h3
                          className="text-white font-semibold min-w-0 flex-1"
                          style={howItWorksStepTitleStyle}
                        >
                          {step.title}
                        </h3>
                      </div>
                      <p
                        className={`mt-3 ${howItWorksStepBodyClassName} sm:pl-[4.25rem]`}
                        style={howItWorksStepBodyStyle}
                      >
                        {step.body}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col items-center gap-4 sm:gap-5 mt-10 lg:mt-0 shrink-0 lg:sticky lg:top-28 self-center lg:self-start">
                <div
                  className="relative rounded-xl overflow-hidden shadow-2xl"
                  style={{ maxWidth: "min(280px, 85vw)", width: "100%" }}
                >
                  <DigitalMemberCard
                    compact
                    displayName={language === "es" ? "Tu nombre aquí" : "YOUR NAME HERE"}
                    memberNumber="LGM-00000"
                    validUntil="05/27"
                    photoUrl={null}
                  />
                </div>

                <div className="flex justify-center gap-2.5 sm:gap-3 md:gap-4 flex-wrap">
                  <div
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-medium text-white/80"
                    style={{ background: "rgba(255,255,255,0.08)", fontFamily: "'Outfit', sans-serif" }}
                  >
                    <AppleWalletGlyph className="h-4 w-4 shrink-0 text-white/90" />
                    <span>Apple Wallet</span>
                  </div>
                  <div
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-medium text-white/80"
                    style={{ background: "rgba(255,255,255,0.08)", fontFamily: "'Outfit', sans-serif" }}
                  >
                    <GoogleWalletGlyph className="h-4 w-4 shrink-0" />
                    <span>Google Wallet</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
