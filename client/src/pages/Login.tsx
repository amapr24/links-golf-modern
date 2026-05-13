import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import { Mail, ArrowRight, Loader2 } from "lucide-react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { trpc } from "@/lib/trpc";

type Step = "email" | "otp" | "success";

type MemberRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
};

export default function Login() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberProfile, setMemberProfile] = useState<MemberRow | null>(null);

  const verifyOtpMutation = trpc.member.verifyOtp.useMutation();
  const trpcUtils = trpc.useUtils();

  // Step 1: Send OTP to email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!supabase) {
      setError(
        "Login is not configured (missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).",
      );
      return;
    }
    setLoading(true);

    try {
      // Check if member exists in Supabase
      const { data: member, error: queryError } = await supabase
        .from("members")
        .select("id, first_name, last_name, email")
        .eq("email", email.toLowerCase())
        .single();

      if (queryError || !member) {
        setError(t("login.memberNotFound") || "Member not found. Please sign up first.");
        setLoading(false);
        return;
      }

      setMemberProfile(member as MemberRow);
      setMemberName(`${member.first_name} ${member.last_name}`);
      localStorage.setItem("login_email", email);
      localStorage.setItem("login_member_id", member.id);

      const sendOtpMutation = trpc.member.sendOtp.useMutation();
      
      try {
        const result = await sendOtpMutation.mutateAsync({ email: email.toLowerCase() });
        
        if (!result.success) {
          setError(result.error || "Failed to send OTP. Please try again.");
          setLoading(false);
          return;
        }
        
        // OTP sent successfully, move to verification step
        setStep("otp");
      } catch (emailErr) {
        console.error("[sendOtp] Error:", emailErr);
        setError("Failed to send OTP email. Please try again.");
        setLoading(false);
        return;
      }
    } catch (err) {
      setError(t("login.error") || "An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const memberId = localStorage.getItem("login_member_id");
      if (!memberId || !memberProfile) {
        setError(t("login.error") || "An error occurred. Please try again.");
        setLoading(false);
        return;
      }

      const result = await verifyOtpMutation.mutateAsync({
        email: email.toLowerCase(),
        otp,
        memberId,
      });

      if (!result.success) {
        setError(result.error || t("login.invalidOtp") || "Invalid OTP. Please try again.");
        setLoading(false);
        return;
      }

      await trpcUtils.member.session.invalidate();

      localStorage.removeItem("login_email");
      localStorage.removeItem("login_member_id");

      setStep("success");

      setTimeout(() => {
        setLocation("/dashboard");
      }, 2000);
    } catch (err) {
      setError(t("login.error") || "An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-[#F7F3EC] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-950 text-sm">
          <p className="font-medium mb-2">Supabase is not configured</p>
          <p className="text-amber-900/90">
            Add <code className="font-mono text-xs">VITE_SUPABASE_URL</code> and{" "}
            <code className="font-mono text-xs">VITE_SUPABASE_ANON_KEY</code> to
            your <code className="font-mono text-xs">.env</code> file to enable
            login and sign-up.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3EC] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-light mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {t("login.title") || "Welcome Back"}
          </h1>
          <p className="text-gray-600" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {t("login.subtitle") || "Access your Links Golf membership"}
          </p>
        </div>

        {/* Email Step */}
        {step === "email" && (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("login.email") || "Email Address"}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-fairway)] focus:border-transparent outline-none transition"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-[var(--color-fairway)] hover:bg-[var(--color-fairway-dark)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {t("login.sending") || "Sending..."}
                </>
              ) : (
                <>
                  {t("login.sendOtp") || "Send Verification Code"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <p className="text-center text-sm text-gray-600">
              {t("login.noAccount") || "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => setLocation("/")}
                className="text-[var(--color-fairway)] hover:underline font-semibold"
              >
                {t("login.signUp") || "Sign up"}
              </button>
            </p>
          </form>
        )}

        {/* OTP Step */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              {t("login.otpSent") || "Verification code sent to"} <strong>{email}</strong>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("login.verificationCode") || "Verification Code"}
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-fairway)] focus:border-transparent outline-none transition text-center text-2xl tracking-widest"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-[var(--color-fairway)] hover:bg-[var(--color-fairway-dark)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {t("login.verifying") || "Verifying..."}
                </>
              ) : (
                <>
                  {t("login.verify") || "Verify & Login"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("email");
                setOtp("");
                setError("");
              }}
              className="w-full text-gray-600 hover:text-gray-800 font-medium py-2"
            >
              {t("login.backToEmail") || "Back to email"}
            </button>
          </form>
        )}

        {/* Success Step */}
        {step === "success" && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {t("login.welcome") || "Welcome back"}, {memberName}!
              </h2>
              <p className="text-gray-600">
                {t("login.redirecting") || "Redirecting to your dashboard..."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
