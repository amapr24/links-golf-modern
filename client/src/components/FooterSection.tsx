/*
 * FooterSection — Links Golf Membership
 * Design: Dark forest background, clean link columns
 */

export default function FooterSection() {
  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer style={{ background: "oklch(0.1 0.04 145)" }}>
      <div className="container py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
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
                className="text-white font-semibold text-sm"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Links Golf
              </span>
            </div>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}
            >
              Puerto Rico's premier golf membership. Play more, pay less.
            </p>
          </div>

          {/* Membership */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "oklch(0.42 0.14 145)", fontFamily: "'Outfit', sans-serif" }}
            >
              Membership
            </p>
            <div className="space-y-2.5">
              {[
                { label: "Benefits", id: "#benefits" },
                { label: "Our Network", id: "#courses" },
                { label: "How It Works", id: "#how-it-works" },
                { label: "Get Your Card", id: "#pricing" },
              ].map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className="block text-sm transition-colors duration-200"
                  style={{
                    color: "rgba(255,255,255,0.45)",
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 300,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "oklch(0.42 0.14 145)", fontFamily: "'Outfit', sans-serif" }}
            >
              Support
            </p>
            <div className="space-y-2.5">
              {[
                { label: "FAQ", id: "#faq" },
                { label: "Contact Us", id: "#faq" },
              ].map((link) => (
                <button
                  key={link.label}
                  onClick={() => scrollTo(link.id)}
                  className="block text-sm transition-colors duration-200"
                  style={{
                    color: "rgba(255,255,255,0.45)",
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 300,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
                >
                  {link.label}
                </button>
              ))}
              <a
                href="mailto:info@linksgolfpr.com"
                className="block text-sm transition-colors duration-200"
                style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
              >
                info@linksgolfpr.com
              </a>
            </div>
          </div>

          {/* Legal */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "oklch(0.42 0.14 145)", fontFamily: "'Outfit', sans-serif" }}
            >
              Legal
            </p>
            <div className="space-y-2.5">
              {["Terms of Service", "Privacy Policy"].map((label) => (
                <a
                  key={label}
                  href="#"
                  className="block text-sm transition-colors duration-200"
                  style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <p
            className="text-xs"
            style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'Outfit', sans-serif" }}
          >
            © 2026 Links Golf Membership. Puerto Rico residents only.
          </p>
          <p
            className="text-xs"
            style={{ color: "rgba(255,255,255,0.2)", fontFamily: "'Outfit', sans-serif" }}
          >
            Play More. Pay Less.
          </p>
        </div>
      </div>
    </footer>
  );
}
