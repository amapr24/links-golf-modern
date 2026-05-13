/**
 * PaymentHistory — Display member's payment and transaction history
 * Shows invoices, charges, and subscription status
 */

import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Calendar, DollarSign, Download, AlertCircle } from "lucide-react";

export function PaymentHistory() {
  const { t } = useLanguage();
  const { data: paymentData, isPending: paymentPending } =
    trpc.member.paymentHistory.useQuery();
  const { data: subscriptionData, isPending: subscriptionPending } =
    trpc.member.subscriptionStatus.useQuery();

  const payments = (paymentData?.payments || []) as any[];
  const subscription = subscriptionData?.subscription as any;
  const loading = paymentPending || subscriptionPending;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subscription Status */}
      {subscription && (
        <div
          className="rounded-lg p-6"
          style={{
            background: subscription.isActive
              ? "oklch(0.42 0.14 145 / 0.08)"
              : "oklch(0.88 0.02 85)",
            border: `1px solid ${
              subscription.isActive
                ? "oklch(0.42 0.14 145 / 0.25)"
                : "oklch(0.88 0.02 85)"
            }`,
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: subscription.isActive
                  ? "oklch(0.42 0.14 145 / 0.2)"
                  : "oklch(0.88 0.02 85)",
              }}
            >
              <Calendar
                size={20}
                style={{
                  color: subscription.isActive
                    ? "oklch(0.42 0.14 145)"
                    : "oklch(0.55 0.06 145)",
                }}
              />
            </div>
            <div className="flex-1">
              <h3
                className="font-semibold text-sm mb-1"
                style={{ color: "oklch(0.13 0.05 145)" }}
              >
                {t("dashboard.subscriptionStatus")}
              </h3>
              <div
                className="text-xs space-y-1"
                style={{ color: "oklch(0.55 0.06 145)" }}
              >
                <p>
                  {subscription.isActive
                    ? t("dashboard.subscriptionActive")
                    : t("dashboard.subscriptionInactive")}
                </p>
                {subscription.currentPeriodEnd && (
                  <p>
                    {t("dashboard.renewsOn")}:{" "}
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
                {subscription.cancelAtPeriodEnd && (
                  <p style={{ color: "oklch(0.65 0.14 145)" }}>
                    {t("dashboard.subscriptionCancelPending")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment History */}
      <div>
        <h3
          className="font-semibold text-sm mb-4"
          style={{ color: "oklch(0.13 0.05 145)" }}
        >
          {t("dashboard.paymentHistory")}
        </h3>

        {payments.length === 0 ? (
          <div
            className="rounded-lg p-6 text-center"
            style={{
              background: "oklch(0.96 0.01 85)",
              border: "1px solid oklch(0.88 0.02 85)",
            }}
          >
            <DollarSign
              size={32}
              className="mx-auto mb-2"
              style={{ color: "oklch(0.65 0.04 145)" }}
            />
            <p
              className="text-sm"
              style={{ color: "oklch(0.55 0.06 145)" }}
            >
              {t("dashboard.noPayments")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment: any) => (
              <div
                key={payment.id}
                className="rounded-lg p-4 flex items-center justify-between"
                style={{
                  background: "white",
                  border: "1px solid oklch(0.88 0.02 85)",
                }}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "oklch(0.42 0.14 145 / 0.1)" }}
                  >
                    <DollarSign
                      size={18}
                      style={{ color: "oklch(0.42 0.14 145)" }}
                    />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-sm font-medium"
                      style={{ color: "oklch(0.13 0.05 145)" }}
                    >
                      {payment.description}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "oklch(0.55 0.06 145)" }}
                    >
                      {new Date(payment.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "oklch(0.13 0.05 145)" }}
                    >
                      {(payment.amount / 100).toFixed(2)} {payment.currency}
                    </p>
                    <p
                      className="text-xs"
                      style={{
                        color:
                          payment.status === "paid"
                            ? "oklch(0.42 0.14 145)"
                            : "oklch(0.65 0.04 145)",
                      }}
                    >
                      {payment.status === "paid"
                        ? t("dashboard.paid")
                        : payment.status}
                    </p>
                  </div>
                  {payment.invoiceUrl && (
                    <a
                      href={payment.invoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-md transition-all"
                      style={{
                        background: "oklch(0.42 0.14 145 / 0.1)",
                        color: "oklch(0.42 0.14 145)",
                      }}
                      title={t("dashboard.downloadInvoice")}
                    >
                      <Download size={16} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
