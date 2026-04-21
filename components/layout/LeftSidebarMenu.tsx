"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector, useAppStore } from "@/lib/store/hooks";
import { setActiveDashboard, toggleDashboardPinned } from "@/lib/store/slices/dashboardsSlice";
import { setTheme } from "@/lib/store/slices/globalConfigSlice";
import DashboardService from "@/lib/services/dashboardService";
import MainMenuPanel from "@/components/layout/menu-panels/MainMenuPanel";
import SettingsMenuPanel from "@/components/layout/menu-panels/SettingsMenuPanel";

type LeftSidebarMenuProps = {
  isOpen: boolean;
  username: string;
  isAuthenticated: boolean;
  onClose: () => void;
  onLogout: () => Promise<void> | void;
};

type MenuPanel = "main" | "settings";

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
  const store = useAppStore();
  const [isExiting, setIsExiting] = useState(false);
  const [activePanel, setActivePanel] = useState<MenuPanel>("main");
  const dashboards = useAppSelector((s) => s.dashboards.dashboards);
  const activeDashboardId = useAppSelector((s) => s.dashboards.activeDashboardId);
  const theme = useAppSelector((s) => s.globalConfig.theme);

  const sortedDashboards = useMemo(() => Object.values(dashboards).sort(sortDashboards), [dashboards]);

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
      setTimeout(() => setActivePanel("main"), 250);
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
        {activePanel === "main" ? (
          <MainMenuPanel
            username={username}
            isAuthenticated={isAuthenticated}
            onClose={requestClose}
            onLogout={onLogout}
            sortedDashboards={sortedDashboards}
            activeDashboardId={activeDashboardId}
            getInitials={initialsFromName}
            onOpenSettings={() => setActivePanel("settings")}
            onSelectDashboard={(dashboardId) => {
              dispatch(setActiveDashboard(dashboardId));
              requestClose();
            }}
            onTogglePinned={(dashboardId) => dispatch(toggleDashboardPinned(dashboardId))}
            onRemoveDashboard={(dashboardId) =>
              DashboardService.removeDashboard(dispatch, store.getState, dashboardId)
            }
          />
        ) : (
          <SettingsMenuPanel
            theme={theme}
            onBack={() => setActivePanel("main")}
            onThemeChange={(nextTheme) => dispatch(setTheme(nextTheme))}
            onToggleTheme={() => dispatch(setTheme(theme === "dark" ? "light" : "dark"))}
          />
        )}
      </aside>
    </>
  );
}
