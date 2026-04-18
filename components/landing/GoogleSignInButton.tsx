"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function GoogleMark() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [userLabel, setUserLabel] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    async function readCurrentUser() {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      const label = user?.email ?? user?.user_metadata?.full_name ?? null;
      setUserLabel(label);
    }

    void readCurrentUser();
  }, []);

  async function handleGoogle() {
    setMessage(null);
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            prompt: "select_account",
          },
        },
      });
      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }
      // Browser follows redirect to Google; loading state may not clear.
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Sign-in failed");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="flex w-full items-center rounded-md border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-[#1D63ED] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-80"
      >
        <span className="flex w-9 shrink-0 justify-start">
          <GoogleMark />
        </span>
        <span className="flex-1 pr-9 text-center">
          {loading ? (
            "Redirecting…"
          ) : userLabel ? (
            <span className="inline-flex min-w-0 max-w-full items-center justify-center gap-1">
              <span>Logged in as</span>
              <span className="max-w-[10ch] truncate">{userLabel}</span>
            </span>
          ) : (
            "Continue with Google"
          )}
        </span>
      </button>
      {message ? <p className="text-center text-sm text-red-600">{message}</p> : null}
    </div>
  );
}
