import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import { peekOtpForTests, resetOtpStoreForTests } from "./otpStore";
import { resetWelcomeEmailSentForTests } from "./welcomeEmailOnce";

const TEST_MEMBER_ID = "550e8400-e29b-41d4-a716-446655440000";

const emailMocks = vi.hoisted(() => ({
  sendOtpEmail: vi.fn(async (_email: string, _otp: string) => true),
  sendWelcomeEmail: vi.fn(async () => true),
}));

vi.mock("./email", () => emailMocks);

vi.mock("./memberWelcomeFromDb", () => ({
  fetchMemberWelcomeFields: vi.fn(async () => ({
    firstName: "Pat",
    memberNumber: "LGM-001",
  })),
}));

describe("member.verifyOtp", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  const cookies: Record<string, string> = {};

  beforeEach(() => {
    resetOtpStoreForTests();
    resetWelcomeEmailSentForTests();
    emailMocks.sendWelcomeEmail.mockClear();
    Object.keys(cookies).forEach(k => delete cookies[k]);
    caller = appRouter.createCaller({
      req: {
        headers: {},
        protocol: "https",
      } as any,
      res: {
        cookie(name: string, value: string) {
          cookies[name] = value;
        },
        clearCookie(name: string) {
          delete cookies[name];
        },
      } as any,
      user: null,
    });
  });

  it("rejects invalid OTP format", async () => {
    const result = await caller.member.verifyOtp({
      email: "test@example.com",
      otp: "abcdef",
      memberId: TEST_MEMBER_ID,
    });
    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid OTP format.");
  });

  it("rejects wrong or missing OTP when none was issued", async () => {
    const result = await caller.member.verifyOtp({
      email: "nobody@example.com",
      otp: "123456",
      memberId: TEST_MEMBER_ID,
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid or expired");
  });

  it("accepts a correct OTP once then rejects reuse", async () => {
    await caller.member.sendOtp({ email: "member@example.com" });
    const otp = peekOtpForTests("member@example.com");
    expect(otp).toBeDefined();
    expect(otp).toMatch(/^\d{6}$/);

    const ok = await caller.member.verifyOtp({
      email: "member@example.com",
      otp: otp!,
      memberId: TEST_MEMBER_ID,
    });
    expect(ok.success).toBe(true);

    const replay = await caller.member.verifyOtp({
      email: "member@example.com",
      otp: otp!,
      memberId: TEST_MEMBER_ID,
    });
    expect(replay.success).toBe(false);
  });

  it("rejects wrong code without consuming a valid OTP", async () => {
    await caller.member.sendOtp({ email: "two@example.com" });
    const otp = peekOtpForTests("two@example.com")!;

    const wrong = await caller.member.verifyOtp({
      email: "two@example.com",
      otp: "000000",
      memberId: TEST_MEMBER_ID,
    });
    expect(wrong.success).toBe(false);

    const right = await caller.member.verifyOtp({
      email: "two@example.com",
      otp,
      memberId: TEST_MEMBER_ID,
    });
    expect(right.success).toBe(true);
  });

  it("fails zod validation for short OTP", async () => {
    await expect(
      caller.member.verifyOtp({
        email: "z@example.com",
        otp: "12345",
        memberId: TEST_MEMBER_ID,
      })
    ).rejects.toBeDefined();
  });

  it("sends welcome email at most once per email address", async () => {
    await caller.member.sendOtp({ email: "once@example.com" });
    const otp1 = peekOtpForTests("once@example.com")!;
    await caller.member.verifyOtp({
      email: "once@example.com",
      otp: otp1,
      memberId: TEST_MEMBER_ID,
    });
    expect(emailMocks.sendWelcomeEmail).toHaveBeenCalledTimes(1);

    await caller.member.sendOtp({ email: "once@example.com" });
    const otp2 = peekOtpForTests("once@example.com")!;
    await caller.member.verifyOtp({
      email: "once@example.com",
      otp: otp2,
      memberId: TEST_MEMBER_ID,
    });
    expect(emailMocks.sendWelcomeEmail).toHaveBeenCalledTimes(1);
  });
});
