import { createClient } from "@supabase/supabase-js";

function memberNumberFromId(id: string): string {
  return `LGM-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

function addOneYearIso(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return new Date().toISOString();
  d.setUTCFullYear(d.getUTCFullYear() + 1);
  return d.toISOString();
}

export type MemberMePayload = {
  firstName: string;
  lastName: string;
  memberNumber: string;
  email: string;
  phone: string;
  /** ISO date for membership start (activated_at or created_at). */
  joinDateIso: string;
  /** ISO renewal / expiry (expires_at or estimated from activation or created). */
  renewalDateIso: string;
  /** Public photo URL or null. */
  photoUrl: string | null;
};

/**
 * Loads member profile for the authenticated session (service role).
 * Email must match the session email (case-insensitive).
 */
export async function fetchMemberProfileForSession(
  memberId: string,
  normalizedSessionEmail: string
): Promise<MemberMePayload | null> {
  const url =
    process.env.SUPABASE_URL?.trim() || process.env.VITE_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from("members")
    .select(
      "id, first_name, last_name, email, phone, photo_url, created_at, activated_at, expires_at"
    )
    .eq("id", memberId)
    .maybeSingle();

  if (error || !data?.email) return null;
  if (data.email.toLowerCase() !== normalizedSessionEmail.toLowerCase()) {
    return null;
  }

  const row = data as {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    phone: string | null;
    photo_url: string | null;
    created_at: string | null;
    activated_at: string | null;
    expires_at: string | null;
  };

  const joinDateIso =
    row.activated_at || row.created_at || new Date().toISOString();

  let renewalDateIso = row.expires_at;
  if (!renewalDateIso) {
    renewalDateIso = row.activated_at
      ? addOneYearIso(row.activated_at)
      : row.created_at
        ? addOneYearIso(row.created_at)
        : addOneYearIso(joinDateIso);
  }

  return {
    firstName: (row.first_name ?? "").trim() || "Member",
    lastName: (row.last_name ?? "").trim(),
    memberNumber: memberNumberFromId(row.id),
    email: row.email,
    phone: (row.phone ?? "").trim() || "—",
    joinDateIso,
    renewalDateIso,
    photoUrl: row.photo_url?.trim() || null,
  };
}

/**
 * Sets membership activation window on Supabase after Stripe confirms payment.
 * Call only after checkout session is verified; member id is Supabase `members.id`.
 */
export async function activateSupabaseMemberAfterPaidCheckout(opts: {
  memberId: string;
  activatedAtIso: string;
  expiresAtIso: string;
}): Promise<boolean> {
  const url =
    process.env.SUPABASE_URL?.trim() || process.env.VITE_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    console.warn("[activateSupabaseMemberAfterPaidCheckout] Supabase admin not configured");
    return false;
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase
    .from("members")
    .update({
      activated_at: opts.activatedAtIso,
      expires_at: opts.expiresAtIso,
    })
    .eq("id", opts.memberId);

  if (error) {
    console.error("[activateSupabaseMemberAfterPaidCheckout]", error);
    return false;
  }
  return true;
}
