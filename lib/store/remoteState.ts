import { SupabaseClient } from "@supabase/supabase-js";
import { RootState } from "./store";

export async function loadStateFromSupabase(
    supabase: SupabaseClient, 
    userId: string
): Promise<Partial<RootState> | null> {
  const { data, error } = await supabase
    .from("user_dashboard_state")
    .select("state")
    .eq("user_id", userId)
    .maybeSingle();
  
if (error) {
    console.warn("Failed to load state from Supabase:", error.message);
    return null;
  }
  return data?.state as Partial<RootState> | null;
}