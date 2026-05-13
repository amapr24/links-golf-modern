/**
 * US / PR / CA (NANP): country code +1 is implied; collect 10 national digits.
 * Optional leading 1 is stripped when pasting full +1 numbers.
 */

/** Strip to at most 10 national digits (digits only; leading country 1 removed if present). */
export function normalizeUsLocalPhoneDigits(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.length >= 11 && d.startsWith("1")) {
    d = d.slice(1);
  }
  return d.slice(0, 10);
}

/** Pretty-print national digits as XXX-XXX-XXXX (partial while typing). */
export function formatUsLocalDigitsForDisplay(normalizedDigits: string): string {
  const n = normalizedDigits.slice(0, 10);
  if (n.length <= 3) return n;
  if (n.length <= 6) return `${n.slice(0, 3)}-${n.slice(3)}`;
  return `${n.slice(0, 3)}-${n.slice(3, 6)}-${n.slice(6)}`;
}

/**
 * Validates 10 national digits and returns storage form with hardcoded +1.
 */
export function formatUsPhoneForStorage(raw: string): string | null {
  const d = normalizeUsLocalPhoneDigits(raw);
  if (d.length !== 10) {
    return null;
  }
  return `+1 ${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
}
