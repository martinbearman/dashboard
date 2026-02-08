"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import { useAppDispatch, useAppStore } from "@/lib/store/hooks";
import { updateModuleConfig } from "@/lib/store/slices/moduleConfigsSlice";

type TextPart = { type: "text"; text: string };
type MessagePart = TextPart | { type: string; text?: string };

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
 * On finish, appends the assistant response to the first Item List (content-list) module on the active dashboard.
 */
export default function LLMPromptBar() {
  const [input, setInput] = useState("");
  const dispatch = useAppDispatch();
  const store = useAppStore();

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onFinish: (options) => {
      if (options.isAbort || options.isDisconnect || options.isError) return;
      const text = getMessageText(options.message);
      if (!text.trim()) return;

      const state = store.getState();
      const activeId = state.dashboards.activeDashboardId;
      const dash = activeId ? state.dashboards.dashboards[activeId] : null;
      const listMod = dash?.modules.find((m) => m.type === "content-list");
      if (!listMod) return;

      const currentConfig = state.moduleConfigs.configs[listMod.id] ?? {};
      const currentItems = Array.isArray(currentConfig.items) ? currentConfig.items : [];
      //const title = currentConfig.title ?? "Item List";
      dispatch(
        updateModuleConfig({
          moduleId: listMod.id,
          config: {
            ...currentConfig,
            //title,
            items: [...currentItems, { text: text.trim() }],
          },
        })
      );
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 gap-3">

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
