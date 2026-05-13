import { createHash } from "node:crypto";
import type { Request } from "express";
import { getRedis } from "./redis";

const KEY_PREFIX = "links:rl:sendotp:";

type Limits = {
  windowMs: number;
  emailMax: number;
  ipMax: number;
};

function readLimits(): Limits {
  const windowMs = Math.max(
    5_000,
    parseInt(process.env.SEND_OTP_RATE_WINDOW_MS ?? `${15 * 60 * 1000}`, 10)
  );
  const emailMax = Math.max(
    1,
    parseInt(process.env.SEND_OTP_MAX_PER_EMAIL_PER_WINDOW ?? "4", 10)
  );
  const ipMax = Math.max(
    1,
    parseInt(process.env.SEND_OTP_MAX_PER_IP_PER_WINDOW ?? "20", 10)
  );
  return { windowMs, emailMax, ipMax };
}

function windowId(now: number, windowMs: number): number {
  return Math.floor(now / windowMs);
}

/** In-process fallback when Redis is unset (single Node instance only). */
const memory = new Map<string, number>();

function pruneMemory(currentWid: number): void {
  for (const k of Array.from(memory.keys())) {
    const widStr = k.split(":").pop();
    const w = widStr ? parseInt(widStr, 10) : NaN;
    if (!Number.isFinite(w) || w < currentWid - 1) memory.delete(k);
  }
}

function memoryKey(kind: "e" | "i", id: string, wid: number): string {
  return `${kind}:${id}:${wid}`;
}

/**
 * Best-effort client IP for rate limiting (behind reverse proxies when
 * `x-forwarded-for` is set).
 */
export function getRequestClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 128);
  }
  if (Array.isArray(forwarded) && forwarded[0]?.trim()) {
    return forwarded[0].trim().slice(0, 128);
  }
  const fromExpress = (req as Request & { ip?: string }).ip;
  if (typeof fromExpress === "string" && fromExpress.trim()) {
    return fromExpress.trim().slice(0, 128);
  }
  const socketIp = req.socket?.remoteAddress;
  if (typeof socketIp === "string" && socketIp.trim()) {
    return socketIp.trim().slice(0, 128);
  }
  return "unknown";
}

function stableEmailSegment(email: string): string {
  const norm = email.trim().toLowerCase();
  return createHash("sha256").update(norm).digest("hex").slice(0, 32);
}

function stableIpSegment(ip: string): string {
  const trimmed = ip.trim().slice(0, 128);
  return createHash("sha256").update(trimmed).digest("hex").slice(0, 24);
}

async function incrementRedis(
  key: string,
  windowMs: number,
  maxAllowed: number
): Promise<{ allowed: boolean; count: number }> {
  const r = getRedis();
  if (!r) throw new Error("incrementRedis called without Redis");

  const n = await r.incr(key);
  if (n === 1) {
    await r.pexpire(key, Math.max(windowMs * 2, 10_000));
  }
  return { allowed: n <= maxAllowed, count: n };
}

function incrementMemory(
  kind: "e" | "i",
  id: string,
  wid: number,
  maxAllowed: number,
  currentWid: number
): { allowed: boolean; count: number } {
  pruneMemory(currentWid);
  const k = memoryKey(kind, id, wid);
  const next = (memory.get(k) ?? 0) + 1;
  memory.set(k, next);
  return { allowed: next <= maxAllowed, count: next };
}

/**
 * Records this send attempt and returns whether it is within limits.
 * Call **before** sending email; do not send if `allowed` is false.
 */
export async function recordSendOtpAttempt(
  email: string,
  clientIp: string
): Promise<{ allowed: true } | { allowed: false; reason: "email" | "ip" }> {
  const { windowMs, emailMax, ipMax } = readLimits();
  const now = Date.now();
  const wid = windowId(now, windowMs);
  const emailSeg = stableEmailSegment(email);
  const ipSeg = stableIpSegment(clientIp);

  const r = getRedis();
  if (r) {
    const emailKey = `${KEY_PREFIX}e:${emailSeg}:${wid}`;
    const ipKey = `${KEY_PREFIX}i:${ipSeg}:${wid}`;

    const emailRes = await incrementRedis(emailKey, windowMs, emailMax);
    if (!emailRes.allowed) {
      return { allowed: false, reason: "email" };
    }

    const ipRes = await incrementRedis(ipKey, windowMs, ipMax);
    if (!ipRes.allowed) {
      await r.decr(emailKey).catch(() => {});
      return { allowed: false, reason: "ip" };
    }

    return { allowed: true };
  }

  const emailMem = incrementMemory("e", emailSeg, wid, emailMax, wid);
  if (!emailMem.allowed) {
    return { allowed: false, reason: "email" };
  }

  const ipMem = incrementMemory("i", ipSeg, wid, ipMax, wid);
  if (!ipMem.allowed) {
    const ek = memoryKey("e", emailSeg, wid);
    const curE = (memory.get(ek) ?? 1) - 1;
    if (curE <= 0) memory.delete(ek);
    else memory.set(ek, curE);
    return { allowed: false, reason: "ip" };
  }

  return { allowed: true };
}

/** @internal Vitest */
export function resetSendOtpRateLimitForTests(): void {
  memory.clear();
}
