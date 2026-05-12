/*
 * HeroSection — Links Golf Membership
 * Design: Full-viewport golf course image, dark gradient overlay
 * Mobile-first: Bold headline + price + CTA immediately visible
 * Image: Puerto Rico golf course at golden hour with ocean views
 */

import { useEffect, useState } from "react";
import { ArrowRight, MapPin } from "lucide-react";

const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663654134519/4FsPe29zkxfgYYXFDn34Fq/hero-golf-pr-CZJDsMr2L3k8yznVeYKFj5.webp";

export default function HeroSection() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const scrollToPricing = () => {
    document.querySelector("#pricing")?.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToCourses = () => {
    document.querySelector("#courses")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="relative min-h-screen flex flex-col justify-end overflow-hidden"
      style={{ minHeight: "100svh" }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[8000ms] ease-out"
        style={{
          backgroundImage: `url(${HERO_IMAGE})`,
          transform: loaded ? "scale(1.03)" : "scale(1.08)",
        }}
      />

      {/* Gradient overlays */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to top, rgba(10,18,12,0.95) 0%, rgba(10,18,12,0.7) 35%, rgba(10,18,12,0.35) 65%, rgba(10,18,12,0.15) 100%)",
        }}
      />
      {/* Left-side vignette for text legibility */}
      <div
        className="absolute inset-0 hidden md:block"
        style={{
          background: "linear-gradient(to right, rgba(10,18,12,0.65) 0%, transparent 55%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 container pb-16 pt-28 md:pb-20 md:pt-32">
        <div className="max-w-2xl">
          {/* Location badge */}
          <div
            className="inline-flex items-center gap-1.5 mb-5 px-3 py-1.5 rounded-full text-white text-xs font-medium tracking-widest uppercase"
            style={{
              background: "rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.25)",
              backdropFilter: "blur(10px)",
              fontFamily: "'Outfit', sans-serif",
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 600ms ease, transform 600ms ease",
              transitionDelay: "100ms",
            }}
          >
            <MapPin size={11} />
            Puerto Rico · 15 Partner Courses
          </div>

          {/* Main headline */}
          <h1
            className="text-white leading-[0.95] mb-5"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(3.2rem, 10vw, 6.5rem)",
              fontWeight: 600,
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 700ms ease, transform 700ms ease",
              transitionDelay: "200ms",
            }}
          >
            Play More.
            <br />
            <em style={{ color: "oklch(0.65 0.16 145)", fontStyle: "italic", textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>Pay Less.</em>
          </h1>

          {/* Sub-headline */}
          <p
            className="text-white mb-8 leading-relaxed"
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "clamp(1rem, 2.5vw, 1.15rem)",
              fontWeight: 300,
              maxWidth: "480px",
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 700ms ease, transform 700ms ease",
              transitionDelay: "350ms",
              textShadow: "0 1px 4px rgba(0,0,0,0.3)",
            }}
          >
            One membership unlocks up to <strong className="text-white font-semibold">25% off green fees</strong> at Puerto Rico's finest courses — from TPC Dorado Beach to Royal Isabela.
          </p>

          {/* Price + CTAs */}
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 700ms ease, transform 700ms ease",
              transitionDelay: "500ms",
            }}
          >
            <button onClick={scrollToPricing} className="btn-fairway text-sm py-4 px-7">
              Get Your Card — $199/yr
              <ArrowRight size={15} />
            </button>
            <button onClick={scrollToCourses} className="btn-outline-white text-sm py-4 px-7">
              View All Courses
            </button>
          </div>

          {/* Social proof strip */}
          <div
            className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-8"
            style={{
              opacity: loaded ? 1 : 0,
              transition: "opacity 700ms ease",
              transitionDelay: "700ms",
            }}
          >
            {[
              { value: "15", label: "Partner Courses" },
              { value: "25%", label: "Max Savings" },
              { value: "$199", label: "Per Year" },
            ].map((stat) => (
              <div key={stat.value} className="flex items-baseline gap-1.5">
                <span
                  className="text-white font-bold text-xl"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  {stat.value}
                </span>
                <span
                  className="text-white/50 text-xs uppercase tracking-widest"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 hidden md:flex"
        style={{
          opacity: loaded ? 0.5 : 0,
          transition: "opacity 1s ease",
          transitionDelay: "1200ms",
        }}
      >
        <span className="text-white/60 text-xs tracking-widest uppercase" style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem" }}>
          Scroll
        </span>
        <div className="w-px h-8 bg-white/30 animate-pulse" />
      </div>
    </section>
  );
}
