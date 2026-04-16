import { SupabaseClient } from "@supabase/supabase-js";
import { RootState } from "./store";
import {
  CLOUD_SYNC_DEBOUNCE_MS,
  DASHBOARD_LOCAL_STORAGE_KEY,
  USER_DASHBOARD_STATE_TABLE,
} from "@/lib/constants/store";

export async function loadStateFromSupabase(
    supabase: SupabaseClient, 
    userId: string
): Promise<Partial<RootState> | null> {
  const { data, error } = await supabase
    .from(USER_DASHBOARD_STATE_TABLE)
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
    const { error } = await supabase.from(USER_DASHBOARD_STATE_TABLE).upsert({
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

async function syncStateToSupabase(
  supabase: SupabaseClient,
  userId: string,
  state: RootState
): Promise<boolean> {
  const { error } = await supabase.from(USER_DASHBOARD_STATE_TABLE).upsert({
    user_id: userId,
    state,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    console.warn("Failed syncing local dashboard state to Supabase:", error.message);
    return false;
  }
  return true;
}

type StoreLike = {
  getState: () => RootState;
  subscribe: (listener: () => void) => () => void;
};

type DebouncedCloudSyncOptions = {
  failureThreshold?: number;
  failureCooldownMs?: number;
  onRepeatedFailures?: (failureCount: number) => void;
  onStatusChange?: (status: "pending" | "synced" | "error") => void;
};

export function startDebouncedCloudSync(
  store: StoreLike,
  supabase: SupabaseClient,
  userId: string,
  options?: DebouncedCloudSyncOptions
): { stop: () => void; flushNow: () => Promise<void> } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastSyncedSerialized = JSON.stringify(store.getState());
  let syncInFlight = false;
  let needsResync = false;
  let consecutiveFailures = 0;
  let lastFailureNoticeAt = 0;

  const failureThreshold = options?.failureThreshold ?? 3;
  const failureCooldownMs = options?.failureCooldownMs ?? 60000;

  const clearTimer = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const flush = async () => {
    const state = store.getState();
    const serialized = JSON.stringify(state);
    if (serialized === lastSyncedSerialized) {
      return;
    }
    if (syncInFlight) {
      needsResync = true;
      return;
    }

    syncInFlight = true;
    const success = await syncStateToSupabase(supabase, userId, state);
    syncInFlight = false;

    if (success) {
      lastSyncedSerialized = serialized;
      consecutiveFailures = 0;
      options?.onStatusChange?.("synced");
    } else {
      consecutiveFailures += 1;
      options?.onStatusChange?.("error");
      const now = Date.now();
      if (
        consecutiveFailures >= failureThreshold &&
        now - lastFailureNoticeAt >= failureCooldownMs
      ) {
        lastFailureNoticeAt = now;
        options?.onRepeatedFailures?.(consecutiveFailures);
      }
    }
    if (needsResync) {
      needsResync = false;
      clearTimer();
      timeoutId = setTimeout(() => {
        void flush();
      }, CLOUD_SYNC_DEBOUNCE_MS);
    }
  };

  const unsubscribe = store.subscribe(() => {
    options?.onStatusChange?.("pending");
    clearTimer();
    timeoutId = setTimeout(() => {
      void flush();
    }, CLOUD_SYNC_DEBOUNCE_MS);
  });

  const stop = () => {
    clearTimer();
    unsubscribe();
  };

  const flushNow = async () => {
    clearTimer();
    await flush();
  };

  return { stop, flushNow };
}