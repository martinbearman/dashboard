"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Provider } from "react-redux";
import { Toaster, toast } from "sonner";
import { makeStore, type AppStore } from "./store";
import { loadState } from "./localStorage";
import { loadStateFromSupabase, startDebouncedCloudSync } from "./remoteState";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

let clientStore: AppStore | undefined;
let cloudSyncController: { stop: () => void; flushNow: () => Promise<void> } | null = null;
let currentCloudSyncUserId: string | null = null;

function stopCloudSync() {
  cloudSyncController?.stop();
  cloudSyncController = null;
  currentCloudSyncUserId = null;
}

function startCloudSyncForUser(userId: string, store: AppStore) {
  const supabase = getSupabaseBrowserClient();
  if (currentCloudSyncUserId === userId && cloudSyncController) {
    return;
  }
  stopCloudSync();
  cloudSyncController = startDebouncedCloudSync(store, supabase, userId, {
    failureThreshold: 3,
    failureCooldownMs: 60000,
    onRepeatedFailures: () => {
      toast.error("Cloud sync is failing", {
        description:
          "Changes are still saved locally. We will keep retrying cloud sync in the background.",
      });
    },
    onStatusChange: (status) => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("dashboard-cloud-sync-status", { detail: status }));
      }
    },
  });
  currentCloudSyncUserId = userId;
}

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
  const [isCloudSyncEnabled, setIsCloudSyncEnabled] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<"pending" | "synced" | "error">("synced");

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
        if (user) {
          startCloudSyncForUser(user.id, nextStore);
          setIsCloudSyncEnabled(true);
          setCloudSyncStatus("synced");
        } else {
          stopCloudSync();
          setIsCloudSyncEnabled(false);
          setCloudSyncStatus("synced");
        }
        clientStore = nextStore;
        if (!cancelled) setStore(nextStore);
      } catch (error) {
        console.error("Failed to initialize store:", error);
        stopCloudSync();
        setIsCloudSyncEnabled(false);
        setCloudSyncStatus("synced");
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

  useEffect(() => {
    if (!isClient) return;

    const handleCloudSyncStatus = (event: Event) => {
      const detail = (event as CustomEvent<"pending" | "synced" | "error">).detail;
      if (detail) {
        setCloudSyncStatus(detail);
      }
    };

    const flushCloudState = () => {
      void cloudSyncController?.flushNow();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushCloudState();
      }
    };

    window.addEventListener("pagehide", flushCloudState);
    window.addEventListener("dashboard-cloud-sync-status", handleCloudSyncStatus as EventListener);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", flushCloudState);
      window.removeEventListener("dashboard-cloud-sync-status", handleCloudSyncStatus as EventListener);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isClient]);

  useEffect(() => {
    if (!isClient || !store) return;

    const supabase = getSupabaseBrowserClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const userId = session?.user?.id ?? null;
      if (userId) {
        startCloudSyncForUser(userId, store);
        setIsCloudSyncEnabled(true);
        setCloudSyncStatus("synced");
      } else {
        stopCloudSync();
        setIsCloudSyncEnabled(false);
        setCloudSyncStatus("synced");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isClient, store]);

  if (!isClient || !store) return <DashboardSkeleton />;

  const statusText = !isCloudSyncEnabled
    ? "Saved locally"
    : cloudSyncStatus === "pending"
      ? "Syncing..."
      : cloudSyncStatus === "error"
        ? "Saved locally"
        : "Saved";
  const statusDotClass = !isCloudSyncEnabled
    ? "bg-slate-400"
    : cloudSyncStatus === "pending"
      ? "bg-amber-400"
      : cloudSyncStatus === "error"
        ? "bg-rose-500"
        : "bg-emerald-500";

  return (
    <Provider store={store}>
      {children}
      <Toaster richColors position="bottom-center" />
    </Provider>
  );
}