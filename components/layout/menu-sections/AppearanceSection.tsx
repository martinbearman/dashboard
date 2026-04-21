"use client";

type AppearanceSectionProps = {
  theme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
  onToggleTheme: () => void;
};

export default function AppearanceSection({ theme, onThemeChange, onToggleTheme }: AppearanceSectionProps) {
  return (
    <section className="rounded-2xl border border-[#e4e7f2] bg-[#f2f4fb] p-4">
      <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.16em] text-[#55607d]">Appearance</h3>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-base text-[#343b52]">Theme</span>
          <select
            value={theme}
            onChange={(event) => onThemeChange(event.target.value as "light" | "dark")}
            className="rounded-xl border border-[#e1e5f2] bg-[#ebedf6] px-4 py-1.5 text-sm font-semibold uppercase tracking-wide text-[#66708f]"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <button
          type="button"
          onClick={onToggleTheme}
          className="flex w-full items-center justify-between rounded-2xl bg-[#496298] px-5 py-4 text-left text-white shadow-md hover:bg-[#425a8c]"
        >
          <span className="inline-flex items-center gap-3">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
              <path d="M11.8 2a1 1 0 0 1 .8 1.6A8 8 0 1 0 20.4 14a1 1 0 0 1 1.5 1.1A10 10 0 1 1 10.7 2.2a1 1 0 0 1 1.1-.2Z" />
            </svg>
            <span className="text-base font-semibold tracking-wide">
              {theme === "dark" ? "Disable dark mode" : "Enable dark mode"}
            </span>
          </span>
          <span
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
              theme === "dark" ? "bg-[#1f355d]" : "bg-[#8ea5d1]"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                theme === "dark" ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </span>
        </button>
      </div>
    </section>
  );
}
