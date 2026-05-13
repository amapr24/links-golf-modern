import { LegalPolicyShell } from "@/components/LegalPolicyShell";

const PARAGRAPH_KEYS = [
  "legal.terms.p1",
  "legal.terms.p2",
  "legal.terms.p2checkin",
  "legal.terms.p3",
  "legal.terms.p4",
  "legal.terms.p5",
  "legal.terms.p6",
  "legal.terms.p7",
] as const;

export default function TermsOfService() {
  return (
    <LegalPolicyShell
      titleKey="legal.terms.title"
      subtitleKey="legal.terms.subtitle"
      paragraphKeys={PARAGRAPH_KEYS}
    />
  );
}
