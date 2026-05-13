import { getRedis } from "./redis";

const WELCOME_KEY_PREFIX = "links:welcome:sent:";

/** In-process fallback when Redis is unavailable (single Node instance). */
const welcomeSentMemory = new Set<string>();

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function hasWelcomeEmailBeenSent(email: string): Promise<boolean> {
  const key = normalizeEmail(email);
  const r = getRedis();
  if (r) {
    const v = await r.get(`${WELCOME_KEY_PREFIX}${key}`);
    return Boolean(v);
  }
  return welcomeSentMemory.has(key);
}

export async function markWelcomeEmailSent(email: string): Promise<void> {
  const key = normalizeEmail(email);
  const r = getRedis();
  if (r) {
    await r.set(`${WELCOME_KEY_PREFIX}${key}`, "1");
    return;
  }
  welcomeSentMemory.add(key);
}

export function resetWelcomeEmailSentForTests(): void {
  welcomeSentMemory.clear();
}
