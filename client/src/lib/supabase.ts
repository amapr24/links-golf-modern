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
  photoUrl?: string;
}

/**
 * Save member data to Supabase
 */
export async function saveMemberSignup(data: MemberSignupData) {
  try {
    const { data: result, error } = await supabase
      .from("members")
      .insert([
        {
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          photo_url: data.photoUrl,
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
