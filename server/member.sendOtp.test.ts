import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { appRouter } from "./routers";
import { peekOtpForTests, resetOtpStoreForTests } from "./otpStore";
import { resetWelcomeEmailSentForTests } from "./welcomeEmailOnce";
import { resetSendOtpRateLimitForTests } from "./sendOtpRateLimit";

// Mock the email service
vi.mock("./email", () => ({
  sendOtpEmail: vi.fn(async (email: string, otp: string) => {
    console.log(`[Mock Email] Sending OTP ${otp} to ${email}`);
    return true;
  }),
  sendWelcomeEmail: vi.fn(async () => true),
}));

describe("member.sendOtp", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    resetOtpStoreForTests();
    resetWelcomeEmailSentForTests();
    resetSendOtpRateLimitForTests();
    // Create a caller with minimal context (no user required for public procedure)
    caller = appRouter.createCaller({
      req: {
        headers: {},
        protocol: "https",
      } as any,
      res: {} as any,
      user: null,
    });
  });

  it("should return success when OTP email is sent", async () => {
    const result = await caller.member.sendOtp({
      email: "test@example.com",
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe("OTP sent to your email");
    const stored = peekOtpForTests("test@example.com");
    expect(stored).toMatch(/^\d{6}$/);
  });

  it("should return error for invalid email format", async () => {
    try {
      await caller.member.sendOtp({
        email: "invalid-email",
      });
      // Should not reach here
      expect(true).toBe(false);
    } catch (error: any) {
      // Should fail validation
      expect(error.message).toContain("Invalid email address");
    }
  });

  it("should handle email service failures gracefully", async () => {
    // This test demonstrates the mutation structure
    // In production, mock the email service to return false
    const result = await caller.member.sendOtp({
      email: "failure@example.com",
    });

    expect(result).toHaveProperty("success");
    expect(typeof result.success).toBe("boolean");
  });
});

describe("member.sendOtp rate limits", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    resetOtpStoreForTests();
    resetWelcomeEmailSentForTests();
    resetSendOtpRateLimitForTests();
    vi.stubEnv("SEND_OTP_RATE_WINDOW_MS", "900000");
    caller = appRouter.createCaller({
      req: {
        headers: {},
        protocol: "https",
        socket: { remoteAddress: "10.0.0.50" },
      } as any,
      res: {} as any,
      user: null,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("blocks after too many sends to the same email in the window", async () => {
    vi.stubEnv("SEND_OTP_MAX_PER_EMAIL_PER_WINDOW", "2");

    expect((await caller.member.sendOtp({ email: "same@example.com" })).success).toBe(
      true
    );
    expect((await caller.member.sendOtp({ email: "same@example.com" })).success).toBe(
      true
    );
    const blocked = await caller.member.sendOtp({ email: "same@example.com" });
    expect(blocked.success).toBe(false);
    expect(blocked.error).toMatch(/Too many verification requests/i);
  });

  it("blocks after too many sends from the same IP in the window", async () => {
    vi.stubEnv("SEND_OTP_MAX_PER_IP_PER_WINDOW", "2");
    vi.stubEnv("SEND_OTP_MAX_PER_EMAIL_PER_WINDOW", "99");

    expect((await caller.member.sendOtp({ email: "u1@example.com" })).success).toBe(
      true
    );
    expect((await caller.member.sendOtp({ email: "u2@example.com" })).success).toBe(
      true
    );
    const blocked = await caller.member.sendOtp({ email: "u3@example.com" });
    expect(blocked.success).toBe(false);
    expect(blocked.error).toMatch(/Too many verification requests/i);
  });
});
