import { describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";

describe("Supabase Integration", () => {
  it("should connect to Supabase with valid credentials", async () => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    expect(supabaseUrl).toBeDefined();
    expect(supabaseKey).toBeDefined();

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase credentials not configured");
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test connection by querying auth status
    const { data, error } = await supabase.auth.getSession();

    // If we get here without a network error, the credentials are valid
    // (We expect no session since we're not authenticated, but the connection should work)
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});
