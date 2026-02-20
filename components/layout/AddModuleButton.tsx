"use client";

import { useEffect, useState } from "react";
import { moduleRegistry } from "@/modules/registry";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { addModuleToDashboard } from "@/lib/store/thunks/dashboardThunks";

export default function AddModuleButton() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dispatch = useAppDispatch();
  const activeDashboardId = useAppSelector((s) => s.dashboards.activeDashboardId);

  // Basic search filter (name + description)

  const q = query.trim().toLowerCase();
  const filtered = q ? moduleRegistry.filter(
    (m) =>
      m.displayName.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q)
  ) : moduleRegistry;
    

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleAdd = (type: string) => {
    if (!activeDashboardId) return;
    dispatch(addModuleToDashboard({ dashboardId: activeDashboardId, type }));
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gray-800 dark:bg-gray-700 text-white rounded-full shadow-lg hover:bg-gray-900 dark:hover:bg-gray-600 flex items-center justify-center text-2xl"
        aria-label="Add module"
      >
        <span className="leading-none translate-y-[-1px]">+</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50"
          aria-modal="true"
          role="dialog"
          onClick={() => setOpen(false)}
        >
          {/* overlay */}
          <div className="absolute inset-0 bg-black/50" />

          {/* modal */}
          <div
            className="absolute inset-0 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-2xl rounded-xl bg-white text-black shadow-xl">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Add a module</h2>
                <button
                  className="rounded p-1 text-gray-500 hover:text-gray-700"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="p-4">
                {/* Search (non-functional styling now, functional filter above) */}
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search modules…"
                  className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="max-h-96 overflow-auto px-4 pb-4 space-y-2">
                {filtered.map((m) => (
                  <button
                    key={m.type}
                    onClick={() => handleAdd(m.type)}
                    className="w-full text-left rounded-lg border hover:bg-gray-50 p-4 flex items-start gap-3"
                  >
                    <div className="mt-1 text-xl">🧩</div>
                    <div>
                      <div className="font-medium">{m.displayName}</div>
                      <div className="text-sm text-gray-600">{m.description}</div>
                    </div>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <div className="text-center text-sm text-gray-500 py-6">
                    No modules match “{query}”
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}