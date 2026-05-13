import { randomInt } from "node:crypto";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { sendOtpEmail, sendWelcomeEmail } from "./email";
import { saveOtp, verifyAndConsumeOtp } from "./otpStore";
import { COOKIE_NAME } from "@shared/const";

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
    sendOtp: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        try {
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
          firstName: z.string().min(1).max(120).optional(),
          memberNumber: z.string().min(1).max(64).optional(),
        })
      )
      .mutation(async ({ input }) => {
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

          if (input.firstName && input.memberNumber) {
            void sendWelcomeEmail(input.email, input.firstName, input.memberNumber).catch(
              (err) => console.error("[verifyOtp] Welcome email failed:", err)
            );
          }

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
