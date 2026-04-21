"use client";

import AppearanceSection from "@/components/layout/menu-sections/AppearanceSection";

type SettingsMenuPanelProps = {
  theme: "light" | "dark";
  onBack: () => void;
  onThemeChange: (theme: "light" | "dark") => void;
  onToggleTheme: () => void;
};

export default function SettingsMenuPanel({
  theme,
  onBack,
  onThemeChange,
  onToggleTheme,
}: SettingsMenuPanelProps) {
  return (
    <>
      <header className="pb-5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg px-1 py-1 text-sm font-medium text-[#5f6781] hover:bg-[#eceff8] hover:text-[#343c53]"
          aria-label="Back to main menu"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
            <path d="M14.7 5.3a1 1 0 0 1 0 1.4L10.4 11H20a1 1 0 1 1 0 2h-9.6l4.3 4.3a1 1 0 1 1-1.4 1.4l-6-6a1 1 0 0 1 0-1.4l6-6a1 1 0 0 1 1.4 0Z" />
          </svg>
          <span>Back</span>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto pb-5">
        <h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#72788d]">Dashboard Settings</h2>
        <AppearanceSection theme={theme} onThemeChange={onThemeChange} onToggleTheme={onToggleTheme} />
      </div>
    </>
  );
}
