"use client";

import type { ModuleProps, StatBlockModuleConfig } from "@/lib/types/dashboard";

/**
 * Stat-block module
 *
 * Shows a compact list of key numbers/specs (label + value pairs), similar to
 * a spec box in a magazine layout.
 */
export default function StatBlockModule({ moduleId, config }: ModuleProps) {
  const statConfig = (config ?? {}) as StatBlockModuleConfig;
  const { title, items = [] } = statConfig;

  if (!Array.isArray(items) || items.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50/60 px-4 py-6 text-xs text-slate-500 italic">
        No stats configured.
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col rounded-lg border border-slate-200 bg-white/85 px-4 py-3">
      {title && (
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
          {title}
        </h3>
      )}
      <dl className="grid grid-cols-1 gap-y-2 text-sm">
        {items.map((item, index) => {
          if (!item || !item.label || !item.value) return null;
          return (
            <div key={index} className="flex justify-between gap-2">
              <dt className="text-xs font-medium text-slate-600">{item.label}</dt>
              <dd className="text-xs font-semibold text-slate-900 text-right">
                {item.value}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

