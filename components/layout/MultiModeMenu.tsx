"use client";

import clsx from "clsx";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  type MultiMenuMode,
  setMultiMenuMode,
} from "@/lib/store/slices/uiSlice";

const modes: { id: Exclude<MultiMenuMode, null>; label: string; color: string; title: string }[] = [
  { id: "context",  label: "C", color: "bg-green-500",  title: "Context mode" },
  { id: "organise", label: "O", color: "bg-yellow-400", title: "Organise mode" },
  { id: "delete",   label: "D", color: "bg-red-500",    title: "Delete mode" },
  { id: "stash",    label: "S", color: "bg-blue-500",   title: "Stash mode" },
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
      <div className="w-24 aspect-square grid grid-cols-2 grid-rows-2 rounded-xl overflow-hidden shadow-xl bg-slate-900/80 backdrop-blur">
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            title={m.title}
            onClick={() => handleClick(m.id)}
            className={clsx(
              "flex items-center justify-center text-white text-lg font-semibold transition-all",
              m.color,
              activeMode === m.id
                ? "ring-2 ring-white shadow-inner scale-[1.03]"
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

