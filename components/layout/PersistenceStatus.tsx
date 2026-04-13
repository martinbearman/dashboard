"use client";

import { useCallback, useEffect, useState } from "react";
import { usePersistenceSource } from "@/lib/store/persistenceContext";
import { getLastCloudSyncTimestamp } from "@/lib/store/persistenceMeta";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function formatSyncTime(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

/**
 * Shows whether the dashboard was hydrated from Supabase or localStorage, and
 * reminds that ongoing edits are persisted locally (DB is updated on sign-in only).
 */
export default function PersistenceStatus() {
  const { initialDataSource } = usePersistenceSource();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [lastCloudSync, setLastCloudSync] = useState<string | null>(null);

  const refreshMeta = useCallback(() => {
    setLastCloudSync(getLastCloudSyncTimestamp());
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function readAuth() {
      try {
        const supabase = getSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!cancelled) setAuthenticated(Boolean(user));
      } catch {
        if (!cancelled) setAuthenticated(false);
      }
    }

    void readAuth();
    refreshMeta();

    const supabase = getSupabaseBrowserClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(Boolean(session?.user));
      refreshMeta();
    });

    const onFocus = () => refreshMeta();
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      window.removeEventListener("focus", onFocus);
    };
  }, [refreshMeta]);

  const lastSyncLabel = formatSyncTime(lastCloudSync);
  const dev = process.env.NODE_ENV === "development";
  const showMissingUploadHint =
    authenticated === true && !lastSyncLabel && initialDataSource !== "cloud";

  let headline: string;
  if (authenticated === false) {
    headline =
      initialDataSource === "empty"
        ? "New session · saved in this browser"
        : "Saved in this browser only";
  } else if (authenticated === true) {
    if (initialDataSource === "cloud") {
      headline = "Layout loaded from your account";
    } else if (initialDataSource === "local") {
      headline = "Signed in · layout from this device";
    } else {
      headline = "Signed in · new layout (this browser)";
    }
  } else {
    headline = "Checking storage…";
  }

  const detail =
    authenticated === false
      ? "Sign in to store a copy in the cloud. Edits are saved in this browser."
      : "Edits are saved in this browser. The cloud copy is updated when you complete sign-in.";

  const title = [
    headline,
    detail,
    lastSyncLabel
      ? `Last cloud upload: ${lastSyncLabel}`
      : initialDataSource === "cloud"
        ? "Account has saved data; exact upload time appears after the next sign-in sync."
        : "No cloud upload recorded yet (sign in with local data to sync).",
    dev ? `Debug: initial source = ${initialDataSource}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return (
    <div
      className="fixed bottom-2 left-1/2 z-50 max-w-[min(22rem,calc(100vw-1rem))] -translate-x-1/2 cursor-default rounded-md border border-slate-600/40 bg-slate-900/85 px-2.5 py-1.5 text-left text-[11px] leading-snug text-slate-200 shadow-md backdrop-blur-sm pointer-events-auto"
      title={title}
    >
      <p className="font-medium text-slate-100">{headline}</p>
      <p className="mt-0.5 text-slate-400">{detail}</p>
      {lastSyncLabel ? (
        <p className="mt-1 font-mono text-[10px] text-slate-500">Cloud upload: {lastSyncLabel}</p>
      ) : showMissingUploadHint ? (
        <p className="mt-1 text-[10px] text-slate-500">No cloud upload logged in this browser yet</p>
      ) : authenticated === true && initialDataSource === "cloud" ? (
        <p className="mt-1 text-[10px] text-slate-500">Using account data from the cloud</p>
      ) : null}
      {dev ? (
        <p className="mt-1 border-t border-slate-700 pt-1 font-mono text-[10px] text-amber-200/90">
          dev · initial: {initialDataSource}
        </p>
      ) : null}
    </div>
  );
}
