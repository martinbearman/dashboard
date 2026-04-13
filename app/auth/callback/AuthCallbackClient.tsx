"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      const supabase = getSupabaseBrowserClient();

      // Let the client consume PKCE / URL auth params (more reliable than useSearchParams alone).
      const { error: initError } = await supabase.auth.initialize();
      if (cancelled) return;
      if (initError) {
        setStatus("error");
        setDetail(initError.message);
        return;
      }

      const {
        data: { session: afterInit },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      if (afterInit) {
        router.replace("/dashboard");
        return;
      }

      const { search, hash } = parseOAuthParams();

      const oauthError = search.get("error") ?? hash.get("error");
      const oauthDescription = search.get("error_description") ?? hash.get("error_description");
      if (oauthError) {
        setStatus("error");
        setDetail(oauthDescription ?? oauthError);
        return;
      }

      const code = search.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;
        if (error) {
          setStatus("error");
          setDetail(error.message);
          return;
        }
        router.replace("/dashboard");
        return;
      }

      // Implicit-style tokens in hash (older / alternate flows)
      if (hash.get("access_token")) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (cancelled) return;
        if (session) {
          router.replace("/dashboard");
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

      setStatus("error");
      setDetail(
        "Missing authorization code. Check the browser address bar: you should see ?code= after redirect. " +
          "Confirm Supabase Redirect URLs include this exact origin and /auth/callback.",
      );
    }

    void finish();
    return () => {
      cancelled = true;
    };
  }, [router]);

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
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 px-4 text-slate-600">
      <p className="text-sm">Finishing sign-in…</p>
    </div>
  );
}
