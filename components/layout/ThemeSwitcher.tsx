"use client";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setTheme } from "@/lib/store/slices/globalConfigSlice";
import { clsx } from "clsx";

export default function ThemeSwitcher() {
  const theme = useAppSelector((state) => state.globalConfig.theme);
  const dispatch = useAppDispatch();

  const themes = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "tron", label: "Tron" },
  ] as const;

  return (
    <div className={clsx(
      "fixed bottom-8 left-8 flex gap-2 rounded-lg p-2",
      theme === "tron"
        ? "bg-black/50 border-2 border-tron-neon/50 shadow-[0_0_10px_rgba(0,212,255,0.3)]"
        : "bg-white/90 border border-gray-200 shadow-md"
    )}>
      {themes.map((t) => (
        <button
          key={t.value}
          onClick={() => dispatch(setTheme(t.value))}
          className={clsx(
            "px-3 py-1 rounded text-sm transition",
            theme === "tron"
              ? theme === t.value
                ? "bg-tron-neon/20 text-white border-2 border-tron-neon tron-glow"
                : "text-white/70 border-2 border-tron-neon/30 hover:border-tron-neon/50 hover:text-white"
              : theme === t.value
                ? "bg-blue-500 text-white"
                : "text-gray-700 hover:bg-gray-100"
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
