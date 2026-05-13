import { Router, Request, Response, raw } from "express";
import Stripe from "stripe";
import { handleStripeWebhook } from "./webhook";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export function registerStripeRoutes(app: any) {
  const router = Router();

  /**
   * Stripe webhook endpoint
   * CRITICAL: Must use raw body parser for signature verification
   * Register BEFORE express.json() in the main app
   */
  router.post(
    "/webhook",
    raw({ type: "application/json" }),
    async (req: Request, res: Response) => {
      const signature = req.headers["stripe-signature"] as string;

      if (!signature) {
        console.error("[Stripe Webhook] Missing signature header");
        return res.status(400).json({ error: "Missing signature" });
      }

      if (!webhookSecret) {
        console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured");
        return res.status(500).json({ error: "Webhook secret not configured" });
      }

      try {
        const event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          webhookSecret
        );

        console.log(`[Stripe Webhook] Received event: ${event.type}`);

        const result = await handleStripeWebhook(event);

        return res.json(result);
      } catch (error) {
        if (error instanceof Error) {
          console.error(`[Stripe Webhook] Error: ${error.message}`);
          return res.status(400).json({ error: error.message });
        }
        console.error("[Stripe Webhook] Unknown error:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
    }
  );

  app.use("/api/stripe", router);
}
