import { SupabaseClient } from "@supabase/supabase-js";
import { RootState } from "./store";

const DASHBOARD_LOCAL_STORAGE_KEY = "dashboard-state";

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

export async function syncLocalStateToSupabase(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const raw = localStorage.getItem(DASHBOARD_LOCAL_STORAGE_KEY);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    const { error } = await supabase.from("user_dashboard_state").upsert({
      user_id: userId,
      state: parsed,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.warn("Failed syncing local dashboard state to Supabase:", error.message);
    }
  } catch (error) {
    console.warn("Skipping dashboard sync because localStorage state is invalid JSON:", error);
  }
}