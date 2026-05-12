/*
 * FaqSection — Links Golf Membership
 * Design: Cream background, accordion FAQ with smooth expand
 */

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "What is Links Golf Membership?",
    a: "Your all-in-one membership to premium golf across Puerto Rico. Instant access to exclusive discounts at every partner course, a digital wallet pass, and a verified photo ID — no physical card needed.",
  },
  {
    q: "Who can join?",
    a: "Membership is currently open to Puerto Rico residents only. Proof of residency may be requested at activation.",
  },
  {
    q: "Do I need to download an app?",
    a: "Not at all. Your pass lives in your built-in Wallet — the same place as your boarding passes and credit cards. Works with both Apple Wallet and Google Wallet.",
  },
  {
    q: "How do I use it at the course?",
    a: "Simply present your digital ID from Apple Wallet or Google Wallet at any partner course's pro shop. The system validates your membership in seconds and unlocks your member rate.",
  },
  {
    q: "What if I lose my phone?",
    a: "No problem. Instantly invalidate your current QR code. As soon as you have a new device, we re-issue your pass immediately — no forms, no waiting.",
  },
  {
    q: "Is the membership transferable?",
    a: "No. The membership is non-transferable and bound to your verified photo. Each member has a unique QR code tied to their identity.",
  },
  {
    q: "When does my membership renew?",
    a: "Your membership is valid for one full year from the date of purchase. You'll receive a renewal reminder 30 days before expiration.",
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" style={{ background: "#F7F3EC" }}>
      <div className="container py-20 md:py-28">
        <div className="grid md:grid-cols-[1fr_2fr] gap-12 md:gap-20 items-start">
          {/* Left: heading */}
          <div className="md:sticky md:top-24">
            <p className="section-label mb-4">05 · FAQ</p>
            <h2
              className="leading-tight fade-up"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2.2rem, 4vw, 3rem)",
                fontWeight: 600,
                color: "oklch(0.13 0.05 145)",
              }}
            >
              Common{" "}
              <em style={{ color: "oklch(0.42 0.14 145)", fontStyle: "italic" }}>
                questions.
              </em>
            </h2>
            <p
              className="mt-4 text-sm leading-relaxed fade-up"
              style={{ color: "oklch(0.5 0.06 145)", fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}
            >
              Still have questions? Reach us at{" "}
              <a
                href="mailto:info@linksgolfpr.com"
                className="underline"
                style={{ color: "oklch(0.42 0.14 145)" }}
              >
                info@linksgolfpr.com
              </a>
            </p>
          </div>

          {/* Right: accordion */}
          <div className="space-y-2 fade-up">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-sm overflow-hidden transition-all duration-200"
                style={{
                  background: open === i ? "white" : "rgba(255,255,255,0.5)",
                  border: `1px solid ${open === i ? "oklch(0.42 0.14 145 / 0.3)" : "oklch(0.88 0.02 85)"}`,
                  boxShadow: open === i ? "0 4px 20px rgba(0,0,0,0.06)" : "none",
                }}
              >
                <button
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <span
                    className="font-medium text-sm"
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      color: open === i ? "oklch(0.13 0.05 145)" : "oklch(0.3 0.06 145)",
                    }}
                  >
                    {faq.q}
                  </span>
                  <div
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200"
                    style={{
                      background: open === i ? "oklch(0.42 0.14 145)" : "oklch(0.9 0.02 145)",
                    }}
                  >
                    {open === i ? (
                      <Minus size={12} color="white" />
                    ) : (
                      <Plus size={12} style={{ color: "oklch(0.42 0.14 145)" }} />
                    )}
                  </div>
                </button>
                <div
                  style={{
                    maxHeight: open === i ? "200px" : "0",
                    overflow: "hidden",
                    transition: "max-height 350ms cubic-bezier(0.23, 1, 0.32, 1)",
                  }}
                >
                  <p
                    className="px-5 pb-5 text-sm leading-relaxed"
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontWeight: 300,
                      color: "oklch(0.45 0.06 145)",
                    }}
                  >
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
