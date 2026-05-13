import { LegalPolicyShell } from "@/components/LegalPolicyShell";

const PARAGRAPH_KEYS = [
  "legal.refund.p1",
  "legal.refund.p2",
  "legal.refund.p3",
  "legal.refund.p4",
  "legal.refund.p5",
  "legal.refund.p6",
  "legal.refund.p7",
  "legal.refund.p8",
] as const;

export default function RefundPolicy() {
  return (
    <LegalPolicyShell
      titleKey="legal.refund.title"
      subtitleKey="legal.refund.subtitle"
      paragraphKeys={PARAGRAPH_KEYS}
    />
  );
}
