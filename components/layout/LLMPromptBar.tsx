"use client";

import Image from "next/image";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef } from "react";
import { useAppDispatch, useAppStore } from "@/lib/store/hooks";
import { updateModuleConfig } from "@/lib/store/slices/moduleConfigsSlice";
import { addModuleToDashboard } from "@/lib/store/thunks/dashboardThunks";

// Narrow type for the "text" parts that come back from the AI SDK
type TextPart = { type: "text"; text: string };
// The raw message `parts` array can contain other kinds of objects, so we keep this broad
type MessagePart = TextPart | { type: string; text?: string };

type LayoutModuleType = "article-body" | "image" | "pull-quote" | "stat-block" | "ai-output";

interface LayoutModulePosition {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}

interface LayoutModuleSpec {
  id?: string;
  type: LayoutModuleType;
  position?: LayoutModulePosition;
  config?: Record<string, unknown>;
}

interface LayoutDashboardSpec {
  title?: string;
  modules?: LayoutModuleSpec[];
}

interface LayoutResponse {
  version?: string;
  dashboard?: LayoutDashboardSpec;
}

type UnsplashImage = {
  id: string;
  alt: string;
  thumbUrl: string;
  regularUrl: string;
  fullUrl: string;
  photographerName: string;
  photographerUrl: string;
};

// Safely extract the concatenated text from a message coming from the AI SDK
function getMessageText(message: { parts?: unknown[]; content?: unknown }): string {
  if (message.parts && Array.isArray(message.parts)) {
    return (message.parts as MessagePart[])
      .filter((p): p is TextPart => p.type === "text" && "text" in p && typeof p.text === "string")
      .map((p) => p.text)
      .join("");
  }
  if (typeof message.content === "string") return message.content;
  return "";
}

function tryParseLayout(text: string): LayoutResponse | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith("{")) {
    // Some models may wrap JSON in text; attempt to slice to the first/last brace.
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      return null;
    }
    return tryParseLayout(trimmed.slice(firstBrace, lastBrace + 1));
  }

  try {
    const parsed = JSON.parse(trimmed) as LayoutResponse;
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.dashboard || !Array.isArray(parsed.dashboard.modules)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Prompt bar for LLM interaction via AI SDK.
 * Uses /api/chat (streamText + toUIMessageStreamResponse) and displays conversation messages above the input.
 * On finish, attempts to interpret the assistant response as a structured dashboard layout JSON.
 * If parsing fails, falls back to appending the raw text into the first AI Output (`ai-output`) module.
 */
export default function LLMPromptBar() {
  const [input, setInput] = useState("");
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const unsplashImagesRef = useRef<UnsplashImage[]>([]);
  const dispatch = useAppDispatch();
  const store = useAppStore();

  // Hook from the AI SDK that manages chat state and streaming
  const { messages, sendMessage, status } = useChat({
    // Use our Next.js API route as the transport endpoint
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    // Called when the assistant has finished responding (or the stream is closed)
    onFinish: (options) => {
      if (options.isAbort || options.isDisconnect || options.isError) return;

      // Debug: inspect full message structure to understand tool-call responses
      // eslint-disable-next-line no-console
      console.log("[LLM] full message:", JSON.stringify(options.message, null, 2));

      const text = getMessageText(options.message);
      if (!text.trim()) {
        // eslint-disable-next-line no-console
        console.log("[LLM] No text found in message parts - check message structure above");
        return;
      }

      // Debug: inspect raw LLM output text
      // Open browser devtools console to see this.
      // Safe to leave in production, but you can remove when no longer needed.
      // eslint-disable-next-line no-console
      console.log("[LLM] raw message text:", text);

      const state = store.getState();
      const activeId = state.dashboards.activeDashboardId;
      const dash = activeId ? state.dashboards.dashboards[activeId] : null;
      if (!dash || !activeId) return;

      // First, try to interpret the response as a structured layout JSON.
      const layout = tryParseLayout(text);

      // Debug: inspect parsed layout JSON (or null if parsing failed)
      // eslint-disable-next-line no-console
      console.log("[LLM] parsed layout:", layout);
      const allowedTypes: LayoutModuleType[] = [
        "article-body",
        "image",
        "pull-quote",
        "stat-block",
        "ai-output",
      ];

      if (layout?.dashboard?.modules && layout.dashboard.modules.length > 0) {
        const availableUnsplash = unsplashImagesRef.current;
        let unsplashIndex = 0;

        for (const moduleSpec of layout.dashboard.modules) {
          if (!moduleSpec || !moduleSpec.type || !allowedTypes.includes(moduleSpec.type)) {
            continue;
          }

          // Skip image modules unless we have an Unsplash image to assign (avoid LLM-hallucinated or empty URLs)
          const hasUnsplashForThisImage =
            moduleSpec.type === "image" &&
            availableUnsplash.length > 0 &&
            unsplashIndex < availableUnsplash.length;
          if (moduleSpec.type === "image" && !hasUnsplashForThisImage) {
            continue;
          }

          let config = { ...(moduleSpec.config ?? {}) };

          if (hasUnsplashForThisImage) {
            const img = availableUnsplash[unsplashIndex++];
            config = {
              ...config,
              imageUrl: img.regularUrl,
              alt: (config.alt as string) || img.alt || "Dashboard image",
              photographerName: img.photographerName,
              photographerUrl: img.photographerUrl,
            };
          }

          dispatch(
            addModuleToDashboard({
              dashboardId: activeId,
              type: moduleSpec.type,
              position: moduleSpec.position,
              initialConfig: config,
            })
          );
        }
        return;
      }

      // Fallback: behave like before and append plain text into a single ai-output module.
      let listMod = dash.modules.find((m) => m.type === "ai-output");

      // If no ai-output module exists yet, create one on this dashboard
      if (!listMod) {
        const newModuleId = store.dispatch(
          addModuleToDashboard({ dashboardId: activeId, type: "ai-output" })
        );
        listMod = { id: newModuleId, type: "ai-output" };
      }

      const currentConfig = state.moduleConfigs.configs[listMod.id] ?? {};
      const currentItems = Array.isArray(currentConfig.items) ? currentConfig.items : [];

      // Append the new assistant response as another item in the module config
      dispatch(
        updateModuleConfig({
          moduleId: listMod.id,
          config: {
            ...currentConfig,
            items: [{ text: text.trim() }, ...currentItems],
          },
        })
      );
    },
  });

  // Local submit handler that sends the current input to the chat API
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = input.trim();
    if (!prompt) return;

    // Kick off Unsplash search in parallel with the LLM call
    setIsLoadingImages(true);
    setImages([]);
    unsplashImagesRef.current = [];
    void (async () => {
      try {
        const res = await fetch(`/api/unsplash?q=${encodeURIComponent(prompt)}`);
        if (!res.ok) {
          // eslint-disable-next-line no-console
          console.error("Unsplash request failed with status", res.status);
          return;
        }
        const data = (await res.json()) as { images?: UnsplashImage[] };
        if (Array.isArray(data.images)) {
          unsplashImagesRef.current = data.images;
          setImages(data.images);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch Unsplash images", err);
      } finally {
        setIsLoadingImages(false);
      }
    })();

    sendMessage({ text: prompt });
    setInput("");
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 gap-3">
      {/* Prompt input and submit button */}
      <form onSubmit={onSubmit} className="flex items-center gap-2 w-full">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask or prompt..."
          disabled={status === "streaming"}
          className="flex-1 min-w-0 rounded-full border border-slate-300/40 bg-white/40 backdrop-blur px-4 py-2.5 text-sm text-slate-700/90 placeholder-slate-600 outline-none transition focus:border-slate-400/60 focus:ring-2 focus:ring-slate-300/30 disabled:opacity-70"
          aria-label="LLM prompt"
        />
        <button
          type="submit"
          disabled={!input.trim() || status === "streaming"}
          className="shrink-0 rounded-full border border-slate-300/40 bg-white/40 px-4 py-2.5 text-sm font-medium text-slate-700/90 transition hover:bg-white/55 hover:text-slate-900 disabled:opacity-50 disabled:pointer-events-none"
        >
          {status === "streaming" ? "…" : "Send"}
        </button>
      </form>

      {/* Unsplash image suggestions, based on the prompt */}
      <div className="w-full">
        {isLoadingImages && (
          <p className="mt-1 text-xs text-slate-500">Finding images…</p>
        )}
        {/* {!isLoadingImages && images.length > 0 && (
          <div className="mt-2">
            <p className="mb-1 text-xs font-medium text-slate-600">
              Image suggestions from Unsplash
            </p>
            <div className="grid grid-cols-3 gap-2">
              {images.map((img) => (
                <a
                  key={img.id}
                  href={img.photographerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group block relative"
                >
                  <div className="relative w-full h-20">
                    <Image
                      src={img.thumbUrl}
                      alt={img.alt || "Unsplash image"}
                      fill
                      sizes="(max-width: 640px) 33vw, 160px"
                      className="object-cover rounded-md border border-slate-200/60 shadow-sm group-hover:shadow-md transition-shadow"
                    />
                  </div>
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-md bg-black/40 px-1.5 py-0.5 text-[10px] font-medium text-white/90 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                    {img.photographerName}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
}
