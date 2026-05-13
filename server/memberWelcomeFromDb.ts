import { createClient } from "@supabase/supabase-js";

function memberNumberFromId(id: string): string {
  return `LGM-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

function getAdminClient() {
  const url =
    process.env.SUPABASE_URL?.trim() || process.env.VITE_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function isMissingWelcomeColumnError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: string; message?: string };
  const msg = (e.message ?? "").toLowerCase();
  if (e.code === "42703") return true;
  return (
    msg.includes("welcome_email_sent_at") &&
    (msg.includes("does not exist") || msg.includes("could not find"))
  );
}

export type MemberWelcomeFields = {
  firstName: string;
  memberNumber: string;
  /** ISO8601 when welcome was already sent, or null / absent. */
  welcomeEmailSentAt: string | null;
};

/**
 * Resolve member UUID from normalized email (service role).
 * Used after OTP verify so the session is never bound to a client-supplied id.
 */
export async function resolveMemberIdFromEmail(
  email: string
): Promise<string | null> {
  const supabase = getAdminClient();
  if (!supabase) return null;
  const norm = email.trim().toLowerCase();
  const { data, error } = await supabase
    .from("members")
    .select("id")
    .eq("email", norm)
    .maybeSingle();

  if (error || !data?.id) return null;
  return data.id as string;
}

/**
 * Loads member display fields for the welcome email using the service role.
 * Returns null when Supabase admin is not configured or the row does not match email.
 */
export async function fetchMemberWelcomeFields(
  memberId: string,
  email: string
): Promise<MemberWelcomeFields | null> {
  const supabase = getAdminClient();
  if (!supabase) return null;

  const withWelcome = await supabase
    .from("members")
    .select("id, first_name, email, welcome_email_sent_at")
    .eq("id", memberId)
    .maybeSingle();

  if (!withWelcome.error && withWelcome.data) {
    const data = withWelcome.data as {
      id: string;
      first_name: string;
      email: string;
      welcome_email_sent_at?: string | null;
    };
    if (!data.email || !data.first_name) return null;
    if (data.email.toLowerCase() !== email.toLowerCase()) return null;
    return {
      firstName: data.first_name,
      memberNumber: memberNumberFromId(data.id),
      welcomeEmailSentAt: data.welcome_email_sent_at ?? null,
    };
  }

  if (withWelcome.error && isMissingWelcomeColumnError(withWelcome.error)) {
    const basic = await supabase
      .from("members")
      .select("id, first_name, email")
      .eq("id", memberId)
      .maybeSingle();
    if (basic.error || !basic.data?.email || !basic.data.first_name) return null;
    const data = basic.data as { id: string; first_name: string; email: string };
    if (data.email.toLowerCase() !== email.toLowerCase()) return null;
    return {
      firstName: data.first_name,
      memberNumber: memberNumberFromId(data.id),
      welcomeEmailSentAt: null,
    };
  }

  return null;
}

/**
 * Persists welcome send time on the member row (service role).
 * Returns false if admin client is unavailable, the column is missing, or the update failed.
 */
export async function markWelcomeEmailSentAtMember(
  memberId: string
): Promise<boolean> {
  const supabase = getAdminClient();
  if (!supabase) return false;

  const iso = new Date().toISOString();
  const { error } = await supabase
    .from("members")
    .update({ welcome_email_sent_at: iso })
    .eq("id", memberId);

  if (error) {
    if (isMissingWelcomeColumnError(error)) return false;
    console.error("[markWelcomeEmailSentAtMember]", error);
    return false;
  }
  return true;
}
