import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Success() {
  const [, setLocation] = useLocation();
  const [isCreatingSession, setIsCreatingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const createSessionMutation = trpc.member.createSessionAfterCheckout.useMutation();

  useEffect(() => {
    const createSession = async () => {
      try {
        // Get checkout data from URL query parameters and sessionStorage
        const params = new URLSearchParams(window.location.search);
        
        // Try to get sessionId from multiple sources
        let sessionId = params.get("sessionId") || 
                        params.get("session_id") || 
                        params.get("checkout_session_id") ||
                        sessionStorage.getItem("checkout_session_id");
        
        const memberId = params.get("memberId") || 
                         sessionStorage.getItem("checkout_member_id");
        
        const email = params.get("email") || 
                      sessionStorage.getItem("checkout_member_email");

        console.log("[Success] Received params:", { sessionId, memberId, email });

        if (!memberId || !email) {
          console.error("[Success] Missing parameters:", { sessionId, memberId, email });
          setError("Missing checkout information. Please contact support.");
          setIsCreatingSession(false);
          return;
        }

        if (!sessionId) {
          console.error("[Success] Missing session ID");
          setError("Missing session information. Please contact support.");
          setIsCreatingSession(false);
          return;
        }

        // Create session and set cookie
        const result = await createSessionMutation.mutateAsync({
          memberId: parseInt(memberId, 10),
          email,
          checkoutSessionId: sessionId,
        });

        console.log("[Success] Session creation result:", result);

        if (result.success) {
          // Clear sessionStorage
          sessionStorage.removeItem("checkout_session_id");
          sessionStorage.removeItem("checkout_member_id");
          sessionStorage.removeItem("checkout_member_email");
          
          // Redirect to dashboard
          setLocation("/dashboard");
        } else {
          setError(result.error || "Failed to create session");
          setIsCreatingSession(false);
        }
      } catch (err) {
        console.error("[Success] Error creating session:", err);
        setError("An error occurred. Please try again.");
        setIsCreatingSession(false);
      }
    };

    createSession();
  }, [createSessionMutation, setLocation]);

  if (isCreatingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[oklch(0.98_0.01_145)] to-[oklch(0.95_0.02_145)]">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-8 flex justify-center">
            <Loader2 className="w-12 h-12 animate-spin" style={{ color: "oklch(0.42 0.14 145)" }} />
          </div>
          <h1
            className="text-2xl font-semibold mb-3"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "oklch(0.13 0.05 145)",
            }}
          >
            Setting up your membership...
          </h1>
          <p
            className="text-sm"
            style={{
              fontFamily: "'Outfit', sans-serif",
              color: "oklch(0.45 0.06 145)",
            }}
          >
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[oklch(0.98_0.01_145)] to-[oklch(0.95_0.02_145)]">
        <div className="text-center max-w-md mx-auto px-4">
          <h1
            className="text-2xl font-semibold mb-3"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "oklch(0.13 0.05 145)",
            }}
          >
            Something went wrong
          </h1>
          <p
            className="text-sm mb-6"
            style={{
              fontFamily: "'Outfit', sans-serif",
              color: "rgb(220, 38, 38)",
            }}
          >
            {error}
          </p>
          <button
            onClick={() => setLocation("/")}
            className="w-full px-6 py-3 rounded-sm font-medium transition-all duration-200"
            style={{
              fontFamily: "'Outfit', sans-serif",
              background: "oklch(0.42 0.14 145)",
              color: "white",
            }}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return null;
}
