/**
 * US / PR numbers only: country code +1 is implied and not shown in the form.
 * Collect up to 10 national digits; optional leading 1 is stripped when pasting full NANP.
 */

/** Strip to at most 10 national digits (digits only; leading country 1 removed if present). */
export function normalizeUsLocalPhoneDigits(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.length >= 11 && d.startsWith("1")) {
    d = d.slice(1);
  }
  return d.slice(0, 10);
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
