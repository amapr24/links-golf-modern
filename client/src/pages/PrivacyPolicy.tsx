import { LegalPolicyShell } from "@/components/LegalPolicyShell";

const PARAGRAPH_KEYS = [
  "legal.privacy.p1",
  "legal.privacy.p2",
  "legal.privacy.p3",
  "legal.privacy.p4",
  "legal.privacy.p5",
  "legal.privacy.p6",
  "legal.privacy.p7",
] as const;

export default function PrivacyPolicy() {
  return (
    <LegalPolicyShell
      titleKey="legal.privacy.title"
      subtitleKey="legal.privacy.subtitle"
      paragraphKeys={PARAGRAPH_KEYS}
    />
  );
}
