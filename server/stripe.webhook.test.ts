import { describe, it, expect, vi, beforeEach } from "vitest";
import Stripe from "stripe";
import { handleStripeWebhook } from "./stripe/webhook";

// Mock database functions
vi.mock("./db", () => ({
  getMemberByStripeCustomerId: vi.fn(),
  getMemberByUserId: vi.fn(),
  upsertMember: vi.fn(),
}));

import { getMemberByStripeCustomerId, getMemberByUserId, upsertMember } from "./db";

describe("Stripe Webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("handleStripeWebhook", () => {
    it("should handle test events without processing", async () => {
      const testEvent: Stripe.Event = {
        id: "evt_test_12345",
        object: "event",
        api_version: "2024-01-01",
        created: Math.floor(Date.now() / 1000),
        data: { object: {} },
        livemode: false,
        pending_webhooks: 0,
        request: { id: null, idempotency_key: null },
        type: "checkout.session.completed",
      };

      const result = await handleStripeWebhook(testEvent);
      expect(result).toEqual({ verified: true });
    });

    it("should handle checkout.session.completed event", async () => {
      const session: Stripe.Checkout.Session = {
        id: "cs_test_123",
        object: "checkout.session",
        after_expiration: null,
        allow_promotion_codes: true,
        amount_subtotal: 19900,
        amount_total: 19900,
        automatic_tax: { enabled: false, status: null },
        billing_address_collection: null,
        cancel_url: "https://example.com/cancel",
        client_reference_id: "1",
        consent: null,
        consent_collection: null,
        currency: "usd",
        customer: "cus_test_123",
        customer_creation: "if_required",
        customer_email: "test@example.com",
        expires_at: Math.floor(Date.now() / 1000) + 86400,
        livemode: false,
        locale: null,
        metadata: { payment_type: "one-time" },
        mode: "payment",
        payment_intent: "pi_test_123",
        payment_link: null,
        payment_method_collection: "if_required",
        payment_status: "paid",
        phone_number_collection: { enabled: false },
        recovered_from: null,
        setup_intent: null,
        status: "complete",
        submit_type: null,
        subscription: "sub_test_123",
        success_url: "https://example.com/success",
        total_details: { amount_discount: 0, amount_shipping: 0, amount_tax: 0 },
        url: null,
        created: Math.floor(Date.now() / 1000),
      };

      const event: Stripe.Event = {
        id: "evt_real_123",
        object: "event",
        api_version: "2024-01-01",
        created: Math.floor(Date.now() / 1000),
        data: { object: session },
        livemode: false,
        pending_webhooks: 0,
        request: { id: null, idempotency_key: null },
        type: "checkout.session.completed",
      };

      const result = await handleStripeWebhook(event);

      expect(upsertMember).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          stripeCustomerId: "cus_test_123",
          stripeSubscriptionId: "sub_test_123",
          stripePaymentIntentId: "pi_test_123",
          paymentType: "one-time",
          isActive: true,
          isCanceled: false,
        })
      );

      expect(result).toEqual({ received: true });
    });

    it("should skip MySQL upsert when client_reference_id is a Supabase UUID", async () => {
      const session: Stripe.Checkout.Session = {
        id: "cs_test_uuid",
        object: "checkout.session",
        after_expiration: null,
        allow_promotion_codes: true,
        amount_subtotal: 19900,
        amount_total: 19900,
        automatic_tax: { enabled: false, status: null },
        billing_address_collection: null,
        cancel_url: "https://example.com/cancel",
        client_reference_id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        consent: null,
        consent_collection: null,
        currency: "usd",
        customer: "cus_test_uuid",
        customer_creation: "if_required",
        customer_email: "test@example.com",
        expires_at: Math.floor(Date.now() / 1000) + 86400,
        livemode: false,
        locale: null,
        metadata: { payment_type: "one-time", user_id: "f47ac10b-58cc-4372-a567-0e02b2c3d479" },
        mode: "payment",
        payment_intent: "pi_test_uuid",
        payment_link: null,
        payment_method_collection: "if_required",
        payment_status: "paid",
        phone_number_collection: { enabled: false },
        recovered_from: null,
        setup_intent: null,
        status: "complete",
        submit_type: null,
        subscription: null,
        success_url: "https://example.com/success",
        total_details: { amount_discount: 0, amount_shipping: 0, amount_tax: 0 },
        url: null,
        created: Math.floor(Date.now() / 1000),
      };

      const event: Stripe.Event = {
        id: "evt_uuid_checkout",
        object: "event",
        api_version: "2024-01-01",
        created: Math.floor(Date.now() / 1000),
        data: { object: session },
        livemode: false,
        pending_webhooks: 0,
        request: { id: null, idempotency_key: null },
        type: "checkout.session.completed",
      };

      const result = await handleStripeWebhook(event);
      expect(upsertMember).not.toHaveBeenCalled();
      expect(result).toEqual({ received: true });
    });

    it("should handle customer.subscription.updated event", async () => {
      const subscription: Stripe.Subscription = {
        id: "sub_updated_123",
        object: "subscription",
        application: null,
        application_fee_percent: null,
        automatic_tax: { enabled: false },
        billing_cycle_anchor: Math.floor(Date.now() / 1000),
        billing_thresholds: null,
        cancel_at: null,
        cancel_at_period_end: false,
        canceled_at: null,
        collection_method: "charge_automatically",
        created: Math.floor(Date.now() / 1000),
        currency: "usd",
        current_period_end: Math.floor(Date.now() / 1000) + 2592000,
        current_period_start: Math.floor(Date.now() / 1000),
        customer: "cus_test_123",
        days_until_due: null,
        default_payment_method: null,
        default_source: null,
        default_tax_rates: [],
        description: null,
        discount: null,
        ended_at: null,
        items: {
          object: "list",
          data: [],
          has_more: false,
          total_count: 0,
          url: "/v1/subscription_items",
        },
        latest_invoice: null,
        livemode: false,
        metadata: {},
        next_pending_invoice_item_invoice: null,
        on_behalf_of: null,
        pause_collection: null,
        payment_settings: {
          payment_method_options: null,
          save_default_payment_method: "off",
        },
        pending_invoice_item_interval: null,
        pending_setup_intent: null,
        pending_update: null,
        schedule: null,
        start_date: Math.floor(Date.now() / 1000),
        status: "active",
        test_clock: null,
        transfer_data: null,
        trial_end: null,
        trial_settings: null,
        trial_start: null,
        url: "/v1/subscriptions/sub_updated_123",
      };

      const mockMember = {
        id: 1,
        userId: 1,
        stripeCustomerId: "cus_test_123",
        stripeSubscriptionId: "sub_test_123",
        stripePaymentIntentId: "pi_test_123",
        paymentType: "subscription" as const,
        activatedAt: new Date(),
        expiresAt: new Date(),
        isActive: true,
        isCanceled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(getMemberByStripeCustomerId).mockResolvedValue(mockMember);

      const event: Stripe.Event = {
        id: "evt_real_456",
        object: "event",
        api_version: "2024-01-01",
        created: Math.floor(Date.now() / 1000),
        data: { object: subscription },
        livemode: false,
        pending_webhooks: 0,
        request: { id: null, idempotency_key: null },
        type: "customer.subscription.updated",
      };

      const result = await handleStripeWebhook(event);

      expect(getMemberByStripeCustomerId).toHaveBeenCalledWith("cus_test_123");
      expect(upsertMember).toHaveBeenCalledWith(
        expect.objectContaining({
          stripeSubscriptionId: "sub_updated_123",
        })
      );

      expect(result).toEqual({ received: true });
    });

    it("should handle customer.subscription.deleted event", async () => {
      const subscription: Stripe.Subscription = {
        id: "sub_deleted_123",
        object: "subscription",
        application: null,
        application_fee_percent: null,
        automatic_tax: { enabled: false },
        billing_cycle_anchor: Math.floor(Date.now() / 1000),
        billing_thresholds: null,
        cancel_at: null,
        cancel_at_period_end: false,
        canceled_at: Math.floor(Date.now() / 1000),
        collection_method: "charge_automatically",
        created: Math.floor(Date.now() / 1000),
        currency: "usd",
        current_period_end: Math.floor(Date.now() / 1000) + 2592000,
        current_period_start: Math.floor(Date.now() / 1000),
        customer: "cus_test_123",
        days_until_due: null,
        default_payment_method: null,
        default_source: null,
        default_tax_rates: [],
        description: null,
        discount: null,
        ended_at: Math.floor(Date.now() / 1000),
        items: {
          object: "list",
          data: [],
          has_more: false,
          total_count: 0,
          url: "/v1/subscription_items",
        },
        latest_invoice: null,
        livemode: false,
        metadata: {},
        next_pending_invoice_item_invoice: null,
        on_behalf_of: null,
        pause_collection: null,
        payment_settings: {
          payment_method_options: null,
          save_default_payment_method: "off",
        },
        pending_invoice_item_interval: null,
        pending_setup_intent: null,
        pending_update: null,
        schedule: null,
        start_date: Math.floor(Date.now() / 1000),
        status: "canceled",
        test_clock: null,
        transfer_data: null,
        trial_end: null,
        trial_settings: null,
        trial_start: null,
        url: "/v1/subscriptions/sub_deleted_123",
      };

      const mockMember = {
        id: 1,
        userId: 1,
        stripeCustomerId: "cus_test_123",
        stripeSubscriptionId: "sub_deleted_123",
        stripePaymentIntentId: "pi_test_123",
        paymentType: "subscription" as const,
        activatedAt: new Date(),
        expiresAt: new Date(),
        isActive: true,
        isCanceled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(getMemberByStripeCustomerId).mockResolvedValue(mockMember);

      const event: Stripe.Event = {
        id: "evt_real_789",
        object: "event",
        api_version: "2024-01-01",
        created: Math.floor(Date.now() / 1000),
        data: { object: subscription },
        livemode: false,
        pending_webhooks: 0,
        request: { id: null, idempotency_key: null },
        type: "customer.subscription.deleted",
      };

      const result = await handleStripeWebhook(event);

      expect(upsertMember).toHaveBeenCalledWith(
        expect.objectContaining({
          isCanceled: true,
          isActive: false,
        })
      );

      expect(result).toEqual({ received: true });
    });

    it("should handle invoice.paid event and renew membership", async () => {
      const invoice: Stripe.Invoice = {
        id: "in_test_123",
        object: "invoice",
        account_country: "US",
        account_name: null,
        account_tax_ids: null,
        amount_due: 19900,
        amount_paid: 19900,
        amount_remaining: 0,
        application: null,
        application_fee_amount: null,
        attempt_count: 1,
        attempted: true,
        auto_advance: true,
        automatic_tax: { enabled: false, status: null },
        billing_reason: "subscription_cycle",
        charge: "ch_test_123",
        collection_method: "charge_automatically",
        created: Math.floor(Date.now() / 1000),
        currency: "usd",
        custom_fields: null,
        customer: "cus_test_123",
        customer_address: null,
        customer_email: "test@example.com",
        customer_name: null,
        customer_phone: null,
        customer_shipping: null,
        customer_tax_exempt: "none",
        customer_tax_ids: [],
        default_payment_method: null,
        default_source: null,
        default_tax_rates: [],
        description: null,
        discount: null,
        discounts: [],
        due_date: null,
        ending_balance: 0,
        footer: null,
        from_invoice: null,
        hosted_invoice_url: "https://invoice.stripe.com/test",
        invoice_pdf: "https://invoice.stripe.com/pdf/test",
        last_finalization_error: null,
        latest_revision: null,
        lines: {
          object: "list",
          data: [],
          has_more: false,
          total_count: 0,
          url: "/v1/invoices/in_test_123/lines",
        },
        livemode: false,
        metadata: {},
        next_payment_attempt: null,
        number: "INV-0001",
        on_behalf_of: null,
        paid: true,
        paid_out_of_band: false,
        payment_intent: "pi_test_123",
        payment_settings: {
          custom_fields: null,
          default_mandate: null,
          payment_method_options: null,
          payment_method_types: null,
          save_default_payment_method: "off",
        },
        period_end: Math.floor(Date.now() / 1000),
        period_start: Math.floor(Date.now() / 1000) - 2592000,
        post_payment_actions: null,
        pre_payment_actions: null,
        quote: null,
        receipt_number: null,
        rendering: { amount_due_format: "amount_due", custom_fields_format: "summary", line_items_format: "lines", pdf: null },
        rendering_options: null,
        revision_number: 0,
        scheduled_polling_retry_count: null,
        source_invoice: null,
        starting_balance: 0,
        statement_descriptor: null,
        status: "paid",
        status_transitions: {
          finalized_at: Math.floor(Date.now() / 1000),
          marked_uncollectible_at: null,
          paid_at: Math.floor(Date.now() / 1000),
          voided_at: null,
        },
        subscription: "sub_test_123",
        subtotal: 19900,
        subtotal_excluding_tax: 19900,
        tax: null,
        test_clock: null,
        total: 19900,
        total_discount_amounts: [],
        total_excluding_tax: 19900,
        total_tax_amounts: [],
        transfer_data: null,
        url: null,
        user_supplied_metadata: null,
      };

      const mockMember = {
        id: 1,
        userId: 1,
        stripeCustomerId: "cus_test_123",
        stripeSubscriptionId: "sub_test_123",
        stripePaymentIntentId: "pi_test_123",
        paymentType: "subscription" as const,
        activatedAt: new Date(),
        expiresAt: new Date(Date.now() - 86400000), // expired
        isActive: false,
        isCanceled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(getMemberByStripeCustomerId).mockResolvedValue(mockMember);

      const event: Stripe.Event = {
        id: "evt_real_999",
        object: "event",
        api_version: "2024-01-01",
        created: Math.floor(Date.now() / 1000),
        data: { object: invoice },
        livemode: false,
        pending_webhooks: 0,
        request: { id: null, idempotency_key: null },
        type: "invoice.paid",
      };

      const result = await handleStripeWebhook(event);

      expect(upsertMember).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: true,
        })
      );

      // Verify expiration is set to 1 year from now
      const callArgs = vi.mocked(upsertMember).mock.calls[0][0];
      expect(callArgs.expiresAt).toBeDefined();
      const expiresDate = new Date(callArgs.expiresAt as any);
      const expectedDate = new Date();
      expectedDate.setFullYear(expectedDate.getFullYear() + 1);
      // Allow 1 second tolerance
      expect(Math.abs(expiresDate.getTime() - expectedDate.getTime())).toBeLessThan(1000);

      expect(result).toEqual({ received: true });
    });
  });
});
