/*
 * FaqSection — Links Golf Membership
 * Design: Cream background, accordion FAQ with smooth expand
 */

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const getFaqs = (t: any) => [
  { q: t("faq.q1"), a: t("faq.a1") },
  { q: t("faq.q2"), a: t("faq.a2") },
  { q: t("faq.q3"), a: t("faq.a3") },
  { q: t("faq.q4"), a: t("faq.a4") },
  { q: t("faq.q5"), a: t("faq.a5") },
  { q: t("faq.q6"), a: t("faq.a6") },
  { q: t("faq.q7"), a: t("faq.a7") },
];

export default function FaqSection() {
  const { t } = useLanguage();
  const faqs = getFaqs(t);
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" style={{ background: "#F7F3EC" }}>
      <div className="container py-20 md:py-28">
        <div className="grid md:grid-cols-[1fr_2fr] gap-12 md:gap-20 items-start">
          {/* Left: heading */}
          <div className="md:sticky md:top-24">
            <p className="section-label mb-4">05 · {t("faq.label")}</p>
            <h2
              className="leading-tight fade-up"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2.2rem, 4vw, 3rem)",
                fontWeight: 600,
                color: "oklch(0.13 0.05 145)",
              }}
            >
              {t("faq.heading")}
            </h2>
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

            {/* Contact section after FAQ */}
            <div
              className="rounded-sm p-6 mt-8 fade-up"
              style={{
                background: "rgba(255,255,255,0.6)",
                border: "1px solid oklch(0.88 0.02 85)",
              }}
            >
              <p
                className="text-sm font-semibold mb-2"
                style={{ color: "oklch(0.13 0.05 145)", fontFamily: "'Outfit', sans-serif" }}
              >
                Still have questions?
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "oklch(0.45 0.06 145)", fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}
              >
                Reach us at{" "}
                <a
                  href="mailto:info@linksgolfpr.com"
                  className="underline font-medium"
                  style={{ color: "oklch(0.42 0.14 145)" }}
                >
                  info@linksgolfpr.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
