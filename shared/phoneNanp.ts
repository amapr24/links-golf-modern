/**
 * Puerto Rico / US NANP: normalize to "+1 XXX-XXX-XXXX" for storage and display.
 * Accepts 10 digits or 11 digits starting with 1; strips other punctuation.
 */
export function formatNanpPhoneForStorage(raw: string): string | null {
  const d = raw.replace(/\D/g, "");
  let n = d;
  if (n.length === 11 && n.startsWith("1")) {
    n = n.slice(1);
  }
  if (n.length !== 10) {
    return null;
  }
  return `+1 ${n.slice(0, 3)}-${n.slice(3, 6)}-${n.slice(6)}`;
}
