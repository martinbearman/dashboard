"use client";

import { useSyncExternalStore } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "./store";
import { loadState } from "./localStorage";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

/** Single store per full page load; survives Strict Mode double-mount. */
let clientStore: AppStore | undefined;

function getOrCreateClientStore(): AppStore {
  if (!clientStore) {
    try {
      clientStore = makeStore(loadState() || undefined);
    } catch (error) {
      console.error("Failed to initialize store with preloaded state:", error);
      try {
        clientStore = makeStore();
      } catch (fallbackError) {
        console.error("Failed to create store:", fallbackError);
        clientStore = makeStore();
      }
    }
  }
  return clientStore;
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

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Avoid useEffect for readiness: after hydration, flip to client without relying on
  // effects (more reliable across Next.js / Strict Mode / extension edge cases).
  const isClient = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  if (!isClient) {
    return <DashboardSkeleton />;
  }

  return <Provider store={getOrCreateClientStore()}>{children}</Provider>;
}
