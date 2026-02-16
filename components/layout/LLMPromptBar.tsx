"use client";

import { useState } from "react";
import { useAppDispatch, useAppStore } from "@/lib/store/hooks";
import { addModuleToDashboard } from "@/lib/store/thunks/dashboardThunks";

type UnsplashImage = {
  id: string;
  alt: string;
  thumbUrl: string;
  regularUrl: string;
  fullUrl: string;
  photographerName: string;
  photographerUrl: string;
};

/**
 * Capitalizes the first letter of a string.
 */
function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Search bar for Unsplash images.
 * Disables the LLM and uses the input to search Unsplash, then adds results as image modules to the dashboard.
 */
export default function LLMPromptBar() {
  const [input, setInput] = useState("");
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const dispatch = useAppDispatch();
  const store = useAppStore();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = input.trim();
    if (!prompt) return;

    setIsLoadingImages(true);
    setInput("");

    void (async () => {
      try {
        const res = await fetch(`/api/unsplash?q=${encodeURIComponent(prompt)}`);
        if (!res.ok) {
          // eslint-disable-next-line no-console
          console.error("Unsplash request failed with status", res.status);
          return;
        }
        const data = (await res.json()) as { images?: UnsplashImage[] };
        if (!Array.isArray(data.images) || data.images.length === 0) {
          setIsLoadingImages(false);
          return;
        }

        const state = store.getState();
        const activeId = state.dashboards.activeDashboardId;
        if (!activeId) {
          setIsLoadingImages(false);
          return;
        }

        for (const img of data.images) {
          const altText = img.alt ? capitalizeFirst(img.alt) : undefined;
          dispatch(
            addModuleToDashboard({
              dashboardId: activeId,
              type: "image",
              initialConfig: {
                imageUrl: img.regularUrl,
                alt: altText || "Unsplash image",
                caption: altText || undefined,
                photographerName: img.photographerName,
                photographerUrl: img.photographerUrl,
              },
            })
          );
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch Unsplash images", err);
      } finally {
        setIsLoadingImages(false);
      }
    })();
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 gap-3">
      <form onSubmit={onSubmit} className="flex items-center gap-2 w-full">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search for images..."
          disabled={isLoadingImages}
          className="flex-1 min-w-0 rounded-full border border-slate-300/40 bg-white/40 backdrop-blur px-4 py-2.5 text-sm text-slate-700/90 placeholder-slate-600 outline-none transition focus:border-slate-400/60 focus:ring-2 focus:ring-slate-300/30 disabled:opacity-70"
          aria-label="Search Unsplash images"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoadingImages}
          className="shrink-0 rounded-full border border-slate-300/40 bg-white/40 px-4 py-2.5 text-sm font-medium text-slate-700/90 transition hover:bg-white/55 hover:text-slate-900 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLoadingImages ? "…" : "Search"}
        </button>
      </form>

      {isLoadingImages && (
        <p className="w-full text-xs text-slate-500">Finding images…</p>
      )}
    </div>
  );
}
