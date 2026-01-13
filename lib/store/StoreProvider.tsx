"use client";

import { useEffect, useRef, useState } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore, RootState } from "./store";
import { loadState } from "./localStorage";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!storeRef.current) {
      try {
        // Create the store on the client with preloaded state to avoid SSR/CSR mismatches
        const preloaded = loadState() || undefined;
        storeRef.current = makeStore(preloaded);
      } catch (error) {
        // If loading state fails, create store without preloaded state as fallback
        console.error("Failed to initialize store with preloaded state:", error);
        try {
          storeRef.current = makeStore();
        } catch (fallbackError) {
          // If even creating a basic store fails, log and create anyway
          console.error("Failed to create store:", fallbackError);
          storeRef.current = makeStore();
        }
      }
    }
    // Always set ready to true, even if there was an error
    // This prevents the app from hanging on the skeleton screen
    setReady(true);
  }, []);

  if (!ready || !storeRef.current) return <DashboardSkeleton />;

  return <Provider store={storeRef.current}>{children}</Provider>;
}