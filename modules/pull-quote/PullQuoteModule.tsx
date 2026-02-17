"use client";

import type { ModuleProps, PullQuoteModuleConfig } from "@/lib/types/dashboard";

/**
 * Pull-quote module
 *
 * Displays a short highlighted quote with optional attribution, similar to
 * the margin quotes used in magazine layouts.
 */
export default function PullQuoteModule({ moduleId, config }: ModuleProps) {
  const pullQuoteConfig = (config ?? {}) as PullQuoteModuleConfig;
  const { quote, attribution, emphasis = "medium" } = pullQuoteConfig;

  const hasQuote = typeof quote === "string" && quote.trim().length > 0;

  if (!hasQuote) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-4 py-6 text-xs text-slate-500 italic">
        No quote configured.
      </div>
    );
  }

  const bgClass =
    emphasis === "high"
      ? "bg-amber-100/70"
      : emphasis === "low"
      ? "bg-slate-100/70"
      : "bg-sky-100/70";

  const borderClass =
    emphasis === "high"
      ? "border-amber-300"
      : emphasis === "low"
      ? "border-slate-200"
      : "border-sky-200";

  return (
    <div
      className={`flex h-full w-full flex-col justify-center rounded-2xl border ${borderClass} ${bgClass} px-4 py-4`}
    >
      <p className="text-sm leading-relaxed font-medium text-slate-900">
        “{quote.trim()}”
      </p>
      {attribution && (
        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-700">
          {attribution}
        </p>
      )}
    </div>
  );
}

