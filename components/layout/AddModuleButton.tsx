"use client";

import { useEffect, useMemo, useState } from "react";
import { moduleRegistry } from "@/modules/registry";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { addModule } from "@/lib/store/slices/dashboardsSlice";
import { setModuleConfig } from "@/lib/store/slices/moduleConfigsSlice";

// Decide where to place the next module in the grid so it doesn't overlap.
function nextPosition(existing: { x: number; y: number; w: number; h: number }[]) {
  // Simple heuristic: place next item after the last one, wrap at 8 columns (lg breakpoint)
  if (existing.length === 0) return { x: 0, y: 0, w: 3, h: 2 };
  const last = existing[existing.length - 1];
  const nextX = last.x + last.w;
  if (nextX + last.w <= 8) return { x: nextX, y: last.y, w: last.w, h: last.h };
  return { x: 0, y: last.y + last.h, w: last.w, h: last.h };
}

export default function AddModuleButton() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dispatch = useAppDispatch();
  const { activeDashboardId, dashboards } = useAppSelector((s) => s.dashboards);

  // Basic search filter (name + description)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return moduleRegistry;
    return moduleRegistry.filter(
      (m) =>
        m.displayName.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q)
    );
  }, [query]);
  
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  
  // Called when the user chooses a module type from the modal list.
  const handleAdd = (type: string) => {
    if (!activeDashboardId) return;
    const dash = dashboards[activeDashboardId];
    const positions = dash.modules.map((m) => m.gridPosition);
    const meta = moduleRegistry.find((m) => m.type === type);
    let size = meta?.defaultGridSize ?? { w: 3, h: 2 };
    
    // Ensure default size respects min/max constraints
    if (meta) {
      if (meta.minGridSize) {
        size = {
          w: Math.max(size.w, meta.minGridSize.w),
          h: Math.max(size.h, meta.minGridSize.h),
        };
      }
      if (meta.maxGridSize) {
        size = {
          w: Math.min(size.w, meta.maxGridSize.w),
          h: Math.min(size.h, meta.maxGridSize.h),
        };
      }
    }
    
    const pos = positions.length
      ? nextPosition(positions)
      : { x: 0, y: 0, w: size.w, h: size.h };

    // Each module needs a stable ID so its layout entry and config line up.
    const moduleId = crypto.randomUUID();

    dispatch(
      addModule({
        dashboardId: activeDashboardId,
        module: {
          id: moduleId,
          type,
          gridPosition: { x: pos.x, y: pos.y, w: size.w, h: size.h },
        },
      })
    );
    
    // Auto-generate config for todo/completed modules
    let initialConfig: Record<string, any> = {};
    if (type === "todo" || type === "completed") {
      // Count existing todo/completed modules to generate unique names
      const existingModules = dash.modules.filter(
        (m) => m.type === "todo" || m.type === "completed"
      );
      const count = existingModules.length + 1;
      
      if (type === "todo") {
        initialConfig = {
          listId: moduleId,
          listName: `Todo List ${count}`,
        };
      } else if (type === "completed") {
        // For completed modules, default to master mode
        initialConfig = {
          mode: "master",
        };
      }
    }

    // Seed the module's config immediately so downstream selectors/renderers
    // can assume an entry exists (ensureModuleConfig fills in defaults).
    dispatch(
      setModuleConfig({
        moduleId,
        config: initialConfig,
      })
    );
    // Close the modal now that the module and config have been created.
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
                    No modules match &ldquo;{query}&rdquo;
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