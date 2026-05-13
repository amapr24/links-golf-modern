import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import { peekOtpForTests, resetOtpStoreForTests } from "./otpStore";
import { resetWelcomeEmailSentForTests } from "./welcomeEmailOnce";
import { resetSendOtpRateLimitForTests } from "./sendOtpRateLimit";

const TEST_MEMBER_ID = "550e8400-e29b-41d4-a716-446655440000";

const emailMocks = vi.hoisted(() => ({
  sendOtpEmail: vi.fn(async (_email: string, _otp: string) => true),
  sendWelcomeEmail: vi.fn(async () => true),
}));

vi.mock("./email", () => emailMocks);

const welcomeDbMocks = vi.hoisted(() => ({
  fetchMemberWelcomeFields: vi.fn(async () => ({
    firstName: "Pat",
    memberNumber: "LGM-001",
    welcomeEmailSentAt: null as string | null,
  })),
  markWelcomeEmailSentAtMember: vi.fn(async () => true),
}));

const resolveMemberIdMock = vi.hoisted(() =>
  vi.fn(async () => TEST_MEMBER_ID),
);

vi.mock("./memberWelcomeFromDb", () => ({
  fetchMemberWelcomeFields: welcomeDbMocks.fetchMemberWelcomeFields,
  markWelcomeEmailSentAtMember: welcomeDbMocks.markWelcomeEmailSentAtMember,
  resolveMemberIdFromEmail: resolveMemberIdMock,
}));

describe("member.verifyOtp", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  const cookies: Record<string, string> = {};

  beforeEach(() => {
    resetOtpStoreForTests();
    resetWelcomeEmailSentForTests();
    resetSendOtpRateLimitForTests();
    emailMocks.sendWelcomeEmail.mockClear();
    welcomeDbMocks.fetchMemberWelcomeFields.mockImplementation(async () => ({
      firstName: "Pat",
      memberNumber: "LGM-001",
      welcomeEmailSentAt: null,
    }));
    welcomeDbMocks.markWelcomeEmailSentAtMember.mockClear();
    resolveMemberIdMock.mockImplementation(async () => TEST_MEMBER_ID);
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

  it("rejects verify when no member row exists for the email", async () => {
    resolveMemberIdMock.mockResolvedValueOnce(null);
    await caller.member.sendOtp({ email: "orphan@example.com" });
    const otp = peekOtpForTests("orphan@example.com")!;
    const result = await caller.member.verifyOtp({
      email: "orphan@example.com",
      otp,
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain("No member record");
  });

  it("rejects invalid OTP format", async () => {
    const result = await caller.member.verifyOtp({
      email: "test@example.com",
      otp: "abcdef",
    });
    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid OTP format.");
  });

  it("rejects wrong or missing OTP when none was issued", async () => {
    const result = await caller.member.verifyOtp({
      email: "nobody@example.com",
      otp: "123456",
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
    });
    expect(ok.success).toBe(true);

    const replay = await caller.member.verifyOtp({
      email: "member@example.com",
      otp: otp!,
    });
    expect(replay.success).toBe(false);
  });

  it("rejects wrong code without consuming a valid OTP", async () => {
    await caller.member.sendOtp({ email: "two@example.com" });
    const otp = peekOtpForTests("two@example.com")!;

    const wrong = await caller.member.verifyOtp({
      email: "two@example.com",
      otp: "000000",
    });
    expect(wrong.success).toBe(false);

    const right = await caller.member.verifyOtp({
      email: "two@example.com",
      otp,
    });
    expect(right.success).toBe(true);
  });

  it("fails zod validation for short OTP", async () => {
    await expect(
      caller.member.verifyOtp({
        email: "z@example.com",
        otp: "12345",
      })
    ).rejects.toBeDefined();
  });

  it("sends welcome email at most once per email address", async () => {
    await caller.member.sendOtp({ email: "once@example.com" });
    const otp1 = peekOtpForTests("once@example.com")!;
    await caller.member.verifyOtp({
      email: "once@example.com",
      otp: otp1,
    });
    expect(emailMocks.sendWelcomeEmail).toHaveBeenCalledTimes(1);

    await caller.member.sendOtp({ email: "once@example.com" });
    const otp2 = peekOtpForTests("once@example.com")!;
    await caller.member.verifyOtp({
      email: "once@example.com",
      otp: otp2,
    });
    expect(emailMocks.sendWelcomeEmail).toHaveBeenCalledTimes(1);
  });

  it("does not send welcome when DB already recorded welcome_email_sent_at", async () => {
    welcomeDbMocks.fetchMemberWelcomeFields.mockResolvedValueOnce({
      firstName: "Pat",
      memberNumber: "LGM-001",
      welcomeEmailSentAt: "2020-01-01T00:00:00.000Z",
    });
    await caller.member.sendOtp({ email: "dbdone@example.com" });
    const otp = peekOtpForTests("dbdone@example.com")!;
    await caller.member.verifyOtp({
      email: "dbdone@example.com",
      otp,
    });
    expect(emailMocks.sendWelcomeEmail).not.toHaveBeenCalled();
    expect(welcomeDbMocks.markWelcomeEmailSentAtMember).not.toHaveBeenCalled();
  });

  it("persists welcome sent time on member after welcome email succeeds", async () => {
    await caller.member.sendOtp({ email: "markdb@example.com" });
    const otp = peekOtpForTests("markdb@example.com")!;
    await caller.member.verifyOtp({
      email: "markdb@example.com",
      otp,
    });
    expect(welcomeDbMocks.markWelcomeEmailSentAtMember).toHaveBeenCalledWith(
      TEST_MEMBER_ID
    );
  });
});
