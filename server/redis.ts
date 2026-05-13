import Redis from "ioredis";

let redisClient: Redis | null = null;
let redisInitAttempted = false;

/**
 * Shared Redis client when `REDIS_URL` is set.
 * Returns null in tests or when unset (callers use in-memory fallback).
 */
export function getRedis(): Redis | null {
  if (process.env.VITEST === "true" || process.env.NODE_ENV === "test") {
    return null;
  }
  const url = process.env.REDIS_URL?.trim();
  if (!url) return null;
  if (!redisInitAttempted) {
    redisInitAttempted = true;
    redisClient = new Redis(url, {
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
    });
  }
  return redisClient;
}
