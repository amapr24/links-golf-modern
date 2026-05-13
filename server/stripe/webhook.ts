import Stripe from "stripe";
import { getMemberByStripeCustomerId, getMemberByUserId, upsertMember } from "../db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

/**
 * Process Stripe webhook events
 * Handles checkout.session.completed, customer.subscription.updated, etc.
 */
export async function handleStripeWebhook(event: Stripe.Event) {
  console.log(`[Stripe Webhook] Processing event: ${event.type} (${event.id})`);

  // Test event detection (for testing webhooks)
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return { verified: true };
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutSessionCompleted(session);
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdated(subscription);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeleted(subscription);
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      await handleInvoicePaid(invoice);
      break;
    }

    default:
      console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
  }

  return { received: true };
}

/**
 * Handle checkout.session.completed event
 * Called when a customer completes checkout (payment or subscription started)
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = parseInt(session.client_reference_id || "", 10);
  const paymentType = (session.metadata?.payment_type as "subscription" | "one-time") || "one-time";

  if (!userId) {
    console.error("[Webhook] Missing userId in session metadata");
    return;
  }

  // Calculate membership expiration (1 year from now)
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  try {
    // Upsert member record
    await upsertMember({
      userId,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
      stripePaymentIntentId: session.payment_intent as string,
      paymentType,
      activatedAt: new Date(),
      expiresAt,
      isActive: true,
      isCanceled: false,
    });

    console.log(`[Webhook] Created/updated member ${userId}`);
  } catch (error) {
    console.error(`[Webhook] Error handling checkout.session.completed:`, error);
    throw error;
  }
}

/**
 * Handle customer.subscription.updated event
 * Called when subscription details change (e.g., renewal, cancellation scheduled)
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  try {
    const member = await getMemberByStripeCustomerId(customerId);

    if (!member) {
      console.warn(`[Webhook] Member not found for customer ${customerId}`);
      return;
    }

    // Update subscription ID if changed
    if (subscription.id !== member.stripeSubscriptionId) {
      await upsertMember({
        ...member,
        stripeSubscriptionId: subscription.id,
      });
    }

    console.log(`[Webhook] Updated subscription for member ${member.userId}`);
  } catch (error) {
    console.error(`[Webhook] Error handling customer.subscription.updated:`, error);
    throw error;
  }
}

/**
 * Handle customer.subscription.deleted event
 * Called when subscription is canceled
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  try {
    const member = await getMemberByStripeCustomerId(customerId);

    if (!member) {
      console.warn(`[Webhook] Member not found for customer ${customerId}`);
      return;
    }

    // Mark as canceled but keep record for history
    await upsertMember({
      ...member,
      isCanceled: true,
      isActive: false,
    });

    console.log(`[Webhook] Canceled subscription for member ${member.userId}`);
  } catch (error) {
    console.error(`[Webhook] Error handling customer.subscription.deleted:`, error);
    throw error;
  }
}

/**
 * Handle invoice.paid event
 * Called when an invoice is paid (subscription renewal, one-time payment)
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  try {
    const member = await getMemberByStripeCustomerId(customerId);

    if (!member) {
      console.warn(`[Webhook] Member not found for customer ${customerId}`);
      return;
    }

    // Calculate new expiration date (1 year from now)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    // Update membership expiration
    await upsertMember({
      ...member,
      expiresAt,
      isActive: true,
    });

    console.log(`[Webhook] Renewed membership for member ${member.userId}, expires ${expiresAt.toISOString()}`);
  } catch (error) {
    console.error(`[Webhook] Error handling invoice.paid:`, error);
    throw error;
  }
}
