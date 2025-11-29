"use client";

import { useState, useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  addDashboard,
  removeDashboard,
  setActiveDashboard,
  updateDashboardName,
} from "@/lib/store/slices/dashboardsSlice";
import type { Dashboard } from "@/lib/types/dashboard";
import { clsx } from "clsx";

export default function DashboardTabs() {
  // Core tab bar for switching between dashboards and managing their lifecycle.
  const dashboards = useAppSelector((s) => s.dashboards.dashboards);
  const activeDashboardId = useAppSelector((s) => s.dashboards.activeDashboardId);
  const dispatch = useAppDispatch();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const dashboardList = Object.values(dashboards);
  const tabClass = (isActive: boolean) =>
    clsx(
      "px-4 py-2 rounded-full text-sm transition",
      isActive
        ? "bg-white/90 text-slate-900 shadow"
        : "bg-white/20 text-white/70 hover:bg-white/40 hover:text-white"
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
    const existingNumbers = dashboardList
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
      modules: [],
    };

    dispatch(addDashboard(newDashboard));
    dispatch(setActiveDashboard(newId));
  };

  const handleRemoveDashboard = (dashboardId: string) => {
    // Keep the original dashboard as a permanent default.
    if (dashboardId === "board-1") return;
    dispatch(removeDashboard(dashboardId));
  };

  return (
    <>
      <div className="w-full flex justify-center">
        <div className="flex items-center gap-3">
          <div className="backdrop-blur rounded-full bg-white/15 px-2 py-2 flex gap-2 border border-white/10 shadow-md">
            {dashboardList.length > 0 ? (
              dashboardList.map((dash) => {
                const canRemove =
                  dashboardList.length > 1 && dash.id !== "board-1";
                const isEditing = editingId === dash.id;
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
                        {dash.name}
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
              <div className={tabClass(false)}>Dashboard</div>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddDashboard}
            className="flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-3 py-2 text-sm text-white/80 transition hover:bg-white/40 hover:text-white"
            aria-label="Add dashboard"
          >
            <span className="text-lg leading-none translate-y-[-1px]">+</span>
          </button>
        </div>
      </div>
    </>
  );
}

