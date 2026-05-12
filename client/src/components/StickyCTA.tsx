/*
 * StickyCTA — Links Golf Membership
 * Design: Slides up from bottom on mobile after hero exits viewport
 * Shows price and CTA button
 */

interface StickyCTAProps {
  visible: boolean;
}

export default function StickyCTA({ visible }: StickyCTAProps) {
  const scrollToPricing = () => {
    document.querySelector("#pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className="md:hidden sticky-cta"
      style={{
        transform: visible ? "translateY(0)" : "translateY(100%)",
        transition: "transform 350ms cubic-bezier(0.23, 1, 0.32, 1)",
      }}
    >
      <div
        className="flex items-center justify-between gap-3 px-4 py-3 shadow-2xl"
        style={{
          background: "oklch(0.13 0.05 145)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div>
          <div
            className="text-white font-bold text-lg leading-none"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            $199
          </div>
          <div
            className="text-white/40 text-xs"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            per year · 15 courses
          </div>
        </div>
        <button
          onClick={scrollToPricing}
          className="btn-fairway text-xs py-3 px-6 flex-shrink-0"
        >
          Get Your Card
        </button>
      </div>
    </div>
  );
}
