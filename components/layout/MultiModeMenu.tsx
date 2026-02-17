"use client";

import clsx from "clsx";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  type MultiMenuMode,
  setMultiMenuMode,
} from "@/lib/store/slices/uiSlice";

const modes: {
  id: Exclude<MultiMenuMode, null>;
  label: string;
  color: string;
  title: string;
  /** When active: translate classes so this cell "pops" like a jigsaw piece */
  activeOffset: string;
}[] = [
  { id: "context",  label: "C", color: "bg-green-500",  title: "Context mode",  activeOffset: "-translate-x-[10px] -translate-y-[10px]" },
  { id: "organise", label: "O", color: "bg-yellow-400", title: "Organise mode", activeOffset: "translate-x-[10px] -translate-y-[10px]" },
  { id: "delete",   label: "D", color: "bg-red-500",    title: "Delete mode",   activeOffset: "-translate-x-[10px] translate-y-[10px]" },
  { id: "stash",    label: "S", color: "bg-blue-500",   title: "Stash mode",    activeOffset: "translate-x-[10px] translate-y-[10px]" },
];

export default function MultiModeMenu() {
  const dispatch = useAppDispatch();
  const activeMode = useAppSelector((s) => s.ui.multiMenuMode);

  const handleClick = (mode: MultiMenuMode) => {
    // Toggle off if clicking the same mode again
    dispatch(setMultiMenuMode(activeMode === mode ? null : mode));
  };

  return (
    <div className="fixed top-4 right-4 z-40">
      <div className="w-24 aspect-square grid grid-cols-2 grid-rows-2 rounded-xl overflow-visible shadow-xl">
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            title={m.title}
            onClick={() => handleClick(m.id)}
            className={clsx(
              "relative flex items-center justify-center text-white text-lg font-semibold transition-all",
              m.color,
              activeMode === m.id
                ? "z-10 ring-2 ring-white shadow-inner scale-[1.03] " + m.activeOffset
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

