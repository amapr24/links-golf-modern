/*
 * BenefitsSection — Links Golf Membership
 * Design: Dark forest background, four benefit cards with icons
 * Asymmetric: Left text panel + right 2x2 card grid
 */

import { DollarSign, Smartphone, ShieldCheck, CalendarDays } from "lucide-react";

const benefits = [
  {
    icon: DollarSign,
    title: "Real Savings",
    highlight: "Up to 25% off",
    body: "Pays for itself in 3–4 rounds. Every visit, all year.",
  },
  {
    icon: Smartphone,
    title: "Digital ID Card",
    highlight: "Always in your pocket",
    body: "Lives in Apple Wallet or Google Wallet. No app, no physical card.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Identity",
    highlight: "Non-transferable",
    body: "Photo-verified and bound to you. Unique QR code, always secure.",
  },
  {
    icon: CalendarDays,
    title: "One Flat Price",
    highlight: "Discounts all year",
    body: "Single annual fee, all 15 courses. No blackout dates.",
  },
];

export default function BenefitsSection() {
  return (
    <section
      id="benefits"
      className="relative"
      style={{ background: "oklch(0.13 0.05 145)" }}
    >
      <div className="container py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left: Text panel */}
          <div>
            <p className="section-label mb-4 text-white/50">01 · Why Links</p>
            <h2
              className="text-white leading-tight mb-6 fade-up"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2.4rem, 5vw, 3.5rem)",
                fontWeight: 600,
              }}
            >
              Built for golfers who want to{" "}
              <em style={{ color: "oklch(0.55 0.14 145)", fontStyle: "italic" }}>
                play more
              </em>{" "}
              and save.
            </h2>
            <p
              className="text-white/60 leading-relaxed mb-8 fade-up"
              style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1rem", fontWeight: 300 }}
            >
              The only card that opens doors at 15 of Puerto Rico's most celebrated courses — from championship resorts to beloved municipal gems.
            </p>
            <div className="fade-up">
              <button
                onClick={() => document.querySelector("#pricing")?.scrollIntoView({ behavior: "smooth" })}
                className="btn-fairway text-xs py-3 px-6"
              >
                Join for $199/year
              </button>
            </div>

            {/* Stat row */}
            <div className="flex gap-8 mt-10 pt-10 border-t fade-up" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              {[
                { num: "15", label: "Courses" },
                { num: "25%", label: "Max Discount" },
                { num: "3–4", label: "Rounds to Break Even" },
              ].map((s) => (
                <div key={s.label}>
                  <div
                    className="text-white font-bold text-2xl"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    {s.num}
                  </div>
                  <div
                    className="text-white/40 text-xs uppercase tracking-wider mt-0.5"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: 2x2 benefit cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  className="fade-up rounded-sm p-6"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    transitionDelay: `${i * 80}ms`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-sm flex items-center justify-center mb-4"
                    style={{ background: "oklch(0.42 0.14 145 / 0.2)" }}
                  >
                    <Icon size={18} style={{ color: "oklch(0.65 0.14 145)" }} />
                  </div>
                  <div
                    className="text-xs font-semibold uppercase tracking-widest mb-1"
                    style={{ color: "oklch(0.65 0.14 145)", fontFamily: "'Outfit', sans-serif" }}
                  >
                    {b.highlight}
                  </div>
                  <h3
                    className="text-white font-semibold text-lg mb-2"
                    style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}
                  >
                    {b.title}
                  </h3>
                  <p
                    className="text-white/55 text-sm leading-relaxed"
                    style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}
                  >
                    {b.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
