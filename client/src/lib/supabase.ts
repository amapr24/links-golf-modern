import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { MEMBER_POLICIES_ACCEPTED_VERSION } from "@shared/const";
import { normalizeMemberPhotoForUpload } from "./memberPhotoUpload";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

/** Null when env is missing so importing modules (e.g. Home → PricingSection) do not crash the app. */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseKey!)
  : null;

function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.",
    );
  }
  return supabase;
}

/**
 * Member signup data structure
 */
export interface MemberSignupData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  photoFile?: File;
  photoUrl?: string;
}

export interface MemberActivationData {
  memberId: string;
  activatedAt: string; // ISO timestamp
  expiresAt: string; // ISO timestamp (activated_at + 1 year)
}

/**
 * Map Supabase / client errors to a small set for localized UI copy.
 */
export type MemberSignupErrorKind =
  | "generic"
  | "duplicate_email"
  | "photo_upload"
  | "photo_format"
  | "rls";

export function classifyMemberSignupError(err: unknown): MemberSignupErrorKind {
  if (err instanceof Error && err.message === "PHOTO_FORMAT_UNSUPPORTED") {
    return "photo_format";
  }
  const o = err as { message?: string; code?: string };
  const raw = (o?.message || (err instanceof Error ? err.message : "") || "").trim();
  if (raw === "PHOTO_FORMAT_UNSUPPORTED") {
    return "photo_format";
  }
  const m = raw.toLowerCase();
  const code = String(o?.code || "");
  if (code === "23505" || m.includes("23505") || m.includes("duplicate key") || m.includes("unique constraint")) {
    return "duplicate_email";
  }
  if (m.includes("row-level security") || m.includes("new row violates")) {
    return "rls";
  }
  if (m.includes("413") || m.includes("entity too large") || m.includes("payload too large")) {
    return "photo_upload";
  }
  if (
    m.includes("storage") ||
    m.includes("bucket") ||
    m.includes("mime") ||
    m.includes("invalid mime")
  ) {
    return "photo_upload";
  }
  return "generic";
}

/**
 * Upload member photo to Supabase storage (expects a browser File; re-encodes as JPEG when possible).
 */
export async function uploadMemberPhoto(file: File, email: string) {
  const sb = requireSupabase();
  try {
    const normalized = await normalizeMemberPhotoForUpload(file);
    const safeEmail = email
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 72);
    const ext = normalized.type === "image/jpeg" ? "jpg" : (normalized.name.split(".").pop() || "jpg").toLowerCase();
    const fileName = `${safeEmail || "member"}-${Date.now()}.${ext}`;
    const filePath = `member-photos/${fileName}`;

    const { error } = await sb.storage.from("members").upload(filePath, normalized, {
      upsert: false,
      contentType: normalized.type || "image/jpeg",
    });

    if (error) {
      console.error("Error uploading photo:", error);
      throw error;
    }

    // Get public URL
    const { data: publicData } = sb.storage.from("members").getPublicUrl(filePath);

    return publicData?.publicUrl;
  } catch (error) {
    console.error("Failed to upload member photo:", error);
    throw error;
  }
}

/**
 * Save member data to Supabase
 */
export async function saveMemberSignup(data: MemberSignupData) {
  const sb = requireSupabase();
  try {
    let photoUrl = data.photoUrl;

    // Upload photo if provided
    if (data.photoFile) {
      photoUrl = await uploadMemberPhoto(data.photoFile, data.email);
    }

    const { data: result, error } = await sb
      .from("members")
      .insert([
        {
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          address: data.address || null,
          photo_url: photoUrl || null,
          created_at: new Date().toISOString(),
          policies_accepted_version: MEMBER_POLICIES_ACCEPTED_VERSION,
          policies_accepted_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error("Error saving member:", error);
      throw error;
    }

    return result?.[0];
  } catch (error) {
    console.error("Failed to save member signup:", error);
    throw error;
  }
}

/**
 * Update member profile photo URL after post-payment upload.
 */
export async function updateMemberPhotoUrl(memberId: string, photoUrl: string) {
  const sb = requireSupabase();
  const { error } = await sb
    .from("members")
    .update({ photo_url: photoUrl })
    .eq("id", memberId);

  if (error) {
    console.error("Error updating member photo:", error);
    throw error;
  }
}

/**
 * Activate member membership (set activated_at and expires_at on payment success)
 */
export async function activateMembership(data: MemberActivationData) {
  const sb = requireSupabase();
  try {
    const { data: result, error } = await sb
      .from("members")
      .update({
        activated_at: data.activatedAt,
        expires_at: data.expiresAt,
      })
      .eq("id", data.memberId)
      .select();

    if (error) {
      console.error("Error activating membership:", error);
      throw error;
    }

    return result?.[0];
  } catch (error) {
    console.error("Failed to activate membership:", error);
    throw error;
  }
}
