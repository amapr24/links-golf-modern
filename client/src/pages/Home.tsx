/*
 * LINKS GOLF MEMBERSHIP — Home Page
 * Design: "Links Modern" — Refined Athletic Modernism
 * Dark immersive hero → benefits → courses → how-it-works → pricing/signup → FAQ
 * Mobile-first, conversion-focused, golf-forward from the first viewport
 */

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BenefitsSection from "@/components/BenefitsSection";
import CoursesSection from "@/components/CoursesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import PricingSection from "@/components/PricingSection";
import FaqSection from "@/components/FaqSection";
import FooterSection from "@/components/FooterSection";
import StickyCTA from "@/components/StickyCTA";

export default function Home() {
  const { language } = useLanguage();
  const [heroExited, setHeroExited] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setHeroExited(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  // Scroll fade-in for all .fade-up elements
  useEffect(() => {
    const elements = document.querySelectorAll(".fade-up, .underline-green");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.15 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [language]);

  // Deep-link targets: show animated content immediately (avoids invisible focus until IO runs)
  useEffect(() => {
    const revealInSection = (id: string) => {
      const root = document.getElementById(id);
      if (!root) return;
      root.querySelectorAll(".fade-up, .underline-green").forEach((node) => {
        node.classList.add("visible");
      });
    };

    const syncFromHash = () => {
      const id = window.location.hash.replace(/^#/, "");
      if (id) revealInSection(id);
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [language]);

  return (
    <div className="min-h-screen bg-[#F7F3EC]">
      <Navbar />
      <div ref={heroRef}>
        <HeroSection />
      </div>
      <BenefitsSection />
      <CoursesSection />
      <HowItWorksSection />
      <PricingSection />
      <FaqSection />
      <FooterSection />
      <StickyCTA visible={heroExited} />
    </div>
  );
}
