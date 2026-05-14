/*
 * HowItWorksSection — "How It Works" (03)
 * Design: Full-bleed aerial photo (fixed attachment) with dark overlay,
 *         entire section wrapped in a single frosted container for cohesion.
 * Animation: useScrollReveal drives fade-in on the container.
 * Mobile-optimized: tighter padding, compact step cards, smaller wallet preview.
 */

import { CreditCard, UserCheck, Flag } from "lucide-react";
import type { RefObject } from "react";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import { DigitalMemberCard } from "@/components/DigitalMemberCard";
import { MEMBER_CARD_AERIAL_IMAGE } from "@/lib/memberCardDisplay";
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
        ? "Become a member by completing the sign up below."
        : "Become a member by completing the sign up below.",
    },
    {
      number: "02",
      icon: UserCheck,
      title: L ? "Obtén tu pase" : "Get Your Pass",
      body: L
        ? "Tu ID digital se emite al instante."
        : "Your digital ID is issued instantly.",
    },
    {
      number: "03",
      icon: Flag,
      title: L ? "Juega y ahorra" : "Play & Save",
      body: L
        ? "Muestra tu pase y ahorra en cada ronda."
        : "Show your pass and save on every round.",
    },
  ];
}

export default function HowItWorksSection() {
  const { language } = useLanguage();
  const steps = getSteps(language);
  const sectionRef = useScrollReveal({ threshold: 0.10 });

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
            <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12">
              <p className="section-label mb-3 text-[10px] sm:text-xs" style={{ color: "oklch(0.65 0.10 145)" }}>
                03 · {language === "es" ? "Cómo Funciona" : "How It Works"}
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

            {/* Steps */}
            <div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:grid-cols-3 md:gap-4 lg:gap-6 mb-6 sm:mb-7 md:mb-8 lg:mb-10">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.number}
                    className="rounded-lg border p-5 sm:p-6 md:p-8 flex flex-row md:flex-col gap-4 md:gap-0"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      borderColor: "rgba(255,255,255,0.12)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                    }}
                  >
                    {/* Step number + icon */}
                    <div className="flex-shrink-0 md:flex md:justify-start md:mb-5">
                      <div
                        className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center"
                        style={{
                          background: "oklch(0.42 0.14 145 / 0.20)",
                          border: "1px solid oklch(0.42 0.14 145 / 0.35)",
                        }}
                      >
                        <Icon size={20} style={{ color: "oklch(0.65 0.14 145)" }} />
                        <span
                          className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold"
                          style={{ background: "oklch(0.42 0.14 145)", fontFamily: "'Outfit', sans-serif" }}
                        >
                          {i + 1}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <h3
                        className="text-white font-semibold"
                        style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.1rem, 3vw, 1.3rem)", fontWeight: 600 }}
                      >
                        {step.title}
                      </h3>
                      <p
                        className="text-white/60 text-xs sm:text-sm leading-relaxed"
                        style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}
                      >
                        {step.body}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Wallet pass visual */}
            <div className="flex flex-col items-center gap-4 sm:gap-5 md:gap-6">
              <div
                className="relative rounded-xl overflow-hidden shadow-2xl mx-auto"
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

              {/* Wallet badges */}
              <div className="flex justify-center gap-2.5 sm:gap-3 md:gap-4 flex-wrap">
                <div
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-xs font-medium text-white/70"
                  style={{ background: "rgba(255,255,255,0.08)", fontFamily: "'Outfit', sans-serif" }}
                >
                  <AppleWalletGlyph className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-white/85" />
                  <span className="text-[11px] sm:text-xs">Apple Wallet</span>
                </div>
                <div
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-xs font-medium text-white/70"
                  style={{ background: "rgba(255,255,255,0.08)", fontFamily: "'Outfit', sans-serif" }}
                >
                  <GoogleWalletGlyph className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  <span className="text-[11px] sm:text-xs">Google Wallet</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
