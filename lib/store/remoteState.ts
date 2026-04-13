import { SupabaseClient } from "@supabase/supabase-js";
import { RootState } from "./store";

export type SupabaseStateLoadResult = {
  state: Partial<RootState> | null;
  /** True when a row existed for this user (even if `state` is null). */
  rowFound: boolean;
};

export async function loadStateFromSupabase(
  supabase: SupabaseClient,
  userId: string
): Promise<SupabaseStateLoadResult> {
  const { data, error } = await supabase
    .from("user_dashboard_state")
    .select("state")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.warn("Failed to load state from Supabase:", error.message);
    return { state: null, rowFound: false };
  }
  if (!data) {
    return { state: null, rowFound: false };
  }
  return {
    state: (data.state as Partial<RootState> | null) ?? null,
    rowFound: true,
  };
}