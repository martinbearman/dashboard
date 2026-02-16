"use client";

import { useState } from "react";
import { useAppDispatch, useAppStore } from "@/lib/store/hooks";
import { addModuleToDashboard } from "@/lib/store/thunks/dashboardThunks";
import { computeGridSizeForModule } from "@/lib/utils/gridLayout";

type UnsplashImage = {
  id: string;
  width: number;
  height: number;
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
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const store = useAppStore();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = input.trim();
    if (!prompt) return;

    setIsLoadingImages(true);
    setError(null);
    setInput("");

    void (async () => {
      try {
        const res = await fetch(`/api/unsplash?q=${encodeURIComponent(prompt)}`);
        if (!res.ok) {
          // Try to parse error message from response
          let errorMessage = "Failed to search for images";
          try {
            const errorData = (await res.json()) as {
              error?: string;
              message?: string;
              resetAt?: string;
            };
            errorMessage = errorData.message || errorData.error || errorMessage;
            
            // Format reset time if available
            if (errorData.resetAt && res.status === 429) {
              const resetDate = new Date(errorData.resetAt);
              const now = new Date();
              const secondsUntilReset = Math.ceil((resetDate.getTime() - now.getTime()) / 1000);
              const minutesUntilReset = Math.ceil(secondsUntilReset / 60);
              
              if (minutesUntilReset > 0) {
                errorMessage = `Rate limit exceeded. Please try again in ${minutesUntilReset} minute${minutesUntilReset > 1 ? 's' : ''}.`;
              } else {
                errorMessage = `Rate limit exceeded. Please try again in ${secondsUntilReset} second${secondsUntilReset > 1 ? 's' : ''}.`;
              }
            }
          } catch {
            // If JSON parsing fails, use default message
            if (res.status === 429) {
              errorMessage = "Too many requests. Please wait a moment and try again.";
            }
          }
          
          setError(errorMessage);
          setIsLoadingImages(false);
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

        const gridParams = state.ui.gridContainerParams ?? undefined;

        for (const img of data.images) {
          const altText = img.alt ? capitalizeFirst(img.alt) : undefined;

          const { w, h } = computeGridSizeForModule(
            "image",
            {
              kind: "image",
              width: img.width,
              height: img.height,
            },
            gridParams
          );

          dispatch(
            addModuleToDashboard({
              dashboardId: activeId,
              type: "image",
              position: { w, h },
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
        
        setIsLoadingImages(false);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch Unsplash images", err);
        setError("Failed to search for images. Please try again.");
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
          onChange={(e) => {
            setInput(e.target.value);
            if (error) setError(null); // Clear error when user starts typing
          }}
          placeholder={error || "Search for images..."}
          disabled={isLoadingImages}
          className={`flex-1 min-w-0 rounded-full border bg-white/40 backdrop-blur px-4 py-2.5 text-sm outline-none transition disabled:opacity-70 ${
            error
              ? "border-red-400/60 text-red-700 placeholder-red-600 focus:border-red-500/60 focus:ring-2 focus:ring-red-300/30"
              : "border-slate-300/40 text-slate-700/90 placeholder-slate-600 focus:border-slate-400/60 focus:ring-2 focus:ring-slate-300/30"
          }`}
          aria-label="Search Unsplash images"
          aria-invalid={error ? "true" : "false"}
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
        <div className="flex items-center justify-center w-full">
          <div
            className="h-5 w-5 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin"
            aria-label="Finding images"
          />
        </div>
      )}
    </div>
  );
}
