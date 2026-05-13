/*
 * Navbar — Links Golf Membership
 * Design: Transparent on hero, dark solid on scroll
 * Mobile: Hamburger menu with full-screen overlay
 */

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { scrollElementIntoViewMotionSafe } from "@/lib/scroll";
import LanguageToggle from "./LanguageToggle";

export default function Navbar() {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: t("nav.benefits"), href: "#benefits" },
    { label: t("nav.courses"), href: "#courses" },
    { label: t("nav.howItWorks"), href: "#how-it-works" },
    { label: t("nav.faq"), href: "#faq" },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    scrollElementIntoViewMotionSafe(document.querySelector(href));
  };

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
        style={{
          background: scrolled
            ? "rgba(15, 26, 18, 0.97)"
            : "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "none",
        }}
      >
        <div className="container flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "var(--color-fairway)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            </div>
            <span className="font-semibold text-white text-sm tracking-wide" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Links Golf
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-white/80 hover:text-white text-sm font-medium tracking-wide transition-colors duration-200"
                style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "0.04em" }}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageToggle />
            <button
              onClick={() => handleNavClick("#pricing")}
              className="btn-fairway text-xs py-2.5 px-5"
            >
              {t("nav.getCard")}
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white p-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className="fixed inset-0 z-50 md:hidden transition-all duration-300"
        style={{
          background: "rgba(15, 26, 18, 0.98)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 h-16">
            <span className="font-semibold text-white text-sm tracking-wide" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Links Golf
            </span>
            <button
              className="text-white p-1"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
          </div>
          <div className="flex flex-col items-start justify-center flex-1 px-8 gap-8 pb-16">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-white/90 hover:text-white text-3xl font-light tracking-wide transition-colors"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {link.label}
              </button>
            ))}
            <div className="pt-8 w-full space-y-4">
              <LanguageToggle />
              <button
                onClick={() => handleNavClick("#pricing")}
                className="btn-fairway w-full text-sm py-4"
              >
                {t("nav.getCard")} — $199/yr
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
