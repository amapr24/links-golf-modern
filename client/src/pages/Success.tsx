
import { useLocation } from "wouter";
import { Check, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Success() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[oklch(0.98_0.01_145)] to-[oklch(0.95_0.02_145)]">
      <div className="text-center max-w-md mx-auto px-4">
        {/* Success Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center animate-pulse"
              style={{ background: "oklch(0.42 0.14 145)" }}
            >
              <Check className="w-10 h-10 text-white" strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* Heading */}
        <h1
          className="text-3xl font-semibold mb-3"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            color: "oklch(0.13 0.05 145)",
          }}
        >
          {t("pricing.success")}
        </h1>

        {/* Description */}
        <p
          className="text-base mb-6"
          style={{
            fontFamily: "'Outfit', sans-serif",
            color: "oklch(0.45 0.06 145)",
            lineHeight: 1.6,
          }}
        >
          {t("pricing.successDesc")}
        </p>

        {/* Redirect Info */}
        <div
          className="p-4 rounded-lg mb-8"
          style={{
            background: "white",
            border: "1px solid oklch(0.88 0.02 85)",
          }}
        >
          <p
            className="text-sm"
            style={{
              fontFamily: "'Outfit', sans-serif",
              color: "oklch(0.45 0.06 145)",
            }}
          >
            {t("pricing.checkEmail")}
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => setLocation("/dashboard")}
          className="w-full px-6 py-3 rounded-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 group"
          style={{
            fontFamily: "'Outfit', sans-serif",
            background: "oklch(0.42 0.14 145)",
            color: "white",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          {t("pricing.goToDashboard")}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>


      </div>
    </div>
  );
}
