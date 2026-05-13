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
import { fetchMemberProfileForSession, activateSupabaseMemberAfterPaidCheckout } from "./memberProfileFromDb";
import { createCheckoutSession } from "./stripe/checkout";
import { requireStripeApi } from "./stripe/client";
import {
  getRequestClientIp,
  recordSendOtpAttempt,
} from "./sendOtpRateLimit";
import { saveOtp, verifyAndConsumeOtp } from "./otpStore";
import {
  hasWelcomeEmailBeenSent,
  markWelcomeEmailSent,
} from "./welcomeEmailOnce";
import { COOKIE_NAME, MEMBER_SESSION_COOKIE } from "@shared/const";
import {
  fetchMemberPaymentHistory,
  fetchMemberSubscriptionStatus,
  cancelMemberSubscription,
} from "./member.payments";
import { getMemberByUserId } from "./db";

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

    /**
     * Create a Stripe Checkout Session for membership purchase
     * Can be called from the pricing signup flow (public) or from an authenticated session
     */
    createCheckout: publicProcedure
      .input(
        z.object({
          paymentType: z.enum(["subscription", "one-time"]),
          successUrl: z.string().url(),
          cancelUrl: z.string().url(),
          // Optional: if provided, use this member ID directly (from pricing signup)
          memberId: z.number().optional(),
          memberEmail: z.string().email().optional(),
          memberName: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          let userId: number;
          let userEmail: string;
          let userName: string;

          // Try to use existing member session first
          const session = await readMemberSessionFromRequest(ctx.req);
          if (session) {
            const profile = await fetchMemberProfileForSession(
              session.memberId,
              session.email
            );
            if (!profile) {
              return {
                success: false,
                error: "Member profile not found.",
              };
            }
            userId = parseInt(session.memberId, 10);
            userEmail = session.email;
            userName = `${profile.firstName} ${profile.lastName}`.trim() || "Member";
          } else if (input.memberId && input.memberEmail) {
            // Fall back to provided member info (from pricing signup)
            userId = input.memberId;
            userEmail = input.memberEmail;
            userName = input.memberName || "Member";
          } else {
            return {
              success: false,
              error: "Authentication required. Please provide member information.",
            };
          }

          const checkoutSession = await createCheckoutSession({
            userId,
            userEmail,
            userName,
            paymentType: input.paymentType,
            successUrl: input.successUrl,
            cancelUrl: input.cancelUrl,
          });

          return {
            success: true,
            sessionId: checkoutSession.id,
            url: checkoutSession.url,
          };
        } catch (error) {
          console.error("[createCheckout] Error:", error);
          return {
            success: false,
            error: "Failed to create checkout session. Please try again.",
          };
        }
      }),

    /**
     * Create a member session after successful checkout
     * Verifies the Stripe checkout session was completed before creating session
     * Sets the member session cookie and returns member profile
     */
    createSessionAfterCheckout: publicProcedure
      .input(
        z.object({
          memberId: z.number(),
          email: z.string().email(),
          checkoutSessionId: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const memberId = String(input.memberId);
          const emailNorm = input.email.toLowerCase();

          console.log(
            `[createSessionAfterCheckout] memberId=${memberId}, email=${emailNorm}, sessionId=${input.checkoutSessionId}`,
          );

          let stripe;
          try {
            stripe = requireStripeApi();
          } catch {
            return {
              success: false,
              error: "Payment verification is unavailable.",
            };
          }

          let checkoutSession;
          try {
            checkoutSession = await stripe.checkout.sessions.retrieve(input.checkoutSessionId);
          } catch (stripeError) {
            console.error(`[createSessionAfterCheckout] Stripe API error:`, stripeError);
            return {
              success: false,
              error: "Failed to verify checkout session.",
            };
          }

          if (!checkoutSession) {
            console.error(`[createSessionAfterCheckout] Session not found: ${input.checkoutSessionId}`);
            return {
              success: false,
              error: "Checkout session not found.",
            };
          }

          console.log(
            `[createSessionAfterCheckout] Session payment_status=${checkoutSession.payment_status}, client_reference_id=${checkoutSession.client_reference_id}`,
          );

          if (checkoutSession.payment_status !== "paid") {
            console.warn(
              `[createSessionAfterCheckout] Payment not completed. Status: ${checkoutSession.payment_status}`,
            );
            return {
              success: false,
              error: "Payment not completed. Please try again.",
            };
          }

          if (checkoutSession.client_reference_id !== memberId) {
            console.error(
              `[createSessionAfterCheckout] Session mismatch: ${checkoutSession.client_reference_id} !== ${memberId}`,
            );
            return {
              success: false,
              error: "Session verification failed.",
            };
          }

          const existingProfile = await fetchMemberProfileForSession(memberId, emailNorm);
          if (!existingProfile) {
            console.error(
              `[createSessionAfterCheckout] Supabase member not found for id=${memberId} email=${emailNorm}`,
            );
            return {
              success: false,
              error: "Member not found.",
            };
          }

          const activatedAt = new Date();
          const expiresAt = new Date(activatedAt.getTime() + 365 * 24 * 60 * 60 * 1000);
          const activatedOk = await activateSupabaseMemberAfterPaidCheckout({
            memberId,
            activatedAtIso: activatedAt.toISOString(),
            expiresAtIso: expiresAt.toISOString(),
          });
          if (!activatedOk) {
            console.error("[createSessionAfterCheckout] Failed to update activated_at / expires_at on Supabase");
            return {
              success: false,
              error: "Could not activate membership. Please contact support.",
            };
          }

          const welcome = await fetchMemberWelcomeFields(memberId, emailNorm);
          if (welcome) {
            const alreadyFromDb = Boolean(welcome.welcomeEmailSentAt);
            const alreadyFromCache = alreadyFromDb
              ? false
              : await hasWelcomeEmailBeenSent(emailNorm);
            if (!alreadyFromDb && !alreadyFromCache) {
              const mailed = await sendWelcomeEmail(
                emailNorm,
                welcome.firstName,
                welcome.memberNumber,
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

          const profile = await fetchMemberProfileForSession(memberId, emailNorm);

          return {
            success: true,
            profile,
          };
        } catch (error) {
          console.error("[createSessionAfterCheckout] Error:", error);
          return {
            success: false,
            error: "Failed to create session. Please try again.",
          };
        }
      }),

    /**
     * Get payment history for the current member
     * Requires member session (logged in)
     */
    paymentHistory: publicProcedure.query(async ({ ctx }) => {
      try {
        const session = await readMemberSessionFromRequest(ctx.req);
        if (!session) {
          return {
            success: false,
            error: "Not authenticated",
            payments: [],
          };
        }

        const member = await getMemberByUserId(parseInt(session.memberId, 10));
        if (!member || !member.stripeCustomerId) {
          return {
            success: true,
            error: null,
            payments: [],
          };
        }

        const payments = await fetchMemberPaymentHistory(
          member.stripeCustomerId
        );

        return {
          success: true,
          error: null,
          payments,
        };
      } catch (error) {
        console.error("[paymentHistory] Error:", error);
        return {
          success: false,
          error: "Failed to fetch payment history",
          payments: [],
        };
      }
    }),

    /**
     * Get subscription status for the current member
     * Requires member session (logged in)
     */
    subscriptionStatus: publicProcedure.query(async ({ ctx }) => {
      try {
        const session = await readMemberSessionFromRequest(ctx.req);
        if (!session) {
          return {
            success: false,
            error: "Not authenticated",
            subscription: null,
          };
        }

        const member = await getMemberByUserId(parseInt(session.memberId, 10));
        if (!member) {
          return {
            success: false,
            error: "Member not found",
            subscription: null,
          };
        }

        const subscription = await fetchMemberSubscriptionStatus(
          member.stripeSubscriptionId,
          member.paymentType
        );

        return {
          success: true,
          error: null,
          subscription,
        };
      } catch (error) {
        console.error("[subscriptionStatus] Error:", error);
        return {
          success: false,
          error: "Failed to fetch subscription status",
          subscription: null,
        };
      }
    }),

    /**
     * Cancel subscription for the current member
     * Sets cancel_at_period_end so membership remains active until renewal
     * Requires member session (logged in)
     */
    cancelSubscription: publicProcedure.mutation(async ({ ctx }) => {
      try {
        const session = await readMemberSessionFromRequest(ctx.req);
        if (!session) {
          return {
            success: false,
            error: "Not authenticated",
          };
        }

        const member = await getMemberByUserId(parseInt(session.memberId, 10));
        if (!member || !member.stripeSubscriptionId) {
          return {
            success: false,
            error: "No active subscription found",
          };
        }

        const cancelled = await cancelMemberSubscription(
          member.stripeSubscriptionId
        );

        if (!cancelled) {
          return {
            success: false,
            error: "Failed to cancel subscription",
          };
        }

        return {
          success: true,
          error: null,
        };
      } catch (error) {
        console.error("[cancelSubscription] Error:", error);
        return {
          success: false,
          error: "Failed to cancel subscription",
        };
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
