import { useEffect, useState } from "react";
import { useLocation } from "wouter";

const MEMBER_SESSION_KEY = "member_session";

function readHasMemberSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return Boolean(localStorage.getItem(MEMBER_SESSION_KEY));
  } catch {
    return false;
  }
}

/**
 * True when the Links Golf member OTP session exists (same gate as the Dashboard page).
 * Not the same as platform `auth.me` — avoids showing "Dashboard" when only a host cookie is present.
 */
export function useHasMemberSession(): boolean {
  const [path] = useLocation();
  const [has, setHas] = useState(() => readHasMemberSession());

  useEffect(() => {
    setHas(readHasMemberSession());
  }, [path]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === MEMBER_SESSION_KEY || e.key === null) {
        setHas(readHasMemberSession());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return has;
}
