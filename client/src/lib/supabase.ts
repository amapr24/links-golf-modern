import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL and key are required");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

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
  memberId: number;
  activatedAt: string; // ISO timestamp
  expiresAt: string;   // ISO timestamp (activated_at + 1 year)
}

/**
 * Upload member photo to Supabase storage
 */
export async function uploadMemberPhoto(file: File, email: string) {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${email}-${Date.now()}.${fileExt}`;
    const filePath = `member-photos/${fileName}`;

    const { data, error } = await supabase.storage
      .from("members")
      .upload(filePath, file, { upsert: false });

    if (error) {
      console.error("Error uploading photo:", error);
      throw error;
    }

    // Get public URL
    const { data: publicData } = supabase.storage
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
  try {
    let photoUrl = data.photoUrl;

    // Upload photo if provided
    if (data.photoFile) {
      photoUrl = await uploadMemberPhoto(data.photoFile, data.email);
    }

    const { data: result, error } = await supabase
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
 * Activate member membership (set activated_at and expires_at on payment success)
 */
export async function activateMembership(data: MemberActivationData) {
  try {
    const { data: result, error } = await supabase
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
