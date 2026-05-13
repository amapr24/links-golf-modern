/*
 * FooterSection — Links Golf Membership
 * Design: Dark forest background, clean link columns
 */

import { useLanguage } from "@/contexts/LanguageContext";
import { scrollSelectorIntoViewMotionSafe } from "@/lib/scroll";

export default function FooterSection() {
  const { t } = useLanguage();
  const scrollTo = (id: string) => {
    scrollSelectorIntoViewMotionSafe(id);
  };

  return (
    <footer style={{ background: "oklch(0.1 0.04 145)" }}>
      <div className="container py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "oklch(0.42 0.14 145)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
              </div>
              <span
                className="text-white font-semibold text-sm"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Links Golf
              </span>
            </div>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}
            >
              {t("footer.tagline")}
            </p>
          </div>

          {/* Membership */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "oklch(0.42 0.14 145)", fontFamily: "'Outfit', sans-serif" }}
            >
              {t("footer.membership")}
            </p>
            <div className="space-y-2.5">
              {[
                { label: t("footer.benefits"), id: "#benefits" },
                { label: t("footer.ourNetwork"), id: "#courses" },
                { label: t("footer.howItWorks"), id: "#how-it-works" },
                { label: t("footer.getYourCard"), id: "#pricing" },
              ].map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className="block text-sm transition-colors duration-200"
                  style={{
                    color: "rgba(255,255,255,0.45)",
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 300,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "oklch(0.42 0.14 145)", fontFamily: "'Outfit', sans-serif" }}
            >
              {t("footer.supportTitle")}
            </p>
            <div className="space-y-2.5">
              {[
                { label: t("footer.faq"), id: "#faq" },
                { label: t("footer.contactUs"), id: "#faq" },
              ].map((link) => (
                <button
                  key={link.label}
                  onClick={() => scrollTo(link.id)}
                  className="block text-sm transition-colors duration-200"
                  style={{
                    color: "rgba(255,255,255,0.45)",
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 300,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
                >
                  {link.label}
                </button>
              ))}
              <a
                href="mailto:info@linksgolfpr.com"
                className="block text-sm transition-colors duration-200"
                style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
              >
                {t("footer.email")}
              </a>
            </div>
          </div>

          {/* Legal */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "oklch(0.42 0.14 145)", fontFamily: "'Outfit', sans-serif" }}
            >
              {t("footer.legal")}
            </p>
            <div className="space-y-2.5">
              {[
                { label: t("footer.terms"), href: "#" },
                { label: t("footer.privacy"), href: "#" },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="block text-sm transition-colors duration-200"
                  style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <p
            className="text-xs"
            style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'Outfit', sans-serif" }}
          >
            {t("footer.bottom.residency")}
          </p>
          <p
            className="text-xs"
            style={{ color: "rgba(255,255,255,0.2)", fontFamily: "'Outfit', sans-serif" }}
          >
            {t("footer.bottom.tagline")}
          </p>
        </div>
      </div>
    </footer>
  );
}
