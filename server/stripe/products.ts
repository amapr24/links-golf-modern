/**
 * Stripe Products Configuration
 * Defines membership products and prices for Links Golf
 */

export const STRIPE_PRODUCTS = {
  // Annual membership with auto-renewal (subscription)
  MEMBERSHIP_ANNUAL_SUBSCRIPTION: {
    name: "Links Golf Annual Membership (Auto-Renew)",
    description: "Annual membership with automatic renewal. Access to 15 partner courses with up to 25% discount.",
    priceInCents: 19900, // $199.00
    interval: "year" as const,
    type: "subscription" as const,
  },

  // Annual membership one-time payment (manual renewal)
  MEMBERSHIP_ANNUAL_ONETIME: {
    name: "Links Golf Annual Membership (One-Time)",
    description: "Annual membership with manual renewal. Access to 15 partner courses with up to 25% discount.",
    priceInCents: 19900, // $199.00
    interval: "year" as const,
    type: "one-time" as const,
  },
};

/**
 * Get product metadata for Stripe API calls
 */
export function getProductMetadata(type: "subscription" | "one-time") {
  const product = type === "subscription" ? STRIPE_PRODUCTS.MEMBERSHIP_ANNUAL_SUBSCRIPTION : STRIPE_PRODUCTS.MEMBERSHIP_ANNUAL_ONETIME;
  
  return {
    name: product.name,
    description: product.description,
    metadata: {
      type,
      interval: product.interval,
    },
  };
}

/**
 * Get price in dollars for display
 */
export function getPriceInDollars(type: "subscription" | "one-time") {
  const product = type === "subscription" ? STRIPE_PRODUCTS.MEMBERSHIP_ANNUAL_SUBSCRIPTION : STRIPE_PRODUCTS.MEMBERSHIP_ANNUAL_ONETIME;
  return (product.priceInCents / 100).toFixed(2);
}
