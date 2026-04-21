"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import { useAppDispatch, useAppSelector, useAppStore } from "@/lib/store/hooks";
import { ORGANISE_MODE_ANIMATION_MS } from "@/lib/constants/ui";
import { addDashboard, setActiveDashboard } from "@/lib/store/slices/dashboardsSlice";
import type { Dashboard } from "@/lib/types/dashboard";
import {
  type MultiMenuMode,
  setMultiMenuMode,
} from "@/lib/store/slices/uiSlice";
import {
  executeMultiModeAction,
  getContextForSelectedModules,
} from "@/lib/store/thunks/dashboardThunks";

const modes: {
  id: Exclude<MultiMenuMode, null>;
  label: string;
  color: string;
  title: string;
  activeOffset: string;
}[] = [
  {
    id: "context",
    label: "C",
    color: "bg-green-500",
    title: "Context",
    activeOffset: "-translate-x-[10px] -translate-y-[10px]",
  },
  {
    id: "organise",
    label: "O",
    color: "bg-yellow-400",
    title: "Organise",
    activeOffset: "translate-x-[10px] -translate-y-[10px]",
  },
  {
    id: "remove",
    label: "R",
    color: "bg-red-500",
    title: "Remove",
    activeOffset: "-translate-x-[10px] translate-y-[10px]",
  },
  {
    id: "search",
    label: "S",
    color: "bg-blue-500",
    title: "Search",
    activeOffset: "translate-x-[10px] translate-y-[10px]",
  },
];

export default function MultiModeMenu() {
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const dashboards = useAppSelector((s) => s.dashboards.dashboards);
  const { multiMenuMode: activeMode, selectedModuleIds } = useAppSelector(
    (s) => s.ui
  );
  const [organiseAnimating, setOrganiseAnimating] = useState(false);
  const dashboardList = Object.values(dashboards);

  // Log accumulated context whenever selection changes in context mode
  useEffect(() => {
    if (activeMode !== "context" || selectedModuleIds.length === 0) return;
    const state = store.getState();
    const context = getContextForSelectedModules(state, selectedModuleIds);
    if (context.length > 0) {
      // Format context as readable text: title + content per module (or caption for images), separated by ---
      const blocks = context.map((item) => {
        if ((item.type as string) === "image") {
          return (item.caption as string) ?? "";
        }
        const title = (item.title as string) ?? "";
        const content = (item.content as string) ?? "";
        return [title, content].filter(Boolean).join("\n");
      });
      console.log("Context:\n" + blocks.join("\n---\n"));
    }
  }, [activeMode, selectedModuleIds, store]);

  const handleClick = (mode: MultiMenuMode) => {
    // Organise is a one-shot action - no selection required
    if (mode === "organise") {
      dispatch(executeMultiModeAction("organise"));

      // Trigger animation
      setOrganiseAnimating(true);
      setTimeout(() => setOrganiseAnimating(false), ORGANISE_MODE_ANIMATION_MS);
      return;
    }

    // If clicking the active mode while modules are selected, execute the action
    if (activeMode === mode && selectedModuleIds.length > 0) {
      console.log("Execute multi mode action", selectedModuleIds);
      dispatch(executeMultiModeAction());
      return;
    }

    // Otherwise, toggle the mode on/off
    dispatch(setMultiMenuMode(activeMode === mode ? null : mode));
  };

  const handleAddDashboard = () => {
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

    const pinnedCount = dashboardList.filter((dash) => dash.pinned ?? false).length;
    const newId = `board-${nextNumber}`;
    const newDashboard: Dashboard = {
      id: newId,
      name: `Board ${nextNumber}`,
      shortName: `B${nextNumber}`,
      group: "General",
      pinned: pinnedCount < 4,
      modules: [],
    };

    dispatch(addDashboard(newDashboard));
    dispatch(setActiveDashboard(newId));
  };

  return (
    <div className="fixed right-4 top-16 z-40 md:top-4">
      <div className="flex w-24 flex-col gap-4">
        <div className="aspect-square grid grid-cols-2 grid-rows-2 rounded-xl overflow-visible shadow-xl">
          {modes.map((m) => {
            const isOrganise = m.id === "organise";
            const isActive = activeMode === m.id && !isOrganise;

            return (
              <button
                key={m.id}
                type="button"
                title={
                  activeMode === m.id && selectedModuleIds.length > 0
                    ? `${m.title} – apply to ${selectedModuleIds.length} selected module${
                        selectedModuleIds.length > 1 ? "s" : ""
                      }`
                    : m.title
                }
                onClick={() => handleClick(m.id)}
                className={clsx(
                  "relative flex items-center justify-center text-white text-lg font-semibold transition-all",
                  m.color,
                  m.id === "context" && "rounded-tl-xl",
                  m.id === "organise" && "rounded-tr-xl",
                  m.id === "remove" && "rounded-bl-xl",
                  m.id === "search" && "rounded-br-xl",
                  isActive
                    ? clsx(
                        "z-10 ring-2 ring-white shadow-inner scale-[1.03]",
                        m.activeOffset,
                        selectedModuleIds.length > 0 &&
                          "animate-pulse ring-4 ring-white shadow-xl"
                      )
                    : "opacity-80 hover:opacity-100",
                  isOrganise && organiseAnimating && "organise-pop-animation"
                )}
              >
                {m.label}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={handleAddDashboard}
          className="grid h-10 w-full place-items-center rounded-xl bg-white/90 text-2xl leading-none text-slate-700 shadow-xl transition hover:bg-white"
          aria-label="Add dashboard"
          title="Add dashboard"
        >
          +
        </button>
      </div>
    </div>
  );
}
