import { useLanguage } from "@/contexts/LanguageContext";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
      <button
        onClick={() => setLanguage("en")}
        className={`px-2 py-1 rounded text-sm font-medium transition-all ${
          language === "en"
            ? "bg-white text-[#1a3a2a] font-semibold"
            : "text-white hover:text-white/80"
        }`}
      >
        EN
      </button>
      <span className="text-white/40">|</span>
      <button
        onClick={() => setLanguage("es")}
        className={`px-2 py-1 rounded text-sm font-medium transition-all ${
          language === "es"
            ? "bg-white text-[#1a3a2a] font-semibold"
            : "text-white hover:text-white/80"
        }`}
      >
        ES
      </button>
    </div>
  );
}
