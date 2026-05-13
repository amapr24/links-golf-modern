/** Course aerial used as the digital member card backdrop (shared everywhere). */
export const MEMBER_CARD_AERIAL_IMAGE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663654134519/4FsPe29zkxfgYYXFDn34Fq/course-aerial-Cx8xkxJjzpQ297eVUAemkv.webp";

export function formatMemberNumberFromId(id: string): string {
  const hex = id.replace(/-/g, "").slice(0, 6).toUpperCase();
  return `LGM-${hex}`;
}

/** Expiry on card as MM/YY (matches signup success card). */
export function formatCardExpiryMonthYear(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getFullYear()).slice(-2)}`;
}
