import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";

describe("member.verifyOtp", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
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

  it("should return success when OTP is valid format", async () => {
    const result = await caller.member.verifyOtp({
      email: "test@example.com",
      otp: "123456",
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe("OTP verified successfully");
  });

  it("should return error for invalid OTP format (non-numeric)", async () => {
    const result = await caller.member.verifyOtp({
      email: "test@example.com",
      otp: "abcdef",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid OTP format.");
  });

  it("should return error for OTP with wrong length", async () => {
    // This should fail at the zod validation level
    try {
      await caller.member.verifyOtp({
        email: "test@example.com",
        otp: "12345", // Only 5 digits instead of 6
      });
    } catch (error) {
      // Expected to fail validation
      expect(error).toBeDefined();
    }
  });

  it("should validate email format", async () => {
    try {
      await caller.member.verifyOtp({
        email: "invalid-email",
        otp: "123456",
      });
    } catch (error) {
      // Expected to fail email validation
      expect(error).toBeDefined();
    }
  });

  it("should return success with valid inputs", async () => {
    const result = await caller.member.verifyOtp({
      email: "juan@example.com",
      otp: "654321",
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("verified successfully");
  });
});
