"use client";

import { useState } from "react";

/**
 * Prompt bar for LLM interaction (AI SDK integration to be added).
 * Renders an input and submit button, placed under DashboardTabs.
 */
export default function LLMPromptBar() {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    // TODO: call LLM via AI SDK
    setValue("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 w-full max-w-2xl mx-auto px-4"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ask or prompt..."
        className="flex-1 min-w-0 rounded-full border border-slate-300/40 bg-white/40 backdrop-blur px-4 py-2.5 text-sm text-slate-700/90 placeholder-slate-600 outline-none transition focus:border-slate-400/60 focus:ring-2 focus:ring-slate-300/30"
        aria-label="LLM prompt"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="shrink-0 rounded-full border border-slate-300/40 bg-white/40 px-4 py-2.5 text-sm font-medium text-slate-700/90 transition hover:bg-white/55 hover:text-slate-900 disabled:opacity-50 disabled:pointer-events-none"
      >
        Send
      </button>
    </form>
  );
}
