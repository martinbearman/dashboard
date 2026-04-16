"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { makeStore, type AppStore } from "./store";
import { loadState } from "./localStorage";
import { loadStateFromSupabase, startDebouncedCloudSync } from "./remoteState";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

let clientStore: AppStore | undefined;
let cloudSyncTeardown: (() => void) | null = null;

function subscribe(_onStoreChange: () => void) {
  return () => {};
}
function getClientSnapshot() {
  return true;
}
function getServerSnapshot() {
  return false;
}

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const isClient = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const [store, setStore] = useState<AppStore | null>(clientStore ?? null);

  useEffect(() => {
    if (!isClient || store) return;

    let cancelled = false;

    async function initStore() {
      try {
        const local = loadState() || undefined;
        const supabase = getSupabaseBrowserClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        const preloaded = user
          ? (await loadStateFromSupabase(supabase, user.id)) ?? local
          : local;

        const nextStore = makeStore(preloaded);
        cloudSyncTeardown?.();
        cloudSyncTeardown = null;
        if (user) {
          cloudSyncTeardown = startDebouncedCloudSync(nextStore, supabase, user.id);
        }
        clientStore = nextStore;
        if (!cancelled) setStore(nextStore);
      } catch (error) {
        console.error("Failed to initialize store:", error);
        cloudSyncTeardown?.();
        cloudSyncTeardown = null;
        const fallback = makeStore(loadState() || undefined);
        clientStore = fallback;
        if (!cancelled) setStore(fallback);
      }
    }

    void initStore();
    return () => {
      cancelled = true;
    };
  }, [isClient, store]);

  if (!isClient || !store) return <DashboardSkeleton />;

  return (
    <Provider store={store}>
      {children}
      <Toaster richColors position="bottom-center" />
    </Provider>
  );
}