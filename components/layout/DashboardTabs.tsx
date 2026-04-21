"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector, useAppStore } from "@/lib/store/hooks";
import {
  addDashboard,
  setActiveDashboard,
  updateDashboardName,
  updateDashboardMeta,
  toggleDashboardPinned,
} from "@/lib/store/slices/dashboardsSlice";
import DashboardService from "@/lib/services/dashboardService";
import type { Dashboard } from "@/lib/types/dashboard";
import { clsx } from "clsx";

export default function DashboardTabs() {
  // Core tab bar for switching between dashboards and managing their lifecycle.
  const dashboards = useAppSelector((s) => s.dashboards.dashboards);
  const activeDashboardId = useAppSelector((s) => s.dashboards.activeDashboardId);
  const dispatch = useAppDispatch();
  const store = useAppStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const sortedDashboards = useMemo(() => Object.values(dashboards).sort((a, b) => {
    const [, aSuffix] = a.id.split("-");
    const [, bSuffix] = b.id.split("-");
    const aNum = Number(aSuffix);
    const bNum = Number(bSuffix);
    if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) return aNum - bNum;
    return a.id.localeCompare(b.id);
  }), [dashboards]);
  const dashboardList = useMemo(
    () => sortedDashboards.filter((dash) => dash.pinned ?? false),
    [sortedDashboards]
  );

  const abbreviateDashboardName = (name: string): string => {
    const trimmed = name.trim();
    if (!trimmed) return "Board";
    const words = trimmed.split(/\s+/);
    if (words.length >= 2) {
      return words.slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "").join("");
    }
    return trimmed.length > 8 ? `${trimmed.slice(0, 7)}...` : trimmed;
  };
  const tabClass = (isActive: boolean) =>
    clsx(
      "px-4 py-2 rounded-full text-sm transition",
      isActive
        ? "bg-white/95 text-slate-900 shadow-md border border-white/60"
        : "bg-white/40 text-slate-700/90 border border-slate-300/40 hover:bg-white/55 hover:text-slate-900"
    );

  // Focus input when editing starts
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const startEditing = (dashboardId: string, currentName: string) => {
    setEditingId(dashboardId);
    setEditValue(currentName);
  };

  const saveEdit = (dashboardId: string) => {
    if (editValue.trim().length > 0) {
      dispatch(updateDashboardName({ dashboardId, name: editValue.trim() }));
    }
    setEditingId(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, dashboardId: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit(dashboardId);
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    }
  };

  const handleAddDashboard = () => {
    // Collect the numeric suffix for every dashboard id (e.g. board-2 -> 2).
    const existingNumbers = sortedDashboards
      .map((dash) => {
        const [, suffix] = dash.id.split("-");
        const parsed = Number(suffix);
        return Number.isNaN(parsed) ? null : parsed;
      })
      .filter((value): value is number => value !== null)
      .sort((a, b) => a - b);

    let nextNumber = 1;
    while (existingNumbers.includes(nextNumber)) {
      nextNumber += 1;
    }

    const newId = `board-${nextNumber}`;
    const newDashboard: Dashboard = {
      id: newId,
      name: `Board ${nextNumber}`,
      shortName: `B${nextNumber}`,
      group: "General",
      pinned: dashboardList.length < 4,
      modules: [],
    };

    dispatch(addDashboard(newDashboard));
    dispatch(setActiveDashboard(newId));
  };

  const handleRemoveDashboard = (dashboardId: string) => {
    // Use DashboardService to coordinate removal of dashboard and all associated data
    DashboardService.removeDashboard(dispatch, store.getState, dashboardId);
  };

  return (
    <>
      <div className="w-full flex justify-center">
        <div className="flex items-center gap-3">
          <div className="backdrop-blur rounded-full bg-white/25 px-2 py-2 flex gap-2 border border-slate-300/30 shadow-md">
            {dashboardList.length > 0 ? (
              dashboardList.map((dash) => {
                const canRemove = sortedDashboards.length > 1 && dash.id !== "board-1";
                const isEditing = editingId === dash.id;
                const tabLabel = dash.shortName?.trim() || abbreviateDashboardName(dash.name);
                return (
                  <div key={dash.id} className="relative group">
                    {isEditing ? (
                      <input
                        ref={inputRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, dash.id)}
                        onBlur={() => saveEdit(dash.id)}
                        onClick={(e) => e.stopPropagation()}
                        className={clsx(
                          tabClass(dash.id === activeDashboardId),
                          "outline-none border-2 border-blue-400"
                        )}
                        style={{ minWidth: "80px", maxWidth: "200px" }}
                      />
                    ) : (
                      <button
                        className={tabClass(dash.id === activeDashboardId)}
                        onClick={() => dispatch(setActiveDashboard(dash.id))}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          startEditing(dash.id, dash.name);
                        }}
                        title="Double-click to rename"
                      >
                        {tabLabel}
                      </button>
                    )}
      
                    {canRemove && !isEditing && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleRemoveDashboard(dash.id);
                        }}
                        className="absolute -top-1.5 -right-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow group-hover:flex hover:bg-red-500 hover:text-white"
                        aria-label={`Remove ${dash.name}`}
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <div className={tabClass(false)}>No pinned dashboards</div>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddDashboard}
            className="flex items-center gap-2 rounded-full border border-slate-300/40 bg-white/40 px-3 py-2 text-sm text-slate-700/90 transition hover:bg-white/55 hover:text-slate-900"
            aria-label="Add dashboard"
          >
            <span className="text-lg leading-none translate-y-[-1px]">+</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const firstUnpinned = sortedDashboards.find((dash) => !(dash.pinned ?? false));
              if (firstUnpinned) {
                dispatch(updateDashboardMeta({ dashboardId: firstUnpinned.id, changes: { pinned: true } }));
                dispatch(setActiveDashboard(firstUnpinned.id));
              }
            }}
            className="flex items-center gap-2 rounded-full border border-slate-300/40 bg-white/40 px-3 py-2 text-xs text-slate-700/90 transition hover:bg-white/55 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-50"
            disabled={!sortedDashboards.some((dash) => !(dash.pinned ?? false))}
            aria-label="Pin next dashboard"
            title="Pin next dashboard"
          >
            Pin
          </button>
        </div>
      </div>
    </>
  );
}

