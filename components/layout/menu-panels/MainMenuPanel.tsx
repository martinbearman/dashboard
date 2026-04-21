"use client";

import Link from "next/link";
import type { Dashboard } from "@/lib/types/dashboard";

type NavIcon = "home" | "pin" | "chart";

type MainMenuPanelProps = {
  username: string;
  isAuthenticated: boolean;
  onClose: () => void;
  onLogout: () => Promise<void> | void;
  navLinks: ReadonlyArray<{ label: string; icon: NavIcon }>;
  selectedGroup: string;
  dashboardsForGroup: Dashboard[];
  activeDashboardId: string | null;
  getInitials: (name: string) => string;
  onOpenSettings: () => void;
  onSelectDashboard: (dashboardId: string) => void;
  onTogglePinned: (dashboardId: string) => void;
};

export default function MainMenuPanel({
  username,
  isAuthenticated,
  onClose,
  onLogout,
  navLinks,
  selectedGroup,
  dashboardsForGroup,
  activeDashboardId,
  getInitials,
  onOpenSettings,
  onSelectDashboard,
  onTogglePinned,
}: MainMenuPanelProps) {
  return (
    <>
      <header>
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onClose}
            className="mt-0.5 rounded-lg p-1.5 text-[#8b91a4] hover:bg-[#eceff8] hover:text-[#343c53]"
            aria-label="Close menu"
          >
            <span className="text-4xl leading-none">×</span>
          </button>
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-[#d8dce9] bg-[#4a5f8f] text-base font-semibold text-white">
              {getInitials(username || "User")}
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.08em] text-[#8a90a4]">Logged in as</p>
              <p className="mt-0.5 truncate text-xl/[1.1] font-medium text-[#1f2535]">{username || "User"}</p>
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => void onLogout()}
                  className="mt-1 text-xs text-[#8d92a4] hover:text-[#636b84]"
                >
                  Logout
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-5 text-base font-medium">
          <Link href="/" onClick={onClose} className="text-[#40527d] hover:text-[#2f3f65]">
            Start Page
          </Link>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-5">
        <button
          type="button"
          className="mb-5 flex w-full items-center gap-3 rounded-2xl bg-[#e8ebf3] px-4 py-3 text-left text-lg font-semibold text-[#4f628b]"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
            <path d="M3 3h8v8H3V3Zm10 0h8v5h-8V3ZM13 10h8v11h-8V10ZM3 13h8v8H3v-8Z" />
          </svg>
          <span>Dashboards</span>
        </button>

        <nav className="mb-8 space-y-1.5">
          {navLinks.map((link) => (
            <button
              key={link.label}
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-base text-[#1f2436] hover:bg-[#eceff8]"
            >
              {link.icon === "home" ? (
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden>
                  <path d="M3 10.9 12 3l9 7.9V21h-6v-7h-6v7H3v-10.1Z" />
                </svg>
              ) : null}
              {link.icon === "pin" ? (
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden>
                  <path d="M8 4h8v2l-2 3v4l3 2v2h-4v5h-2v-5H7v-2l3-2V9L8 6V4Z" />
                </svg>
              ) : null}
              {link.icon === "chart" ? (
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden>
                  <path d="M3 3h18v18H3V3Zm4 13h2v3H7v-3Zm4-6h2v9h-2v-9Zm4 3h2v6h-2v-6Z" />
                </svg>
              ) : null}
              <span>{link.label}</span>
            </button>
          ))}
        </nav>

        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#72788d]">Dashboard Groups</div>
        <div className="mb-4 text-base text-[#444b62]">{selectedGroup}</div>

        <ul className="space-y-3">
          {dashboardsForGroup.map((dash) => {
            const isPinned = dash.pinned ?? false;
            const isActive = dash.id === activeDashboardId;
            return (
              <li key={dash.id}>
                <div
                  className={`rounded-2xl border border-[#ebedf5] px-5 py-4 shadow-[0_1px_0_rgba(34,46,79,0.02)] ${
                    isActive ? "bg-[#eef1fb]" : "bg-[#f5f6fb]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => onSelectDashboard(dash.id)}
                      className="min-w-0 flex-1 rounded-lg text-left hover:opacity-85"
                      title={dash.name}
                    >
                      <div className="flex items-center gap-4">
                        <div className="grid h-12 w-12 place-items-center rounded-xl bg-white text-[#667193]">
                          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                            <path d="M4 4h16v2H4V4Zm2 4h12l-1.5 8H7.5L6 8Zm2 10a2 2 0 1 0 .001 3.999A2 2 0 0 0 8 18Zm8 0a2 2 0 1 0 .001 3.999A2 2 0 0 0 16 18Z" />
                          </svg>
                        </div>
                        <span className="truncate text-lg font-medium text-[#23293a]">{dash.name}</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => onTogglePinned(dash.id)}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] ${
                        isPinned ? "border-[#d6dcec] bg-[#e6ebf8] text-[#4b5d86]" : "border-[#dee2ef] bg-white text-[#66708d]"
                      }`}
                    >
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                        <path d="M8 4h8v2l-2 3v4l3 2v2h-4v5h-2v-5H7v-2l3-2V9L8 6V4Z" />
                      </svg>
                      PIN
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <footer className="border-t border-[#e4e7f2] py-6">
        <button
          type="button"
          onClick={onOpenSettings}
          className="mx-auto flex items-center gap-2 text-base text-[#7b8194] hover:text-[#4c5369]"
          aria-label="Open settings menu"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
            <path d="m19.4 13.5 1.2-1.5-1.2-1.5-1.8.2c-.2-.7-.5-1.3-.9-1.8l1.1-1.5-1.5-1.5-1.5 1.1c-.6-.4-1.2-.7-1.8-.9L12 3.4l-1.5 1.2.2 1.8c-.7.2-1.3.5-1.8.9L7.4 6.2 5.9 7.7 7 9.2c-.4.6-.7 1.2-.9 1.8l-1.8-.2L3 12l1.2 1.5 1.8-.2c.2.7.5 1.3.9 1.8l-1.1 1.5 1.5 1.5 1.5-1.1c.6.4 1.2.7 1.8.9l-.2 1.8 1.5 1.2 1.5-1.2-.2-1.8c.7-.2 1.3-.5 1.8-.9l1.5 1.1 1.5-1.5-1.1-1.5c.4-.6.7-1.2.9-1.8l1.8.2ZM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5Z" />
          </svg>
          <span>Settings</span>
        </button>
      </footer>
    </>
  );
}
