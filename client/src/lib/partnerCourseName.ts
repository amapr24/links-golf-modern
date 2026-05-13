import type { Language } from "@/contexts/LanguageContext";

/**
 * Localized partner course label for map/list/cards.
 * English uses the canonical `defaultName`; Spanish uses `courses.partner.{slug}` when present.
 */
export function partnerCourseName(
  slug: string,
  defaultName: string,
  language: Language,
  t: (key: string) => string,
): string {
  if (language !== "es") return defaultName;
  const key = `courses.partner.${slug}`;
  const translated = t(key);
  return translated === key ? defaultName : translated;
}
