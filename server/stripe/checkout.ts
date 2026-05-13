import { requireStripeApi } from "./client";
import { STRIPE_PRODUCTS } from "./products";

/**
 * Create a Stripe Checkout Session for membership purchase
 * Supports both subscription (auto-renew) and one-time payment options
 */
export async function createCheckoutSession(options: {
  userId: number;
  userEmail: string;
  userName: string;
  paymentType: "subscription" | "one-time";
  successUrl: string;
  cancelUrl: string;
}) {
  const stripe = requireStripeApi();
  const { userId, userEmail, userName, paymentType, successUrl, cancelUrl } = options;

  const product = paymentType === "subscription" 
    ? STRIPE_PRODUCTS.MEMBERSHIP_ANNUAL_SUBSCRIPTION 
    : STRIPE_PRODUCTS.MEMBERSHIP_ANNUAL_ONETIME;

  const lineItems: any[] = [
    {
      price_data: {
        currency: "usd",
        product_data: {
          name: product.name,
          description: product.description,
          metadata: {
            type: paymentType,
          },
        },
        unit_amount: product.priceInCents,
        recurring: paymentType === "subscription" 
          ? {
              interval: "year" as const,
              interval_count: 1,
            }
          : undefined,
      },
      quantity: 1,
    },
  ];

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: paymentType === "subscription" ? "subscription" : "payment",
    customer_email: userEmail,
    client_reference_id: userId.toString(),
    metadata: {
      user_id: userId.toString(),
      customer_email: userEmail,
      customer_name: userName,
      payment_type: paymentType,
    },
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
  });

  return session;
}

/**
 * Retrieve checkout session details
 */
export async function getCheckoutSession(sessionId: string) {
  const stripe = requireStripeApi();
  return stripe.checkout.sessions.retrieve(sessionId);
}
