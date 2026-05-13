/*
 * LegalPolicyShell — shared layout for policy pages (refund, terms, privacy)
 */

import { useLayoutEffect } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { useLanguage } from "@/contexts/LanguageContext";

type LegalPolicyShellProps = {
  titleKey: string;
  subtitleKey?: string;
  paragraphKeys: readonly string[];
};

export function LegalPolicyShell({
  titleKey,
  subtitleKey,
  paragraphKeys,
}: LegalPolicyShellProps) {
  const { t } = useLanguage();

  // Client-side navigations (wouter) keep scrollY from the previous page; policy pages are short
  // so the viewport lands near the footer. Reset scroll (and drop stray #hash) on mount.
  useLayoutEffect(() => {
    const { pathname, search, hash } = window.location;
    if (hash) {
      window.history.replaceState(null, "", pathname + (search || ""));
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F3EC]">
      <Navbar />
      <main className="container max-w-2xl py-20 md:py-28">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: "oklch(0.42 0.14 145)", fontFamily: "'Outfit', sans-serif" }}
        >
          {t("legal.sectionLabel")}
        </p>
        <h1
          className="leading-tight mb-4"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(2rem, 4vw, 2.75rem)",
            fontWeight: 600,
            color: "oklch(0.13 0.05 145)",
          }}
        >
          {t(titleKey)}
        </h1>
        {subtitleKey ? (
          <p
            className="text-sm mb-10"
            style={{
              color: "oklch(0.45 0.06 145)",
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 300,
            }}
          >
            {t(subtitleKey)}
          </p>
        ) : null}
        <div className="space-y-6">
          {paragraphKeys.map((key) => (
            <p
              key={key}
              className="text-sm leading-relaxed"
              style={{
                color: "oklch(0.35 0.05 145)",
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 300,
              }}
            >
              {t(key)}
            </p>
          ))}
        </div>
        <p className="mt-14">
          <Link
            href="/"
            className="text-sm font-semibold underline underline-offset-4"
            style={{ color: "oklch(0.42 0.14 145)", fontFamily: "'Outfit', sans-serif" }}
          >
            {t("legal.backToHome")}
          </Link>
        </p>
      </main>
      <FooterSection />
    </div>
  );
}
