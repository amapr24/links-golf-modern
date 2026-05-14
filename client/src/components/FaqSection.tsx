/*
 * FaqSection — Links Golf Membership
 * Design: Same aerial + dark treatment as mid-page sections; frosted accordion shell.
 */

import { useState, type ReactNode } from "react";
import { Plus, Minus } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { MEMBER_CARD_AERIAL_IMAGE } from "@/lib/memberCardDisplay";

const AERIAL_IMAGE = MEMBER_CARD_AERIAL_IMAGE;

function buildFaqs(t: (key: string) => string): { q: string; a: ReactNode }[] {
  return [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
    { q: t("faq.q5"), a: t("faq.a5") },
    { q: t("faq.q6"), a: t("faq.a6") },
    { q: t("faq.q7"), a: t("faq.a7") },
    {
      q: t("faq.q8"),
      a: (
        <>
          <span>{t("faq.a8Lead")} </span>
          <Link
            href="/refunds"
            className="underline font-semibold"
            style={{ color: "oklch(0.42 0.14 145)" }}
          >
            {t("faq.refundsPageLink")}
          </Link>
          <span> {t("faq.a8Trail")}</span>
        </>
      ),
    },
  ];
}

export default function FaqSection() {
  const { t } = useLanguage();
  const faqs = buildFaqs(t);
  const [open, setOpen] = useState<number | null>(0);

  const faqBackgroundStyle = {
    backgroundImage: `url(${AERIAL_IMAGE})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
  };

  return (
    <section id="faq" className="relative overflow-hidden" style={faqBackgroundStyle}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.55) 100%)",
        }}
        aria-hidden
      />
      <div className="container relative z-10 py-12 md:py-28 px-4 sm:px-6 md:px-8">
        <div
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
            <div className="grid md:grid-cols-[1fr_2fr] gap-12 md:gap-20 items-start">
              <div className="md:sticky md:top-24">
                <h2
                  className="leading-tight fade-up"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "clamp(2rem, 4vw, 3rem)",
                    fontWeight: 600,
                    color: "white",
                  }}
                >
                  {t("faq.heading")}
                </h2>
              </div>

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
                        className="font-medium text-sm sm:text-base"
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
                        maxHeight: open === i ? "min(70vh, 720px)" : "0",
                        overflow: "hidden",
                        transition: "max-height 350ms cubic-bezier(0.23, 1, 0.32, 1)",
                      }}
                    >
                      <div
                        className="px-5 pb-5 text-sm sm:text-base leading-relaxed"
                        style={{
                          fontFamily: "'Outfit', sans-serif",
                          fontWeight: 300,
                          color: "oklch(0.45 0.06 145)",
                        }}
                      >
                        {faq.a}
                      </div>
                    </div>
                  </div>
                ))}

                <div
                  className="rounded-sm p-6 mt-8 fade-up"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  <p
                    className="text-sm sm:text-base font-semibold mb-2"
                    style={{ color: "white", fontFamily: "'Outfit', sans-serif" }}
                  >
                    {t("faq.stillHaveQuestions")}
                  </p>
                  <p
                    className="text-sm sm:text-base leading-relaxed"
                    style={{ color: "oklch(0.85 0.03 145)", fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}
                  >
                    Reach us at{" "}
                    <a
                      href="mailto:info@linksgolfpr.com"
                      className="underline font-medium"
                      style={{ color: "oklch(0.72 0.12 145)" }}
                    >
                      info@linksgolfpr.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
