import { getRedis } from "./redis";

const TTL_SECONDS = 10 * 60;
const KEY_PREFIX = "links:otp:";

/** In-process fallback when `REDIS_URL` is unset (single Node instance only). */
const memory = new Map<string, { otp: string; expiresAt: number }>();

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function pruneExpiredMemory(key: string): void {
  const row = memory.get(key);
  if (row && row.expiresAt <= Date.now()) memory.delete(key);
}

export async function saveOtp(email: string, otp: string): Promise<void> {
  const key = normalizeEmail(email);
  const r = getRedis();
  if (r) {
    await r.setex(`${KEY_PREFIX}${key}`, TTL_SECONDS, otp);
    return;
  }
  memory.set(key, { otp, expiresAt: Date.now() + TTL_SECONDS * 1000 });
}

/**
 * Returns true if OTP matched and was removed (one-time use).
 */
export async function verifyAndConsumeOtp(email: string, otp: string): Promise<boolean> {
  const key = normalizeEmail(email);
  const r = getRedis();
  if (r) {
    const redisKey = `${KEY_PREFIX}${key}`;
    const stored = await r.get(redisKey);
    if (!stored || stored !== otp) return false;
    await r.del(redisKey);
    return true;
  }
  pruneExpiredMemory(key);
  const row = memory.get(key);
  if (!row || row.expiresAt <= Date.now()) {
    if (row) memory.delete(key);
    return false;
  }
  if (row.otp !== otp) return false;
  memory.delete(key);
  return true;
}

/** Vitest / dev: clear in-memory OTP entries. */
export function resetOtpStoreForTests(): void {
  memory.clear();
}

/** @internal Vitest: read OTP from memory (no-op when Redis is active). */
export function peekOtpForTests(email: string): string | undefined {
  const key = normalizeEmail(email);
  pruneExpiredMemory(key);
  return memory.get(key)?.otp;
}
