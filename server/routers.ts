import { randomInt } from "node:crypto";
import { z } from "zod";
import {
  getMemberSessionCookieOptions,
  getSessionCookieOptions,
} from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { sendOtpEmail, sendWelcomeEmail } from "./email";
import {
  MEMBER_SESSION_MAX_AGE_SEC,
  signMemberSessionToken,
} from "./memberJwt";
import { readMemberSessionFromRequest } from "./memberSessionCookie";
import {
  fetchMemberWelcomeFields,
  markWelcomeEmailSentAtMember,
  resolveMemberIdFromEmail,
} from "./memberWelcomeFromDb";
import { fetchMemberProfileForSession } from "./memberProfileFromDb";
import { saveOtp, verifyAndConsumeOtp } from "./otpStore";
import {
  getRequestClientIp,
  recordSendOtpAttempt,
} from "./sendOtpRateLimit";
import {
  hasWelcomeEmailBeenSent,
  markWelcomeEmailSent,
} from "./welcomeEmailOnce";
import { COOKIE_NAME, MEMBER_SESSION_COOKIE } from "@shared/const";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Member authentication (OTP-based login)
  member: router({
    /** Current member session from httpOnly cookie (server-verified JWT). */
    session: publicProcedure.query(async ({ ctx }) => {
      return readMemberSessionFromRequest(ctx.req);
    }),

    /**
     * Member profile from Supabase `members` (service role), scoped to the session.
     * Null when not logged in, or when service role / row is unavailable.
     */
    me: publicProcedure.query(async ({ ctx }) => {
      const session = await readMemberSessionFromRequest(ctx.req);
      if (!session) return null;
      return fetchMemberProfileForSession(session.memberId, session.email);
    }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const opts = getMemberSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(MEMBER_SESSION_COOKIE, {
        ...opts,
        maxAge: 0,
      });
      return { success: true as const };
    }),

    sendOtp: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input, ctx }) => {
        try {
          const clientIp = getRequestClientIp(ctx.req);
          const rate = await recordSendOtpAttempt(input.email, clientIp);
          if (!rate.allowed) {
            return {
              success: false,
              error:
                "Too many verification requests. Please try again later.",
            };
          }

          // Generate 6-digit OTP
          const otp = String(randomInt(0, 1_000_000)).padStart(6, "0");

          // Send OTP email via Resend
          const emailSent = await sendOtpEmail(input.email, otp);

          if (!emailSent) {
            return {
              success: false,
              error: "Failed to send OTP email. Please try again.",
            };
          }

          await saveOtp(input.email, otp);

          if (process.env.NODE_ENV === "development") {
            console.log(`[sendOtp] OTP sent to ${input.email} (dev only log)`);
          }

          return {
            success: true,
            message: "OTP sent to your email",
          };
        } catch (error) {
          console.error("[sendOtp] Error:", error);
          return {
            success: false,
            error: "An error occurred. Please try again.",
          };
        }
      }),

    verifyOtp: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          otp: z.string().length(6),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          if (!/^\d{6}$/.test(input.otp)) {
            return {
              success: false,
              error: "Invalid OTP format.",
            };
          }

          const ok = await verifyAndConsumeOtp(input.email, input.otp);
          if (!ok) {
            return {
              success: false,
              error: "Invalid or expired verification code.",
            };
          }

          const emailNorm = input.email.toLowerCase();
          const memberId = await resolveMemberIdFromEmail(emailNorm);
          if (!memberId) {
            return {
              success: false,
              error:
                "No member record found for this email. Please sign up first.",
            };
          }

          const welcome = await fetchMemberWelcomeFields(
            memberId,
            emailNorm
          );
          if (welcome) {
            const alreadyFromDb = Boolean(welcome.welcomeEmailSentAt);
            const alreadyFromCache =
              alreadyFromDb ? false : await hasWelcomeEmailBeenSent(emailNorm);
            if (!alreadyFromDb && !alreadyFromCache) {
              const mailed = await sendWelcomeEmail(
                emailNorm,
                welcome.firstName,
                welcome.memberNumber
              );
              if (mailed) {
                await markWelcomeEmailSentAtMember(memberId);
                await markWelcomeEmailSent(emailNorm);
              }
            }
          }

          const token = await signMemberSessionToken({
            sub: memberId,
            email: emailNorm,
          });
          const cookieOpts = getMemberSessionCookieOptions(ctx.req);
          ctx.res.cookie(MEMBER_SESSION_COOKIE, token, {
            ...cookieOpts,
            maxAge: MEMBER_SESSION_MAX_AGE_SEC * 1000,
          });

          return {
            success: true,
            message: "OTP verified successfully",
          };
        } catch (error) {
          console.error("[verifyOtp] Error:", error);
          return {
            success: false,
            error: "An error occurred. Please try again.",
          };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
