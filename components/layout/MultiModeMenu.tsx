"use client";

import clsx from "clsx";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  type MultiMenuMode,
  setMultiMenuMode,
} from "@/lib/store/slices/uiSlice";
import { executeMultiModeAction } from "@/lib/store/thunks/dashboardThunks";

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
    title: "Context mode",
    activeOffset: "-translate-x-[10px] -translate-y-[10px]",
  },
  {
    id: "organise",
    label: "O",
    color: "bg-yellow-400",
    title: "Organise mode",
    activeOffset: "translate-x-[10px] -translate-y-[10px]",
  },
  {
    id: "delete",
    label: "D",
    color: "bg-red-500",
    title: "Delete mode",
    activeOffset: "-translate-x-[10px] translate-y-[10px]",
  },
  {
    id: "stash",
    label: "S",
    color: "bg-blue-500",
    title: "Stash mode",
    activeOffset: "translate-x-[10px] translate-y-[10px]",
  },
];

export default function MultiModeMenu() {
  const dispatch = useAppDispatch();
  const { multiMenuMode: activeMode, selectedModuleIds } = useAppSelector(
    (s) => s.ui
  );

  const handleClick = (mode: MultiMenuMode) => {
    // If clicking the active mode while modules are selected, execute the action
    if (activeMode === mode && selectedModuleIds.length > 0) {
      console.log("Execute multi mode action", selectedModuleIds);
      dispatch(executeMultiModeAction());
      return;
    }

    // Otherwise, toggle the mode on/off
    dispatch(setMultiMenuMode(activeMode === mode ? null : mode));
  };

  return (
    <div className="fixed top-4 right-4 z-40">
      <div className="w-24 aspect-square grid grid-cols-2 grid-rows-2 rounded-xl overflow-visible shadow-xl">
        {modes.map((m) => (
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
              activeMode === m.id
                ? clsx(
                    "z-10 ring-2 ring-white shadow-inner scale-[1.03] ",
                    m.activeOffset,
                    selectedModuleIds.length > 0 &&
                      "animate-pulse ring-4 ring-white shadow-xl"
                  )
                : "opacity-80 hover:opacity-100"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
