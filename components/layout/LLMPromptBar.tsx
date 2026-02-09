"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import { useAppDispatch, useAppStore } from "@/lib/store/hooks";
import { updateModuleConfig } from "@/lib/store/slices/moduleConfigsSlice";
import { addModuleToDashboard } from "@/lib/store/thunks/dashboardThunks";

// Narrow type for the "text" parts that come back from the AI SDK
type TextPart = { type: "text"; text: string };
// The raw message `parts` array can contain other kinds of objects, so we keep this broad
type MessagePart = TextPart | { type: string; text?: string };

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

/**
 * Prompt bar for LLM interaction via AI SDK.
 * Uses /api/chat (streamText + toUIMessageStreamResponse) and displays conversation messages above the input.
 * On finish, appends the assistant response to the first AI Output (`ai-output`) module on the active dashboard.
 */
export default function LLMPromptBar() {
  const [input, setInput] = useState("");
  const dispatch = useAppDispatch();
  const store = useAppStore();

  // Hook from the AI SDK that manages chat state and streaming
  const { messages, sendMessage, status } = useChat({
    // Use our Next.js API route as the transport endpoint
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    // Called when the assistant has finished responding (or the stream is closed)
    onFinish: (options) => {
      if (options.isAbort || options.isDisconnect || options.isError) return;
      const text = getMessageText(options.message);
      if (!text.trim()) return;

      const state = store.getState();
      const activeId = state.dashboards.activeDashboardId;
      const dash = activeId ? state.dashboards.dashboards[activeId] : null;
      if (!dash || !activeId) return;

      // Find the first AI output module on the active dashboard
      let listMod = dash?.modules.find((m) => m.type === "ai-output");


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
            items: [...currentItems, { text: text.trim() }],
          },
        })
      );
    },
  });

  // Local submit handler that sends the current input to the chat API
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
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
    </div>
  );
}
