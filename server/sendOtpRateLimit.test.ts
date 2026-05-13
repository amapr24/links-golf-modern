import { describe, it, expect } from "vitest";
import { getRequestClientIp } from "./sendOtpRateLimit";

describe("getRequestClientIp", () => {
  it("prefers first x-forwarded-for hop", () => {
    const req = {
      headers: { "x-forwarded-for": "203.0.113.1, 10.0.0.1" },
      socket: { remoteAddress: "::1" },
    } as any;
    expect(getRequestClientIp(req)).toBe("203.0.113.1");
  });

  it("falls back to socket remoteAddress", () => {
    const req = {
      headers: {},
      socket: { remoteAddress: "192.168.1.2" },
    } as any;
    expect(getRequestClientIp(req)).toBe("192.168.1.2");
  });

  it("returns unknown when nothing is present", () => {
    const req = { headers: {}, socket: {} } as any;
    expect(getRequestClientIp(req)).toBe("unknown");
  });
});
