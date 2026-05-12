/*
 * HowItWorksSection — Links Golf Membership
 * Design: Dark background, 3-step horizontal flow
 * Image: Golf scorecard + phone wallet flat lay
 */

import { CreditCard, UserCheck, Flag } from "lucide-react";

const HOW_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663654134519/4FsPe29zkxfgYYXFDn34Fq/how-it-works-bg-WVAFVj6UWeQHDsK6Y9SiNP.webp";

const steps = [
  {
    number: "01",
    icon: CreditCard,
    title: "Join Online",
    body: "Fill out the short membership form, upload your photo, and complete the $199 annual payment — all in under 5 minutes.",
  },
  {
    number: "02",
    icon: UserCheck,
    title: "Get Your Digital Pass",
    body: "Your photo-verified digital ID is issued instantly to Apple Wallet or Google Wallet. No app, no physical card.",
  },
  {
    number: "03",
    icon: Flag,
    title: "Play & Save",
    body: "Show your pass at any partner course pro shop. Your member rate is applied immediately — every round, all year.",
  },
];

export default function HowItWorksSection() {
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

      <div className="relative z-10 container py-20 md:py-28">
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

        {/* Wallet pass visual */}
        <div className="mt-16 flex justify-center fade-up">
          <div
            className="relative rounded-xl overflow-hidden shadow-2xl"
            style={{
              width: "min(320px, 90vw)",
              background: "linear-gradient(135deg, oklch(0.28 0.12 145) 0%, oklch(0.18 0.08 145) 100%)",
              border: "1px solid oklch(0.42 0.14 145 / 0.3)",
            }}
          >
            <div className="p-6">
              {/* Card header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-white/40 text-xs uppercase tracking-widest mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    Links Golf
                  </div>
                  <div className="text-white font-semibold text-lg" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    Golf Membership
                  </div>
                </div>
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "oklch(0.42 0.14 145 / 0.3)" }}
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-white/60 text-2xl">👤</span>
                  </div>
                </div>
              </div>
              {/* Member name */}
              <div className="mb-4">
                <div className="text-white/40 text-xs uppercase tracking-widest mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Member Name
                </div>
                <div className="text-white font-medium" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  YOUR NAME HERE
                </div>
              </div>
              {/* Details row */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-white/40 text-xs uppercase tracking-widest mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    Member No.
                  </div>
                  <div className="text-white/80 text-sm font-mono">LGM-#####</div>
                </div>
                <div className="text-right">
                  <div className="text-white/40 text-xs uppercase tracking-widest mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    Valid Until
                  </div>
                  <div className="text-white/80 text-sm font-mono">##/##</div>
                </div>
              </div>
            </div>
            {/* Founding member badge */}
            <div
              className="px-6 py-2 text-center text-xs uppercase tracking-widest"
              style={{
                background: "oklch(0.42 0.14 145 / 0.3)",
                color: "oklch(0.65 0.14 145)",
                fontFamily: "'Outfit', sans-serif",
                borderTop: "1px solid oklch(0.42 0.14 145 / 0.2)",
              }}
            >
              Founding Member · 2026–27
            </div>
          </div>
        </div>

        {/* Wallet badges */}
        <div className="flex justify-center gap-4 mt-6 fade-up">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium"
            style={{ background: "rgba(255,255,255,0.08)", color: "white/70", fontFamily: "'Outfit', sans-serif" }}
          >
            <span>🍎</span> Apple Wallet
          </div>
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium"
            style={{ background: "rgba(255,255,255,0.08)", color: "white/70", fontFamily: "'Outfit', sans-serif" }}
          >
            <span>🤖</span> Google Wallet
          </div>
        </div>
      </div>
    </section>
  );
}
