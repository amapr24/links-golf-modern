/**
 * Step title + body styles used in `HowItWorksSection`.
 * `BenefitsSection` reuses the same scale for parity.
 */
export const howItWorksStepTitleStyle = {
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: "clamp(1.2rem, 3.2vw, 1.45rem)",
  fontWeight: 600,
} as const;

export const howItWorksStepBodyClassName = "text-sm sm:text-base leading-relaxed";

export const howItWorksStepBodyStyle = {
  fontFamily: "'Outfit', sans-serif",
  fontWeight: 400,
  color: "oklch(0.35 0.05 145)",
} as const;
