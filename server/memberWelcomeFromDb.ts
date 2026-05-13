import { createClient } from "@supabase/supabase-js";

function memberNumberFromId(id: string): string {
  return `LGM-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

/**
 * Loads member display fields for the welcome email using the service role.
 * Returns null when Supabase admin is not configured or the row does not match email.
 */
export async function fetchMemberWelcomeFields(
  memberId: string,
  email: string
): Promise<{ firstName: string; memberNumber: string } | null> {
  const url =
    process.env.SUPABASE_URL?.trim() || process.env.VITE_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from("members")
    .select("id, first_name, email")
    .eq("id", memberId)
    .maybeSingle();

  if (error || !data?.email || !data.first_name) return null;
  if (data.email.toLowerCase() !== email.toLowerCase()) return null;

  return {
    firstName: data.first_name,
    memberNumber: memberNumberFromId(data.id),
  };
}
