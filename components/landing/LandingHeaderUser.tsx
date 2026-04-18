"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function displayNameFromUser(user: {
  email?: string | null;
  user_metadata?: { full_name?: unknown };
}): string {
  const fullName = user.user_metadata?.full_name;
  if (typeof fullName === "string" && fullName.trim()) return fullName.trim();
  return user.email ?? "";
}

export default function LandingHeaderUser() {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    async function syncUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLabel("");
        setSignedIn(false);
        return;
      }
      setLabel(displayNameFromUser(user));
      setSignedIn(true);
    }

    void syncUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void syncUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    setLabel("");
    setSignedIn(false);
    router.refresh();
  }

  if (!signedIn) return null;

  return (
    <div className="flex max-w-[min(100%,320px)] flex-wrap items-center justify-end gap-x-2 gap-y-1 text-sm text-neutral-600">
      <span className="whitespace-nowrap">
        <span className="hidden sm:inline">Logged in as </span>
        <span className="font-semibold text-neutral-900">{label || "User"}</span>
      </span>
      <button
        type="button"
        onClick={() => void handleLogout()}
        className="whitespace-nowrap text-[#1D63ED] underline decoration-[#1D63ED]/30 underline-offset-2 hover:text-[#1557c7]"
      >
        Log out
      </button>
    </div>
  );
}
