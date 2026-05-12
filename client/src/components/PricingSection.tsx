/*
 * PricingSection — Links Golf Membership
 * Design: Dark full-width panel, centered conversion card
 * Multi-step form: Player Details → Payment → Digital ID
 */

import { useState, useRef, useEffect } from "react";
import { Check, ArrowRight, Camera, ChevronLeft } from "lucide-react";
import { saveMemberSignup, activateMembership } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";

const AERIAL_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663654134519/4FsPe29zkxfgYYXFDn34Fq/course-aerial-Cx8xkxJjzpQ297eVUAemkv.webp";

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
  const [step, setStep] = useState<Step>(1);
  const [photoName, setPhotoName] = useState<string>("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [memberId, setMemberId] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Activate membership when payment succeeds (step 3)
  useEffect(() => {
    if (step === 3 && memberId) {
      const now = new Date();
      const expiresDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      
      activateMembership({
        memberId,
        activatedAt: now.toISOString(),
        expiresAt: expiresDate.toISOString(),
      }).catch((err) => console.error("Failed to activate membership:", err));
    }
  }, [step, memberId]);

  const handleContinueToPayment = async () => {
    setError("");
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

      // Save to Supabase with photo file and address
      const member = await saveMemberSignup({
        firstName,
        lastName,
        email,
        phone,
        address: address || "",
        photoFile: photoFile || undefined,
      });

      if (member?.id) {
        setMemberId(member.id);
      }

      setStep(2);
    } catch (err) {
      console.error("Error saving member:", err);
      setError("Failed to save your information. Please try again.");
    } finally {
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

      <div className="relative z-10 container py-20 md:py-28">
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
                  {s === 1 ? "Details" : s === 2 ? "Payment" : "Digital ID"}
                </div>
              ))}
            </div>

            <div className="p-6">
              {step === 1 && (
                <div className="space-y-4">
                  <h3
                    className="font-semibold text-lg mb-4"
                    style={{ fontFamily: "'Cormorant Garamond', serif", color: "oklch(0.13 0.05 145)" }}
                  >
                    Player Details
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label style={labelStyle}>First Name *</label>
                      <input
                        id="inp-firstname"
                        type="text"
                        placeholder="Juan"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Last Name *</label>
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
                    <label style={labelStyle}>Mobile *</label>
                    <input
                      id="inp-phone"
                      type="tel"
                      placeholder="+1 (787) 000-0000"
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Email Address *</label>
                    <input
                      id="inp-email"
                      type="email"
                      placeholder="juan@example.com"
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Address</label>
                    <input
                      id="inp-address"
                      type="text"
                      placeholder="Street, City, PR, ZIP"
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                  {/* Photo upload */}
                  <div>
                    <label style={labelStyle}>Verification Photo *</label>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      capture="user"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        setPhotoName(file?.name || "");
                        setPhotoFile(file || null);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-sm border-2 border-dashed text-sm font-medium transition-all duration-200 hover:border-[oklch(0.42_0.14_145)] hover:bg-[oklch(0.42_0.14_145_/_0.04)]"
                      style={{
                        borderColor: photoName ? "oklch(0.42 0.14 145)" : "oklch(0.85 0.03 145)",
                        color: photoName ? "oklch(0.42 0.14 145)" : "oklch(0.55 0.06 145)",
                        fontFamily: "'Outfit', sans-serif",
                      }}
                    >
                      <Camera size={16} />
                      {photoName || "Take or Upload Photo"}
                    </button>
                    <p
                      className="text-xs mt-1.5"
                      style={{ color: "oklch(0.65 0.04 145)", fontFamily: "'Outfit', sans-serif" }}
                    >
                      Required · Front-facing · Used for your Digital ID only.
                    </p>
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
                    {isSubmitting ? "Saving..." : "Continue to Payment"} <ArrowRight size={14} />
                  </button>
                  <p
                    className="text-xs text-center"
                    style={{ color: "oklch(0.65 0.04 145)", fontFamily: "'Outfit', sans-serif" }}
                  >
                    By continuing, you confirm you are a Puerto Rico resident and agree to our{" "}
                    <a href="#" className="underline" style={{ color: "oklch(0.42 0.14 145)" }}>
                      Terms of Service
                    </a>
                    {" "}and{" "}
                    <a href="#" className="underline" style={{ color: "oklch(0.42 0.14 145)" }}>
                      Privacy Policy
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
                      Payment
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
                      Annual Membership
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label style={labelStyle}>Card Number</label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label style={labelStyle}>Expiry</label>
                        <input
                          type="text"
                          placeholder="MM / YY"
                          className={inputClass}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>CVV</label>
                        <input
                          type="text"
                          placeholder="•••"
                          className={inputClass}
                          style={inputStyle}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Name on Card</label>
                      <input
                        type="text"
                        placeholder="Juan Pérez"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(3)}
                    className="btn-fairway w-full text-sm py-3.5 mt-2"
                  >
                    PAY $199 & GET MY CARD <ArrowRight size={14} />
                  </button>
                  <p
                    className="text-xs text-center"
                    style={{ color: "oklch(0.65 0.04 145)", fontFamily: "'Outfit', sans-serif" }}
                  >
                    🔒 Secured by SSL encryption
                  </p>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  {/* Success message */}
                  <div className="text-center mb-6">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                      style={{ background: "oklch(0.42 0.14 145 / 0.1)" }}
                    >
                      <Check size={24} style={{ color: "oklch(0.42 0.14 145)" }} />
                    </div>
                    <h3
                      className="font-semibold text-lg"
                      style={{ fontFamily: "'Cormorant Garamond', serif", color: "oklch(0.13 0.05 145)" }}
                    >
                      Welcome to Links Golf!
                    </h3>
                    <p
                      className="text-sm mt-1"
                      style={{ color: "oklch(0.55 0.06 145)", fontFamily: "'Outfit', sans-serif" }}
                    >
                      Your membership is active. Add your pass to your wallet.
                    </p>
                  </div>

                  {/* Wallet buttons */}
                  <div className="space-y-2">
                    <button
                      className="w-full py-3 px-4 rounded-sm text-sm font-semibold transition-all"
                      style={{
                        background: "black",
                        color: "white",
                        fontFamily: "'Outfit', sans-serif",
                      }}
                    >
                      🍎 Add to Apple Wallet
                    </button>
                    <button
                      className="w-full py-3 px-4 rounded-sm text-sm font-semibold transition-all"
                      style={{
                        background: "oklch(0.42 0.14 145)",
                        color: "white",
                        fontFamily: "'Outfit', sans-serif",
                      }}
                    >
                      🤖 Add to Google Wallet
                    </button>
                  </div>

                  {/* Dashboard button */}
                  <button
                    onClick={() => window.location.href = "/dashboard"}
                    className="btn-fairway w-full text-sm py-3.5"
                  >
                    Go to My Dashboard
                  </button>

                  <p
                    className="text-xs text-center"
                    style={{ color: "oklch(0.65 0.04 145)", fontFamily: "'Outfit', sans-serif" }}
                  >
                    Check your email for membership details and course information.
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
