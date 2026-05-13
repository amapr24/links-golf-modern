/*
 * HowItWorksSection — Links Golf Membership
 * Design: Dark background, 3-step horizontal flow
 * Image: Golf scorecard + phone wallet flat lay
 */

import { CreditCard, UserCheck, Flag } from "lucide-react";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import { DigitalMemberCard } from "@/components/DigitalMemberCard";

const HOW_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663654134519/4FsPe29zkxfgYYXFDn34Fq/how-it-works-bg-WVAFVj6UWeQHDsK6Y9SiNP.webp";

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
        ? "Completa el formulario de membresía, sube una selfie de verificación de frente y luego paga los $199 al año. Emitimos tu pase de billetera con esa foto. Todo en menos de 5 minutos."
        : "Fill out the membership form, add a front-facing verification selfie, then complete your $199 annual payment. We use that photo for your wallet pass — all in under 5 minutes.",
    },
    {
      number: "02",
      icon: UserCheck,
      title: L ? "Obtén tu pase digital" : "Get Your Digital Pass",
      body: L
        ? "Tu ID digital con foto se emite al instante para Apple Wallet o Google Wallet. Sin app, sin tarjeta física."
        : "Your photo-verified digital ID is issued instantly to Apple Wallet or Google Wallet. No app, no physical card.",
    },
    {
      number: "03",
      icon: Flag,
      title: L ? "Juega y ahorra" : "Play & Save",
      body: L
        ? "Muestra tu pase en la tienda del campo asociado. Tu tarifa de miembro se aplica al instante — cada ronda, todo el año."
        : "Show your pass at any partner course pro shop. Your member rate is applied immediately — every round, all year.",
    },
  ];
}

export default function HowItWorksSection() {
  const { language } = useLanguage();
  const steps = getSteps(language);
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden"
      style={{ background: "oklch(0.13 0.05 145)" }}
    >
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-15"
        style={{ backgroundImage: `url(${HOW_BG})` }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, oklch(0.13 0.05 145) 0%, oklch(0.18 0.07 145 / 0.8) 100%)" }}
      />
      {/* Top fade: dark green blends seamlessly from Courses section */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 h-20"
        style={{ background: "linear-gradient(to bottom, oklch(0.13 0.05 145) 0%, transparent 100%)" }}
        aria-hidden
      />
      {/* Bottom fade: dark green → into Pricing aerial image */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-32"
        style={{ background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.55) 100%)" }}
        aria-hidden
      />

      <div className="container relative z-10 py-20 md:py-28">
        <div className="text-center mb-14">
          <p className="section-label mb-4 text-white/40">03 · How It Works</p>
          <h2
            className="text-white fade-up"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2.2rem, 5vw, 3.2rem)",
              fontWeight: 600,
            }}
          >
            From sign-up to{" "}
            <em style={{ color: "oklch(0.55 0.14 145)", fontStyle: "italic" }}>
              first tee
            </em>
            {" "}in minutes.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 relative">
          {/* Connecting line (desktop) */}
          <div
            className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px"
            style={{ background: "linear-gradient(to right, transparent, oklch(0.42 0.14 145 / 0.4), transparent)" }}
          />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="fade-up text-center md:text-left"
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                {/* Step number + icon */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-5">
                  <div
                    className="relative w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "oklch(0.42 0.14 145 / 0.15)",
                      border: "1px solid oklch(0.42 0.14 145 / 0.3)",
                    }}
                  >
                    <Icon size={28} style={{ color: "oklch(0.65 0.14 145)" }} />
                    <span
                      className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: "oklch(0.42 0.14 145)", fontFamily: "'Outfit', sans-serif" }}
                    >
                      {i + 1}
                    </span>
                  </div>
                </div>
                <h3
                  className="text-white text-xl font-semibold mb-3"
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-white/55 text-sm leading-relaxed"
                  style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}
                >
                  {step.body}
                </p>
              </div>
            );
          })}
        </div>

        {/* Wallet pass visual — same digital card as signup + dashboard */}
        <div className="mt-16 flex justify-center fade-up">
          <div
            className="relative rounded-xl overflow-hidden shadow-2xl mx-auto"
            style={{ width: "min(320px, 90vw)" }}
          >
            <DigitalMemberCard
              compact
              displayName={language === "es" ? "Tu nombre aquí" : "YOUR NAME HERE"}
              memberNumber="LGM-000000"
              validUntil="05/27"
              photoUrl={null}
            />
          </div>
        </div>

        {/* Wallet badges */}
        <div className="flex justify-center gap-4 mt-6 fade-up">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium text-white/70"
            style={{ background: "rgba(255,255,255,0.08)", fontFamily: "'Outfit', sans-serif" }}
          >
            <AppleWalletGlyph className="h-4 w-4 shrink-0 text-white/85" />
            Apple Wallet
          </div>
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium text-white/70"
            style={{ background: "rgba(255,255,255,0.08)", fontFamily: "'Outfit', sans-serif" }}
          >
            <GoogleWalletGlyph className="h-4 w-4 shrink-0" />
            Google Wallet
          </div>
        </div>
      </div>
    </section>
  );
}
