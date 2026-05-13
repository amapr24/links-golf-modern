import { useLanguage } from "@/contexts/LanguageContext";

type LanguageToggleProps = {
  /** `nav` = compact utility in the bar; `menu` = slightly larger touch targets in the mobile sheet */
  variant?: "nav" | "menu";
};

export default function LanguageToggle({ variant = "nav" }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();
  const isMenu = variant === "menu";

  const shellClass = isMenu
    ? "flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-white/15 bg-black/25"
    : "flex items-center gap-0.5 px-2 py-0.5 rounded-full border border-white/12 bg-black/20";

  const btnBase =
    "rounded font-medium uppercase tracking-wider transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40";

  const sizeClass = isMenu ? "px-3 py-1.5 text-sm" : "px-2 py-0.5 text-xs";

  const activeClass = isMenu
    ? "bg-white/18 text-white font-semibold ring-1 ring-white/20"
    : "bg-white/15 text-white font-semibold";

  const inactiveClass = "text-white/50 hover:text-white/80";

  return (
    <div
      className={shellClass}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`${btnBase} ${sizeClass} ${
          language === "en" ? activeClass : inactiveClass
        }`}
      >
        EN
      </button>
      <span className={isMenu ? "text-white/25 text-xs px-0.5" : "text-white/20 text-[10px] px-px"} aria-hidden>
        |
      </span>
      <button
        type="button"
        onClick={() => setLanguage("es")}
        className={`${btnBase} ${sizeClass} ${
          language === "es" ? activeClass : inactiveClass
        }`}
      >
        ES
      </button>
    </div>
  );
}
