import { createClient, type SupabaseClient } from "@supabase/supabase-js";

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
 * Upload member photo to Supabase storage
 */
export async function uploadMemberPhoto(file: File, email: string) {
  const sb = requireSupabase();
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${email}-${Date.now()}.${fileExt}`;
    const filePath = `member-photos/${fileName}`;

    const { data, error } = await sb.storage
      .from("members")
      .upload(filePath, file, { upsert: false });

    if (error) {
      console.error("Error uploading photo:", error);
      throw error;
    }

    // Get public URL
    const { data: publicData } = sb.storage
      .from("members")
      .getPublicUrl(filePath);

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
