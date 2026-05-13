import Stripe from "stripe";

/**
 * Stripe Node SDK v22+ rejects an empty API key. For local dev without secrets,
 * a placeholder satisfies the constructor. `webhooks.constructEvent` does not
 * call the REST API; set STRIPE_SECRET_KEY in any environment that uses billing.
 */
const PLACEHOLDER =
  "sk_test_local_placeholder_webhook_constructEvent_only_not_for_api";

const secretKey = process.env.STRIPE_SECRET_KEY?.trim();

export const stripe = new Stripe(secretKey || PLACEHOLDER);

export function isStripeApiConfigured(): boolean {
  return Boolean(secretKey);
}

export function requireStripeApi(): Stripe {
  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to your environment for Stripe checkout and billing."
    );
  }
  return stripe;
}
