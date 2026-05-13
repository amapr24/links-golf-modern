/*
 * Dashboard — Links Golf Membership
 * Design: Member dashboard with digital pass, membership details, and quick actions
 * Features: View pass, renewal info, course access, download pass, contact support
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Download, LogOut, HelpCircle, Calendar, MapPin, QrCode, Copy, Check } from "lucide-react";

interface MemberData {
  firstName: string;
  lastName: string;
  memberNumber: string;
  email: string;
  phone: string;
  joinDate: string;
  renewalDate: string;
  photoUrl?: string;
}

export default function Dashboard() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [copied, setCopied] = useState(false);
  const { data: session, isPending } = trpc.member.session.useQuery();
  const logoutMutation = trpc.member.logout.useMutation();
  const trpcUtils = trpc.useUtils();

  useEffect(() => {
    if (isPending) return;
    if (!session) setLocation("/login");
  }, [isPending, session, setLocation]);
  const [member] = useState<MemberData>({
    firstName: "Juan",
    lastName: "Pérez",
    memberNumber: "LGM-000123",
    email: "juan@example.com",
    phone: "+1 (787) 555-0123",
    joinDate: "May 12, 2026",
    renewalDate: "May 12, 2027",
    photoUrl: "👤",
  });

  const handleCopyMemberNumber = () => {
    navigator.clipboard.writeText(member.memberNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      await trpcUtils.member.session.invalidate();
      setLocation("/");
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#F7F3EC] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.98 0.001 286.375)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          background: "white",
          borderColor: "oklch(0.92 0.004 286.32)",
        }}
      >
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "oklch(0.42 0.14 145)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            </div>
            <span
              className="font-semibold text-sm"
              style={{ fontFamily: "'Outfit', sans-serif", color: "oklch(0.13 0.05 145)" }}
            >
              Links Golf Member
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-sm transition-all duration-200"
            style={{
              fontFamily: "'Outfit', sans-serif",
              color: "oklch(0.55 0.06 145)",
              background: "oklch(0.96 0.01 85)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "oklch(0.92 0.02 85)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "oklch(0.96 0.01 85)")}
          >
                <LogOut size={14} />
            {t("dashboard.logout")}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-8 md:py-12">
        {/* Welcome section */}
        <div className="mb-10">
          <h1
            className="text-3xl md:text-4xl font-semibold mb-2"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "oklch(0.13 0.05 145)",
            }}
          >
            {t("dashboard.welcome")}, {member.firstName}!
          </h1>
          <p
            className="text-sm"
            style={{
              fontFamily: "'Outfit', sans-serif",
              color: "oklch(0.55 0.06 145)",
              fontWeight: 300,
            }}
          >
            {t("dashboard.active")}
          </p>
        </div>

        {/* Two-column layout: Pass + Details */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Left: Digital Pass Card */}
          <div className="md:col-span-2">
            <div
              className="rounded-lg overflow-hidden shadow-lg"
              style={{
                background: "linear-gradient(135deg, oklch(0.28 0.12 145) 0%, oklch(0.18 0.08 145) 100%)",
                border: "1px solid oklch(0.42 0.14 145 / 0.3)",
              }}
            >
              <div className="p-8">
                {/* Card header */}
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <div
                      className="text-white/40 text-xs uppercase tracking-widest mb-1"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      Links Golf
                    </div>
                    <div
                      className="text-white font-semibold text-xl"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      Golf Membership
                    </div>
                  </div>
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "oklch(0.42 0.14 145 / 0.3)" }}
                  >
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-white/60 text-4xl">{member.photoUrl}</span>
                    </div>
                  </div>
                </div>

                {/* Member info */}
                <div className="mb-6 pb-6" style={{ borderBottom: "1px solid oklch(0.42 0.14 145 / 0.2)" }}>
                  <div className="mb-4">
                    <div
                      className="text-white/40 text-xs uppercase tracking-widest mb-1"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      Member Name
                    </div>
                    <div
                      className="text-white font-semibold text-lg"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      {member.firstName} {member.lastName}
                    </div>
                  </div>
                </div>

                {/* Member number and validity */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div
                      className="text-white/40 text-xs uppercase tracking-widest mb-1"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      Member No.
                    </div>
                    <div className="text-white/80 text-sm font-mono">{member.memberNumber}</div>
                  </div>
                  <div className="text-right">
                    <div
                      className="text-white/40 text-xs uppercase tracking-widest mb-1"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      Valid Until
                    </div>
                    <div className="text-white/80 text-sm font-mono">
                      {new Date(member.renewalDate).toLocaleDateString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                        year: "2-digit",
                      })}
                    </div>
                  </div>
                </div>

                {/* QR Code placeholder */}
                <div className="flex items-center justify-center py-6 mb-6" style={{ background: "rgba(255,255,255,0.05)", borderRadius: "8px" }}>
                  <div className="flex flex-col items-center gap-2">
                    <QrCode size={48} style={{ color: "oklch(0.65 0.14 145)" }} />
                    <div
                      className="text-xs text-white/40"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      Show this at pro shop
                    </div>
                  </div>
                </div>

                {/* Founding member badge */}
                <div
                  className="px-4 py-2 text-center text-xs uppercase tracking-widest rounded-sm"
                  style={{
                    background: "oklch(0.42 0.14 145 / 0.3)",
                    color: "oklch(0.65 0.14 145)",
                    fontFamily: "'Outfit', sans-serif",
                    border: "1px solid oklch(0.42 0.14 145 / 0.2)",
                  }}
                >
                  Founding Member · 2026–27
                </div>
              </div>
            </div>

            {/* Pass actions */}
            <div className="flex gap-3 mt-4">
              <button
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-sm font-medium text-sm transition-all duration-200"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  background: "oklch(0.42 0.14 145)",
                  color: "white",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <Download size={16} />
                {t("dashboard.pass.download")}
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-sm font-medium text-sm transition-all duration-200"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  background: "oklch(0.96 0.01 85)",
                  color: "oklch(0.42 0.14 145)",
                  border: "1px solid oklch(0.88 0.02 85)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "oklch(0.92 0.02 85)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "oklch(0.96 0.01 85)")}
              >
                <Copy size={16} />
                Copy Number
              </button>
            </div>
          </div>

          {/* Right: Quick info cards */}
          <div className="space-y-4">
            {/* Renewal status */}
            <div
              className="rounded-lg p-6"
              style={{
                background: "white",
                border: "1px solid oklch(0.88 0.02 85)",
              }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "oklch(0.42 0.14 145 / 0.1)" }}
                >
                  <Calendar size={18} style={{ color: "oklch(0.42 0.14 145)" }} />
                </div>
                <div>
                  <div
                    className="text-xs font-semibold uppercase tracking-widest mb-1"
                    style={{ color: "oklch(0.42 0.14 145)", fontFamily: "'Outfit', sans-serif" }}
                  >
                    Renewal Date
                  </div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: "oklch(0.13 0.05 145)", fontFamily: "'Outfit', sans-serif" }}
                  >
                    {new Date(member.renewalDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>
              <div
                className="text-xs"
                style={{ color: "oklch(0.55 0.06 145)", fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}
              >
                You'll receive a renewal reminder 30 days before expiration.
              </div>
            </div>

            {/* Courses access */}
            <div
              className="rounded-lg p-6"
              style={{
                background: "white",
                border: "1px solid oklch(0.88 0.02 85)",
              }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "oklch(0.42 0.14 145 / 0.1)" }}
                >
                  <MapPin size={18} style={{ color: "oklch(0.42 0.14 145)" }} />
                </div>
                <div>
                  <div
                    className="text-xs font-semibold uppercase tracking-widest mb-1"
                    style={{ color: "oklch(0.42 0.14 145)", fontFamily: "'Outfit', sans-serif" }}
                  >
                    Course Access
                  </div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: "oklch(0.13 0.05 145)", fontFamily: "'Outfit', sans-serif" }}
                  >
                    15 Courses
                  </div>
                </div>
              </div>
              <button
                className="text-xs font-medium mt-2"
                style={{ color: "oklch(0.42 0.14 145)", fontFamily: "'Outfit', sans-serif" }}
              >
                View all courses →
              </button>
            </div>

            {/* Support */}
            <div
              className="rounded-lg p-6"
              style={{
                background: "oklch(0.42 0.14 145 / 0.08)",
                border: "1px solid oklch(0.42 0.14 145 / 0.2)",
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "oklch(0.42 0.14 145 / 0.2)" }}
                >
                  <HelpCircle size={18} style={{ color: "oklch(0.42 0.14 145)" }} />
                </div>
                <div>
                  <div
                    className="text-xs font-semibold uppercase tracking-widest mb-1"
                    style={{ color: "oklch(0.42 0.14 145)", fontFamily: "'Outfit', sans-serif" }}
                  >
                    Need Help?
                  </div>
                  <div
                    className="text-xs mb-2"
                    style={{ color: "oklch(0.55 0.06 145)", fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}
                  >
                    Contact our support team
                  </div>
                  <a
                    href="mailto:info@linksgolfpr.com"
                    className="text-xs font-medium"
                    style={{ color: "oklch(0.42 0.14 145)", fontFamily: "'Outfit', sans-serif" }}
                  >
                    info@linksgolfpr.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Member details section */}
        <div
          className="rounded-lg p-8"
          style={{
            background: "white",
            border: "1px solid oklch(0.88 0.02 85)",
          }}
        >
          <h2
            className="text-xl font-semibold mb-6"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "oklch(0.13 0.05 145)",
            }}
          >
            Account Details
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left column */}
            <div className="space-y-6">
              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-widest mb-2 block"
                  style={{ color: "oklch(0.42 0.14 145)", fontFamily: "'Outfit', sans-serif" }}
                >
                  Full Name
                </label>
                <div
                  className="text-sm"
                  style={{ color: "oklch(0.13 0.05 145)", fontFamily: "'Outfit', sans-serif" }}
                >
                  {member.firstName} {member.lastName}
                </div>
              </div>

              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-widest mb-2 block"
                  style={{ color: "oklch(0.42 0.14 145)", fontFamily: "'Outfit', sans-serif" }}
                >
                  Email Address
                </label>
                <div
                  className="text-sm"
                  style={{ color: "oklch(0.13 0.05 145)", fontFamily: "'Outfit', sans-serif" }}
                >
                  {member.email}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-widest mb-2 block"
                  style={{ color: "oklch(0.42 0.14 145)", fontFamily: "'Outfit', sans-serif" }}
                >
                  Phone Number
                </label>
                <div
                  className="text-sm"
                  style={{ color: "oklch(0.13 0.05 145)", fontFamily: "'Outfit', sans-serif" }}
                >
                  {member.phone}
                </div>
              </div>

              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-widest mb-2 block"
                  style={{ color: "oklch(0.42 0.14 145)", fontFamily: "'Outfit', sans-serif" }}
                >
                  Member Since
                </label>
                <div
                  className="text-sm"
                  style={{ color: "oklch(0.13 0.05 145)", fontFamily: "'Outfit', sans-serif" }}
                >
                  {member.joinDate}
                </div>
              </div>
            </div>
          </div>

          {/* Edit button */}
          <button
            className="mt-8 px-6 py-2.5 rounded-sm text-sm font-medium transition-all duration-200"
            style={{
              fontFamily: "'Outfit', sans-serif",
              background: "oklch(0.42 0.14 145)",
              color: "white",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Edit Details
          </button>
        </div>
      </main>
    </div>
  );
}
