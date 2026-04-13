"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { makeStore, type AppStore, type RootState } from "./store";
import { loadState } from "./localStorage";
import { loadStateFromSupabase } from "./remoteState";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import {
  PersistenceContextProvider,
  type InitialDataSource,
} from "./persistenceContext";

type ClientStoreBundle = { store: AppStore; initialDataSource: InitialDataSource };
let clientBundle: ClientStoreBundle | undefined;

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
  const [bundle, setBundle] = useState<ClientStoreBundle | null>(() => clientBundle ?? null);

  useEffect(() => {
    if (!isClient || bundle) return;

    let cancelled = false;

    async function initStore() {
      try {
        const local = loadState() || undefined;
        const supabase = getSupabaseBrowserClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        let initialDataSource: InitialDataSource;
        let preloaded: Partial<RootState> | undefined;

        if (!user) {
          preloaded = local;
          initialDataSource = local ? "local" : "empty";
        } else {
          const remote = await loadStateFromSupabase(supabase, user.id);
          preloaded = remote.state ?? local;
          const usedCloud = remote.rowFound && remote.state != null;
          if (usedCloud) {
            initialDataSource = "cloud";
          } else {
            initialDataSource = local ? "local" : "empty";
          }
        }

        const nextStore = makeStore(preloaded);
        const nextBundle = { store: nextStore, initialDataSource };
        clientBundle = nextBundle;
        if (!cancelled) setBundle(nextBundle);
      } catch (error) {
        console.error("Failed to initialize store:", error);
        const localFallback = loadState() || undefined;
        const fallbackStore = makeStore(localFallback);
        const nextBundle: ClientStoreBundle = {
          store: fallbackStore,
          initialDataSource: localFallback ? "local" : "empty",
        };
        clientBundle = nextBundle;
        if (!cancelled) setBundle(nextBundle);
      }
    }

    void initStore();
    return () => {
      cancelled = true;
    };
  }, [isClient, bundle]);

  if (!isClient || !bundle) return <DashboardSkeleton />;

  return (
    <PersistenceContextProvider initialDataSource={bundle.initialDataSource}>
      <Provider store={bundle.store}>
        {children}
        <Toaster richColors position="bottom-center" />
      </Provider>
    </PersistenceContextProvider>
  );
}