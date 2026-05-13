/**
 * Member payment and subscription helpers
 * Fetches payment history and subscription status from Stripe
 */

import { isStripeApiConfigured, stripe } from "./stripe/client";

export interface PaymentHistory {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  invoiceUrl?: string;
}

export interface SubscriptionStatus {
  isActive: boolean;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  status: string;
  paymentType: "subscription" | "one-time";
}

/**
 * Fetch payment history for a member from Stripe
 * Returns list of charges/invoices associated with the customer
 */
export async function fetchMemberPaymentHistory(
  stripeCustomerId: string
): Promise<PaymentHistory[]> {
  if (!isStripeApiConfigured()) {
    return [];
  }
  try {
    const invoices = await stripe.invoices.list({
      customer: stripeCustomerId,
      limit: 12, // Last 12 invoices
    });

    return invoices.data
      .filter((inv) => inv.status === "paid" || inv.status === "open")
      .map((inv) => ({
        id: inv.id,
        date: new Date(inv.created * 1000).toISOString(),
        amount: inv.total || 0,
        currency: inv.currency?.toUpperCase() || "USD",
        status: inv.status || "unknown",
        description: inv.description || "Membership Payment",
        invoiceUrl: inv.hosted_invoice_url || undefined,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error("[fetchMemberPaymentHistory] Error:", error);
    return [];
  }
}

/**
 * Fetch subscription status for a member from Stripe
 * Returns current subscription details
 */
export async function fetchMemberSubscriptionStatus(
  stripeSubscriptionId: string | null | undefined,
  paymentType: "subscription" | "one-time"
): Promise<SubscriptionStatus> {
  // For one-time payments, no active subscription
  if (paymentType === "one-time" || !stripeSubscriptionId) {
    return {
      isActive: false,
      cancelAtPeriodEnd: false,
      status: "none",
      paymentType: "one-time",
    };
  }

  if (!isStripeApiConfigured()) {
    return {
      isActive: false,
      cancelAtPeriodEnd: false,
      status: "unconfigured",
      paymentType: "subscription",
    };
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(
      stripeSubscriptionId
    );

    const periodEnd = (subscription as any).current_period_end;
    return {
      isActive: subscription.status === "active",
      currentPeriodEnd:
        periodEnd &&
        new Date(periodEnd * 1000).toISOString(),
      cancelAtPeriodEnd: (subscription as any).cancel_at_period_end || false,
      status: subscription.status,
      paymentType: "subscription",
    };
  } catch (error) {
    console.error("[fetchMemberSubscriptionStatus] Error:", error);
    return {
      isActive: false,
      cancelAtPeriodEnd: false,
      status: "error",
      paymentType: "subscription",
    };
  }
}

/**
 * Cancel a member's subscription
 * Sets cancel_at_period_end so membership remains active until renewal date
 */
export async function cancelMemberSubscription(
  stripeSubscriptionId: string
): Promise<boolean> {
  if (!isStripeApiConfigured()) {
    return false;
  }
  try {
    await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
    return true;
  } catch (error) {
    console.error("[cancelMemberSubscription] Error:", error);
    return false;
  }
}
