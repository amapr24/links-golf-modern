/*
 * PricingSection — Links Golf Membership
 * Design: Dark full-width panel, centered conversion card
 * Multi-step form: Player Details → Stripe Checkout → Digital ID
 */

import { useState, useRef, useEffect } from "react";
import { Check, ArrowRight, Camera, ChevronLeft, Wallet, Smartphone, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  activateMembership,
  isSupabaseConfigured,
  saveMemberSignup,
  uploadMemberPhoto,
  updateMemberPhotoUrl,
} from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";
import { DigitalMemberCard } from "@/components/DigitalMemberCard";
import {
  MEMBER_CARD_AERIAL_IMAGE,
  formatMemberNumberFromId,
  formatCardExpiryMonthYear,
  formatCardSeasonLabel,
} from "@/lib/memberCardDisplay";

const AERIAL_IMAGE = MEMBER_CARD_AERIAL_IMAGE;

const getFeatures = (t: any) => [
  t("pricing.features.courses"),
  t("pricing.features.savings"),
  t("pricing.features.wallet"),
  t("pricing.features.verified"),
  t("pricing.features.reissue"),
  t("pricing.features.noBlackout"),
];

type Step = 1 | 2 | 3;

export default function PricingSection() {
  const { t } = useLanguage();
  const features = getFeatures(t);
  const createCheckoutMutation = trpc.member.createCheckout.useMutation();
  const [step, setStep] = useState<Step>(1);
  const [postPhotoName, setPostPhotoName] = useState("");
  const [postPhotoFile, setPostPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [photoSaved, setPhotoSaved] = useState(false);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [memberId, setMemberId] = useState<string | null>(null);
  const [residencyConfirmed, setResidencyConfirmed] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [agreedRefundPolicy, setAgreedRefundPolicy] = useState(false);
  const [signupFirstName, setSignupFirstName] = useState("");
  const [signupLastName, setSignupLastName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [activationInfo, setActivationInfo] = useState<{
    activatedAt: string;
    expiresAt: string;
  } | null>(null);
  const postPhotoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setActivationInfo(null);
  }, [memberId]);

  useEffect(() => {
    if (step !== 3) return;
    setPostPhotoName("");
    setPostPhotoFile(null);
    setPhotoPreviewUrl(null);
    setPhotoSaved(false);
    setError("");
  }, [step]);

  useEffect(() => {
    if (step !== 3 || !memberId || !isSupabaseConfigured) return;
    const now = new Date();
    const expiresDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    activateMembership({
      memberId,
      activatedAt: now.toISOString(),
      expiresAt: expiresDate.toISOString(),
    })
      .then((row: { activated_at?: string; expires_at?: string } | undefined) => {
        setActivationInfo({
          activatedAt: row?.activated_at ?? now.toISOString(),
          expiresAt: row?.expires_at ?? expiresDate.toISOString(),
        });
      })
      .catch((err) => {
        console.error("Failed to activate membership:", err);
      });
  }, [step, memberId]);

  const handleSavePhoto = async () => {
    setError("");
    const prevPreview = photoPreviewUrl;
    if (!postPhotoFile || !memberId || !signupEmail) {
      setError(t("pricing.choosePhoto"));
      return;
    }
    if (!isSupabaseConfigured) {
      setError(
        "Photo upload is unavailable in this environment (Supabase env vars are not set).",
      );
      return;
    }
    setIsSavingPhoto(true);
    try {
      const url = await uploadMemberPhoto(postPhotoFile, signupEmail);
      if (!url) throw new Error("No photo URL returned");
      await updateMemberPhotoUrl(memberId, url);
      if (prevPreview?.startsWith("blob:")) URL.revokeObjectURL(prevPreview);
      setPhotoPreviewUrl(url);
      setPhotoSaved(true);
    } catch (err) {
      console.error("Error saving photo:", err);
      setError(t("pricing.savePhotoError"));
    } finally {
      setIsSavingPhoto(false);
    }
  };

  const handleContinueToPayment = async () => {
    setError("");
    if (!isSupabaseConfigured) {
      setError(
        "Sign-up is unavailable in this environment (Supabase env vars are not set).",
      );
      return;
    }
    setIsSubmitting(true);

    try {
      const firstName = (document.getElementById("inp-firstname") as HTMLInputElement)?.value;
      const lastName = (document.getElementById("inp-lastname") as HTMLInputElement)?.value;
      const email = (document.getElementById("inp-email") as HTMLInputElement)?.value;
      const phone = (document.getElementById("inp-phone") as HTMLInputElement)?.value;
      const address = (document.getElementById("inp-address") as HTMLInputElement)?.value;

      if (!firstName || !lastName || !email || !phone) {
        setError("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }

      if (!residencyConfirmed || !agreedTerms || !agreedPrivacy || !agreedRefundPolicy) {
        setError(t("pricing.mustAcceptLegal"));
        setIsSubmitting(false);
        return;
      }

      setSignupFirstName(firstName);
      setSignupLastName(lastName);
      setSignupEmail(email);

      const member = await saveMemberSignup({
        firstName,
        lastName,
        email,
        phone,
        address: address || "",
      });

      if (member?.id) {
        setMemberId(String(member.id));
      }

      setStep(2);
    } catch (err) {
      console.error("Error saving member:", err);
      setError("Failed to save your information. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartCheckout = async (paymentType: "subscription" | "one-time") => {
    setError("");
    setIsSubmitting(true);

    try {
      if (!memberId || !signupEmail) {
        setError("Please complete your profile before proceeding to checkout.");
        setIsSubmitting(false);
        return;
      }

      const origin = window.location.origin;
      const cancelUrl = `${origin}/pricing`;
      const memberIdNum = parseInt(memberId, 10);
      // Stripe substitutes {CHECKOUT_SESSION_ID} on redirect. Without it, /success cannot
      // verify payment or call createSessionAfterCheckout. sessionStorage is not visible
      // in a separate checkout tab opened via window.open.
      const successUrlForStripe = `${origin}/success?sessionId={CHECKOUT_SESSION_ID}&memberId=${memberIdNum}&email=${encodeURIComponent(signupEmail)}`;

      const result = await createCheckoutMutation.mutateAsync({
        paymentType,
        successUrl: successUrlForStripe,
        cancelUrl,
        memberId: memberIdNum,
        memberEmail: signupEmail,
        memberName: `${signupFirstName} ${signupLastName}`.trim(),
      });

      if (!result.success || !result.url) {
        setError(result.error || "Failed to create checkout session");
        setIsSubmitting(false);
        return;
      }

      // Store in sessionStorage as fallback
      sessionStorage.setItem("checkout_session_id", result.sessionId || "");
      sessionStorage.setItem("checkout_member_id", memberIdNum.toString());
      sessionStorage.setItem("checkout_member_email", signupEmail);

      toast.info("Redirecting to checkout...");
      // Open Stripe checkout in a new window
      if (result.url) {
        window.open(result.url, "_blank");
      }
      setIsSubmitting(false);
    } catch (err) {
      console.error("Error starting checkout:", err);
      setError("Failed to start checkout. Please try again.");
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 text-sm rounded-sm border outline-none transition-all duration-200 focus:border-[oklch(0.42_0.14_145)] focus:ring-2 focus:ring-[oklch(0.42_0.14_145_/_0.15)]";
  const inputStyle = {
    fontFamily: "'Outfit', sans-serif",
    background: "white",
    borderColor: "oklch(0.88 0.02 85)",
    color: "oklch(0.13 0.05 145)",
  };
  const labelStyle = {
    fontFamily: "'Outfit', sans-serif",
    fontSize: "0.7rem",
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    color: "oklch(0.45 0.06 145)",
    display: "block",
    marginBottom: "0.4rem",
  };

  const pricingBackgroundStyle = {
    backgroundImage: `url(${AERIAL_IMAGE})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
  };

  const memberCardName = `${signupFirstName} ${signupLastName}`.trim() || "—";
  const memberNoDisplay = memberId ? formatMemberNumberFromId(memberId) : "—";
  const validUntilDisplay =
    activationInfo ? formatCardExpiryMonthYear(activationInfo.expiresAt) : "—";
  const seasonDisplay =
    activationInfo ? formatCardSeasonLabel(activationInfo.activatedAt) : "—";

  return (
    <section
      id="pricing"
      className="relative"
      style={pricingBackgroundStyle}
    >
      {/* Light overlay - reveals image clearly */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.1) 100%)",
        }}
      />
      {/* Subtle texture overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.3) 40px, rgba(255,255,255,0.3) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.3) 40px, rgba(255,255,255,0.3) 41px)",
        }}
      />

      <div className="container relative z-10 py-20 md:py-28">
        <div className="text-center mb-14">
          <p className="section-label mb-4 text-white/40">04 · Join Now</p>
          <h2
            className="text-white fade-up"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2.2rem, 5vw, 3.2rem)",
              fontWeight: 600,
            }}
          >
            Start playing{" "}
            <em style={{ color: "oklch(0.55 0.14 145)", fontStyle: "italic" }}>
              more
            </em>{" "}
            today.
          </h2>
          <p
            className="text-white/50 mt-3 fade-up"
            style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300, fontSize: "0.95rem" }}
          >
            Unlock every major course in Puerto Rico. Pays for itself in as few as 3–4 rounds.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-start">
          {/* Left: Pricing card */}
          <div
            className="rounded-sm p-8 fade-up"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="mb-6">
              <div
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest mb-4"
                style={{
                  background: "oklch(0.42 0.14 145 / 0.2)",
                  color: "oklch(0.65 0.14 145)",
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                Puerto Rico Residents Only
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  className="text-white font-bold"
                  style={{ fontFamily: "'Outfit', sans-serif", fontSize: "3.5rem", lineHeight: 1 }}
                >
                  $199
                </span>
                <span
                  className="text-white/40 text-sm"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  / year
                </span>
              </div>
              <p
                className="text-white/40 text-xs mt-1"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Annual membership · Renews each year
              </p>
            </div>

            <div className="space-y-3 mb-8">
              {features.map((f) => (
                <div key={f} className="flex items-start gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "oklch(0.42 0.14 145 / 0.2)" }}
                  >
                    <Check size={11} style={{ color: "oklch(0.65 0.14 145)" }} />
                  </div>
                  <span
                    className="text-white/70 text-sm"
                    style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}
                  >
                    {f}
                  </span>
                </div>
              ))}
            </div>

            {/* Savings calculator */}
            <div
              className="rounded-sm p-4"
              style={{
                background: "oklch(0.42 0.14 145 / 0.12)",
                border: "1px solid oklch(0.42 0.14 145 / 0.2)",
              }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: "oklch(0.65 0.14 145)", fontFamily: "'Outfit', sans-serif" }}
              >
                Savings Example
              </p>
              <div className="space-y-1.5 text-sm" style={{ fontFamily: "'Outfit', sans-serif" }}>
                <div className="flex justify-between">
                  <span className="text-white/50">4 rounds at TPC Dorado Beach</span>
                  <span className="text-white/70">~$800</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">With 25% member discount</span>
                  <span style={{ color: "oklch(0.65 0.14 145)" }}>Save ~$200</span>
                </div>
                <div
                  className="flex justify-between font-semibold pt-1.5 mt-1.5"
                  style={{ borderTop: "1px solid oklch(0.42 0.14 145 / 0.2)" }}
                >
                  <span className="text-white/70">Membership already paid for</span>
                  <span className="text-white">✓</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Sign-up form */}
          <div
            className="rounded-sm overflow-hidden fade-up"
            style={{
              background: "white",
              border: "1px solid oklch(0.88 0.02 85)",
            }}
          >
            {/* Step indicator */}
            <div
              className="flex border-b"
              style={{ borderColor: "oklch(0.88 0.02 85)" }}
            >
              {([1, 2, 3] as Step[]).map((s) => (
                <div
                  key={s}
                  className="flex-1 py-3 text-center text-xs font-semibold uppercase tracking-widest transition-all"
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    background: step === s ? "oklch(0.42 0.14 145)" : "transparent",
                    color: step === s ? "white" : step > s ? "oklch(0.42 0.14 145)" : "oklch(0.7 0.04 145)",
                    borderBottom: step > s ? "2px solid oklch(0.42 0.14 145)" : "none",
                  }}
                >
                  {s === 1 ? t("pricing.details") : s === 2 ? t("pricing.payment") : t("pricing.digitalId")}
                </div>
              ))}
            </div>

            <div className="p-6">
              {step === 1 && (
                <div className="space-y-4">
                  <h3
                    className="font-semibold text-lg mb-1"
                    style={{ fontFamily: "'Cormorant Garamond', serif", color: "oklch(0.13 0.05 145)" }}
                  >
                    {t("pricing.playerDetails")}
                  </h3>
                  <div
                    className="rounded-sm p-4 mb-2"
                    style={{
                      background: "oklch(0.42 0.14 145 / 0.08)",
                      border: "1px solid oklch(0.42 0.14 145 / 0.25)",
                    }}
                  >
                    <p
                      className="text-xs font-semibold uppercase tracking-widest mb-3"
                      style={{ color: "oklch(0.42 0.14 145)", fontFamily: "'Outfit', sans-serif" }}
                    >
                      {t("pricing.residencyGateTitle")}
                    </p>
                    <label className="flex gap-3 items-start cursor-pointer">
                      <input
                        type="checkbox"
                        checked={residencyConfirmed}
                        onChange={(e) => setResidencyConfirmed(e.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border"
                        style={{ accentColor: "oklch(0.42 0.14 145)" }}
                      />
                      <span
                        className="text-sm leading-snug"
                        style={{ color: "oklch(0.2 0.05 145)", fontFamily: "'Outfit', sans-serif", fontWeight: 500 }}
                      >
                        {t("pricing.residencyCheckbox")}
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label style={labelStyle}>{t("pricing.firstName")} *</label>
                      <input
                        id="inp-firstname"
                        type="text"
                        placeholder="Juan"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>{t("pricing.lastName")} *</label>
                      <input
                        id="inp-lastname"
                        type="text"
                        placeholder="Pérez"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>{t("pricing.phone")} *</label>
                    <input
                      id="inp-phone"
                      type="tel"
                      placeholder="+1 (787) 000-0000"
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>{t("pricing.email")} *</label>
                    <input
                      id="inp-email"
                      type="email"
                      placeholder="juan@example.com"
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>{t("pricing.address")}</label>
                    <input
                      id="inp-address"
                      type="text"
                      placeholder="Street, City, PR, ZIP"
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                  <div className="space-y-3 pt-1">
                    <label className="flex gap-3 items-start cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreedTerms}
                        onChange={(e) => setAgreedTerms(e.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border"
                        style={{ accentColor: "oklch(0.42 0.14 145)" }}
                      />
                      <span className="text-xs leading-relaxed" style={{ color: "oklch(0.4 0.05 145)", fontFamily: "'Outfit', sans-serif" }}>
                        {t("pricing.agreeTermsLead")}{" "}
                        <Link href="/terms" className="underline font-semibold" style={{ color: "oklch(0.42 0.14 145)" }}>
                          {t("pricing.terms")}
                        </Link>
                        .
                      </span>
                    </label>
                    <label className="flex gap-3 items-start cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreedPrivacy}
                        onChange={(e) => setAgreedPrivacy(e.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border"
                        style={{ accentColor: "oklch(0.42 0.14 145)" }}
                      />
                      <span className="text-xs leading-relaxed" style={{ color: "oklch(0.4 0.05 145)", fontFamily: "'Outfit', sans-serif" }}>
                        {t("pricing.agreePrivacyLead")}{" "}
                        <Link href="/privacy" className="underline font-semibold" style={{ color: "oklch(0.42 0.14 145)" }}>
                          {t("pricing.privacy")}
                        </Link>
                        .
                      </span>
                    </label>
                    <label className="flex gap-3 items-start cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreedRefundPolicy}
                        onChange={(e) => setAgreedRefundPolicy(e.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border"
                        style={{ accentColor: "oklch(0.42 0.14 145)" }}
                      />
                      <span className="text-xs leading-relaxed" style={{ color: "oklch(0.4 0.05 145)", fontFamily: "'Outfit', sans-serif" }}>
                        {t("pricing.agreeRefundLead")}{" "}
                        <Link href="/refunds" className="underline font-semibold" style={{ color: "oklch(0.42 0.14 145)" }}>
                          {t("footer.refunds")}
                        </Link>
                        .
                      </span>
                    </label>
                  </div>
                  {error && (
                    <div
                      className="p-3 rounded-sm text-sm text-center"
                      style={{ background: "rgba(220, 38, 38, 0.1)", color: "rgb(220, 38, 38)", fontFamily: "'Outfit', sans-serif" }}
                    >
                      {error}
                    </div>
                  )}
                  <button
                    id="btn-next-1"
                    onClick={handleContinueToPayment}
                    disabled={isSubmitting}
                    className="btn-fairway w-full text-sm py-3.5 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? t("pricing.savingForm") : t("pricing.continuePayment")}{" "}
                    <ArrowRight size={14} />
                  </button>
                  <p
                    className="text-xs text-center"
                    style={{ color: "oklch(0.65 0.04 145)", fontFamily: "'Outfit', sans-serif" }}
                  >
                    {t("pricing.checkoutHelpLead")}
                    <a
                      href={`mailto:${t("footer.email")}`}
                      className="underline font-medium"
                      style={{ color: "oklch(0.42 0.14 145)" }}
                    >
                      {t("footer.email")}
                    </a>
                    .
                  </p>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <button
                      onClick={() => setStep(1)}
                      className="text-sm flex items-center gap-1"
                      style={{ color: "oklch(0.55 0.06 145)", fontFamily: "'Outfit', sans-serif" }}
                    >
                      <ChevronLeft size={14} /> Back
                    </button>
                    <h3
                      className="font-semibold text-lg"
                      style={{ fontFamily: "'Cormorant Garamond', serif", color: "oklch(0.13 0.05 145)" }}
                    >
                      {t("pricing.payment")}
                    </h3>
                  </div>
                  <div
                    className="rounded-sm p-4 text-center"
                    style={{ background: "oklch(0.96 0.01 85)", border: "1px solid oklch(0.88 0.02 85)" }}
                  >
                    <div
                      className="text-2xl font-bold mb-1"
                      style={{ fontFamily: "'Outfit', sans-serif", color: "oklch(0.13 0.05 145)" }}
                    >
                      $199.00
                    </div>
                    <div
                      className="text-xs uppercase tracking-widest"
                      style={{ color: "oklch(0.55 0.06 145)", fontFamily: "'Outfit', sans-serif" }}
                    >
                      {t("pricing.annualMembership")}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => handleStartCheckout("subscription")}
                      disabled={isSubmitting}
                      className="btn-fairway w-full text-xs sm:text-sm py-3.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Wallet size={14} />}
                      <span>{t("pricing.subscribeNow")}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartCheckout("one-time")}
                      disabled={isSubmitting}
                      className="w-full text-xs sm:text-sm py-3.5 rounded-sm border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        borderColor: "oklch(0.42 0.14 145)",
                        color: "oklch(0.42 0.14 145)",
                        fontFamily: "'Outfit', sans-serif",
                        fontWeight: 500,
                      }}
                    >
                      {isSubmitting ? <Loader2 size={14} className="animate-spin inline mr-2" /> : null}
                      {t("pricing.buyOnceNow")}
                    </button>
                  </div>

                  {error && (
                    <div
                      className="p-3 rounded-sm text-sm text-center"
                      style={{ background: "rgba(220, 38, 38, 0.1)", color: "rgb(220, 38, 38)", fontFamily: "'Outfit', sans-serif" }}
                    >
                      {error}
                    </div>
                  )}

                  <p
                    className="text-xs text-center leading-relaxed"
                    style={{ color: "oklch(0.55 0.06 145)", fontFamily: "'Outfit', sans-serif" }}
                  >
                    {t("pricing.paymentRefundReminder")}{" "}
                    <Link href="/refunds" className="underline font-semibold" style={{ color: "oklch(0.42 0.14 145)" }}>
                      {t("footer.refunds")}
                    </Link>
                    .
                  </p>
                  <p
                    className="text-xs text-center"
                    style={{ color: "oklch(0.65 0.04 145)", fontFamily: "'Outfit', sans-serif" }}
                  >
                    🔒 {t("pricing.securedByStripe")}
                  </p>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <div className="text-center">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                      style={{ background: "oklch(0.42 0.14 145 / 0.1)" }}
                    >
                      <Check size={24} style={{ color: "oklch(0.42 0.14 145)" }} />
                    </div>
                    <h3
                      className="font-semibold text-xl"
                      style={{ fontFamily: "'Cormorant Garamond', serif", color: "oklch(0.13 0.05 145)" }}
                    >
                      {t("pricing.success")}
                    </h3>
                    <p
                      className="text-sm mt-1 max-w-sm mx-auto"
                      style={{ color: "oklch(0.55 0.06 145)", fontFamily: "'Outfit', sans-serif" }}
                    >
                      {t("pricing.successDesc")}
                    </p>
                  </div>

                  <DigitalMemberCard
                    displayName={memberCardName}
                    memberNumber={memberNoDisplay}
                    validUntil={validUntilDisplay}
                    season={seasonDisplay}
                    photoUrl={photoPreviewUrl}
                  />

                  <div>
                    <h4
                      className="font-semibold text-base mb-1"
                      style={{ fontFamily: "'Cormorant Garamond', serif", color: "oklch(0.13 0.05 145)" }}
                    >
                      {t("pricing.postPhotoHeading")}
                    </h4>
                    <p
                      className="text-sm mb-3"
                      style={{ color: "oklch(0.55 0.06 145)", fontFamily: "'Outfit', sans-serif" }}
                    >
                      {t("pricing.postPhotoDesc")}
                    </p>
                    <div className="flex gap-3">
                      <input
                        ref={postPhotoRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.currentTarget.files?.[0];
                          if (file) {
                            setPostPhotoFile(file);
                            setPostPhotoName(file.name);
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setPhotoPreviewUrl(event.target?.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => postPhotoRef.current?.click()}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-sm border"
                        style={{
                          borderColor: "oklch(0.88 0.02 85)",
                          color: "oklch(0.42 0.14 145)",
                          fontFamily: "'Outfit', sans-serif",
                          fontWeight: 500,
                        }}
                      >
                        <Camera size={14} />
                        {postPhotoName || t("pricing.choosePhoto")}
                      </button>
                      {postPhotoFile && !photoSaved && (
                        <button
                          type="button"
                          onClick={handleSavePhoto}
                          disabled={isSavingPhoto}
                          className="flex-1 btn-fairway text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSavingPhoto ? t("pricing.saving") : t("pricing.save")}
                        </button>
                      )}
                      {photoSaved && (
                        <div
                          className="flex-1 flex items-center justify-center rounded-sm"
                          style={{ background: "oklch(0.42 0.14 145 / 0.1)" }}
                        >
                          <Check size={16} style={{ color: "oklch(0.42 0.14 145)" }} />
                        </div>
                      )}
                    </div>
                  </div>

                  <p
                    className="text-xs text-center"
                    style={{ color: "oklch(0.65 0.04 145)", fontFamily: "'Outfit', sans-serif" }}
                  >
                    {t("pricing.nextSteps")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
