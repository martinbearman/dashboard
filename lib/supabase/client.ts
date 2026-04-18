import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | undefined;

/**
 * Whether dashboard state is loaded from and saved to Supabase.
 * Defaults to on only for production builds so `next dev` and tests use localStorage only
 * and cannot overwrite your live project. Set NEXT_PUBLIC_CLOUD_SYNC=true to exercise
 * cloud sync locally (prefer a separate Supabase dev project). Set false to disable sync
 * for a local production build (e.g. next start) if it still points at production.
 */
export function isCloudDashboardSyncEnabled(): boolean {
  const explicit = process.env.NEXT_PUBLIC_CLOUD_SYNC;
  if (explicit === "false" || explicit === "0") return false;
  if (explicit === "true" || explicit === "1") return true;
  return process.env.NODE_ENV === "production";
}

/** Singleton browser client for Client Components. */
export function getSupabaseBrowserClient(): SupabaseClient {
  if (!browserClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    }
    browserClient = createClient(url, anonKey);
  }
  return browserClient;
}
