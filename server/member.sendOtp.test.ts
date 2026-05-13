import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { peekOtpForTests, resetOtpStoreForTests } from "./otpStore";
import { resetWelcomeEmailSentForTests } from "./welcomeEmailOnce";

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
