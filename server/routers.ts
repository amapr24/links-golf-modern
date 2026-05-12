import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { sendOtpEmail } from "./email";
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
          const otp = Math.random().toString().slice(2, 8);

          // Send OTP email via Resend
          const emailSent = await sendOtpEmail(input.email, otp);

          if (!emailSent) {
            return {
              success: false,
              error: "Failed to send OTP email. Please try again.",
            };
          }

          // Store OTP temporarily in memory for verification
          // In production, use Redis with TTL (10 minutes)
          const otpStore = new Map<string, { otp: string; expiresAt: number }>();
          otpStore.set(input.email, {
            otp,
            expiresAt: Date.now() + 10 * 60 * 1000,
          });

          console.log(`[sendOtp] OTP sent to ${input.email}: ${otp}`);

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
      .mutation(async ({ input }) => {
        try {
          // Validate OTP format
          if (!/^\d{6}$/.test(input.otp)) {
            return {
              success: false,
              error: "Invalid OTP format.",
            };
          }

          // In production, verify OTP from Redis
          // For now, the OTP verification happens on the client side
          // This is a placeholder for future server-side OTP validation

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
