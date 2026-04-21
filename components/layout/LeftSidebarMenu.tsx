"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setActiveDashboard, toggleDashboardPinned } from "@/lib/store/slices/dashboardsSlice";
import { setTheme } from "@/lib/store/slices/globalConfigSlice";

type LeftSidebarMenuProps = {
  isOpen: boolean;
  username: string;
  isAuthenticated: boolean;
  onClose: () => void;
  onLogout: () => Promise<void> | void;
};

function sortDashboards(a: { id: string }, b: { id: string }): number {
  const [, aSuffix] = a.id.split("-");
  const [, bSuffix] = b.id.split("-");
  const aNum = Number(aSuffix);
  const bNum = Number(bSuffix);
  if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) return aNum - bNum;
  return a.id.localeCompare(b.id);
}

function initialsFromName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "U";
  const words = trimmed.split(/\s+/);
  if (words.length >= 2) return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
  return trimmed.slice(0, 2).toUpperCase();
}

export default function LeftSidebarMenu({
  isOpen,
  username,
  isAuthenticated,
  onClose,
  onLogout,
}: LeftSidebarMenuProps) {
  const dispatch = useAppDispatch();
  const [isExiting, setIsExiting] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>("General");
  const dashboards = useAppSelector((s) => s.dashboards.dashboards);
  const activeDashboardId = useAppSelector((s) => s.dashboards.activeDashboardId);
  const theme = useAppSelector((s) => s.globalConfig.theme);

  const sortedDashboards = useMemo(() => Object.values(dashboards).sort(sortDashboards), [dashboards]);

  const groupedDashboards = useMemo(() => {
    const groupMap = new Map<string, typeof sortedDashboards>();
    sortedDashboards.forEach((dashboard) => {
      const group = dashboard.group?.trim() || "General";
      const list = groupMap.get(group) ?? [];
      list.push(dashboard);
      groupMap.set(group, list);
    });
    return Array.from(groupMap.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [sortedDashboards]);

  const groupNames = groupedDashboards.map(([group]) => group);

  useEffect(() => {
    if (!groupNames.includes(selectedGroup)) {
      setSelectedGroup(groupNames[0] ?? "General");
    }
  }, [groupNames, selectedGroup]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isExiting) return;
    const timer = setTimeout(() => setIsExiting(false), 250);
    return () => clearTimeout(timer);
  }, [isExiting]);

  const requestClose = useCallback(() => {
    if (!isExiting) {
      setIsExiting(true);
      setTimeout(onClose, 250);
    }
  }, [isExiting, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, requestClose]);

  if (!isOpen && !isExiting) return null;

  const dashboardsForGroup =
    groupedDashboards.find(([group]) => group === selectedGroup)?.[1] ?? [];

  const navLinks = [
    { label: "Home", icon: "home" },
    { label: "Pinned", icon: "pin" },
    { label: "Analytics", icon: "chart" },
  ] as const;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 ${
          isExiting ? "animate-[fade-out_0.25s_ease-out_forwards]" : "animate-[fade-in_0.25s_ease-out]"
        }`}
        aria-hidden
        onClick={requestClose}
      />
      <aside
        role="dialog"
        aria-label="Dashboard menu"
        className={`fixed left-0 top-0 z-50 flex h-full w-[86vw] max-w-[340px] flex-col bg-[#f7f8fc] px-4 pt-4 pb-4 shadow-2xl ${
          isExiting
            ? "animate-[slide-out-to-left_0.25s_ease-out_forwards]"
            : "animate-[slide-in-from-left_0.25s_ease-out]"
        }`}
      >
        <header>
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={requestClose}
              className="mt-0.5 rounded-lg p-1.5 text-[#8b91a4] hover:bg-[#eceff8] hover:text-[#343c53]"
              aria-label="Close menu"
            >
              <span className="text-4xl leading-none">×</span>
            </button>
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-[#d8dce9] bg-[#4a5f8f] text-base font-semibold text-white">
                {initialsFromName(username || "User")}
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
            <Link href="/" onClick={requestClose} className="text-[#40527d] hover:text-[#2f3f65]">
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

          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#72788d]">
            Dashboard Groups
          </div>
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
                        onClick={() => {
                          dispatch(setActiveDashboard(dash.id));
                          requestClose();
                        }}
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
                        onClick={() => dispatch(toggleDashboardPinned(dash.id))}
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] ${
                          isPinned
                            ? "border-[#d6dcec] bg-[#e6ebf8] text-[#4b5d86]"
                            : "border-[#dee2ef] bg-white text-[#66708d]"
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
          <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#72788d]">
            Dashboard Settings
          </h3>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-base text-[#343b52]">Theme</span>
              <select
                value={theme}
                onChange={(event) => dispatch(setTheme(event.target.value as "light" | "dark"))}
                className="rounded-xl border border-[#e1e5f2] bg-[#ebedf6] px-4 py-1.5 text-sm font-semibold uppercase tracking-wide text-[#66708f]"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => dispatch(setTheme(theme === "dark" ? "light" : "dark"))}
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

          <button
            type="button"
            className="mx-auto mt-6 flex items-center gap-2 text-base text-[#7b8194] hover:text-[#4c5369]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
              <path d="m19.4 13.5 1.2-1.5-1.2-1.5-1.8.2c-.2-.7-.5-1.3-.9-1.8l1.1-1.5-1.5-1.5-1.5 1.1c-.6-.4-1.2-.7-1.8-.9L12 3.4l-1.5 1.2.2 1.8c-.7.2-1.3.5-1.8.9L7.4 6.2 5.9 7.7 7 9.2c-.4.6-.7 1.2-.9 1.8l-1.8-.2L3 12l1.2 1.5 1.8-.2c.2.7.5 1.3.9 1.8l-1.1 1.5 1.5 1.5 1.5-1.1c.6.4 1.2.7 1.8.9l-.2 1.8 1.5 1.2 1.5-1.2-.2-1.8c.7-.2 1.3-.5 1.8-.9l1.5 1.1 1.5-1.5-1.1-1.5c.4-.6.7-1.2.9-1.8l1.8.2ZM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5Z" />
            </svg>
            <span>Settings</span>
          </button>
        </footer>
      </aside>
    </>
  );
}
