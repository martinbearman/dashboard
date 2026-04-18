"use client";

import { getSupabaseBrowserClient, isCloudDashboardSyncEnabled } from "@/lib/supabase/client";
import { DASHBOARD_LOCAL_STORAGE_KEY } from "@/lib/constants/store";
import { syncLocalStateToSupabase } from "@/lib/store/remoteState";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
const MISSING_AUTH_CODE_MESSAGE =
  "Missing authorization code. Check the browser address bar: you should see ?code= after redirect. " +
  "Confirm Supabase Redirect URLs include this exact origin and /auth/callback.";

function parseOAuthParams() {
  if (typeof window === "undefined") {
    return { search: new URLSearchParams(), hash: new URLSearchParams() };
  }
  const url = new URL(window.location.href);
  const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
  return { search: url.searchParams, hash: hashParams };
}

export default function AuthCallbackClient() {
  const router = useRouter();
  const [status, setStatus] = useState<"working" | "error">("working");
  const [detail, setDetail] = useState<string | null>(null);
  const [dashboardLoadingCopy] = useState(() => {
    if (typeof window === "undefined") {
      return "Creating your dashboard...";
    }
    try {
      return localStorage.getItem(DASHBOARD_LOCAL_STORAGE_KEY)
        ? "Generating your dashboard..."
        : "Creating your dashboard...";
    } catch {
      return "Creating your dashboard...";
    }
  });
  const isPreviewMode =
    process.env.NODE_ENV === "development" &&
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("preview") === "1";

  useEffect(() => {
    if (isPreviewMode) return;

    let cancelled = false;

    async function finish() {
      const supabase = getSupabaseBrowserClient();
      const fail = (message: string) => {
        setStatus("error");
        setDetail(message);
      };
      const getCurrentSession = async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        return session;
      };
      const completeSignIn = async (userId: string) => {
        if (isCloudDashboardSyncEnabled()) {
          await syncLocalStateToSupabase(supabase, userId);
        }
        if (!cancelled) {
          router.replace("/dashboard");
        }
      };

      // Let the client consume PKCE / URL auth params (more reliable than useSearchParams alone).
      const { error: initError } = await supabase.auth.initialize();
      if (cancelled) return;
      if (initError) {
        fail(initError.message);
        return;
      }

      const afterInit = await getCurrentSession();
      if (cancelled) return;
      if (afterInit) {
        await completeSignIn(afterInit.user.id);
        return;
      }

      const { search, hash } = parseOAuthParams();

      const oauthError = search.get("error") ?? hash.get("error");
      const oauthDescription = search.get("error_description") ?? hash.get("error_description");
      if (oauthError) {
        fail(oauthDescription ?? oauthError);
        return;
      }

      const code = search.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;
        if (error) {
          fail(error.message);
          return;
        }
        const afterExchange = await getCurrentSession();
        if (cancelled) return;
        if (afterExchange) {
          await completeSignIn(afterExchange.user.id);
          return;
        }
      }

      // Implicit-style tokens in hash (older / alternate flows)
      if (hash.get("access_token")) {
        const session = await getCurrentSession();
        if (cancelled) return;
        if (session) {
          await completeSignIn(session.user.id);
          return;
        }
      }

      if (process.env.NODE_ENV === "development") {
        const url = typeof window !== "undefined" ? new URL(window.location.href) : null;
        console.debug("[auth/callback] No session after init; URL diagnostics", {
          hasSearch: url ? url.search.length > 1 : false,
          hasHash: url ? url.hash.length > 1 : false,
          searchKeys: url ? [...url.searchParams.keys()] : [],
          hashKeys: url ? [...new URLSearchParams(url.hash.replace(/^#/, "")).keys()] : [],
        });
      }

      fail(MISSING_AUTH_CODE_MESSAGE);
    }

    void finish();
    return () => {
      cancelled = true;
    };
  }, [isPreviewMode, router]);

  if (status === "error") {
    return (
      <div className="mx-auto flex min-h-[40vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-lg font-semibold text-slate-900">Couldn&apos;t complete sign-in</p>
        <p className="text-sm text-slate-600">{detail}</p>
        <button
          type="button"
          onClick={() => router.replace("/")}
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
        >
          Back to home
        </button>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-600 to-blue-100 px-4 text-center">
      <p className="text-sm font-medium text-slate-100">{dashboardLoadingCopy}</p>
      <div
        className="mt-3 h-6 w-6 animate-spin rounded-full border-2 border-slate-200/70 border-t-transparent"
        aria-label="Loading"
      />
    </main>
  );
}
