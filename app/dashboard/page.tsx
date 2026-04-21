"use client";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { useEffect, useRef, useState } from "react";
import DashboardTabs from "@/components/layout/DashboardTabs";
import LLMPromptBar from "@/components/layout/LLMPromptBar";
import AddModuleButton from "@/components/layout/AddModuleButton";
import AppVersion from "@/components/layout/AppVersion";
import LeftSidebarMenu from "@/components/layout/LeftSidebarMenu";
import ConfigSheet from "@/components/ui/ConfigSheet";
import SearchResultsPanel from "@/components/layout/SearchResultsPanel";
import SearchResultsTab from "@/components/layout/SearchResultsTab";
import MultiModeMenu from "@/components/layout/MultiModeMenu";
import CloudStatusIndicator from "@/components/layout/CloudStatusIndicator";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { getModuleByType } from "@/modules/registry";
import ModuleWrapper from "@/components/modules/ModuleWrapper";
import {
  updateDashboardLayouts,
} from "@/lib/store/slices/dashboardsSlice";
import { setGridContainerParams } from "@/lib/store/slices/uiSlice";
import { GRID_LAYOUT_CONFIG } from "@/lib/constants/grid";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { WidthProvider, Responsive, type Layout, type Layouts } from "react-grid-layout";

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function DashboardPage() {
  const [username, setUsername] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [cloudStatus, setCloudStatus] = useState<"pending" | "synced" | "error">("synced");
  const [cloudEnabled, setCloudEnabled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMobileMultiMenu, setShowMobileMultiMenu] = useState(false);
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(false);
  const previousModeRef = useRef<typeof multiMenuMode>(null);
  // Read the active dashboard and all dashboards from Redux
  const { activeDashboardId, dashboards } = useAppSelector((s) => s.dashboards);
  const active = activeDashboardId ? dashboards[activeDashboardId] : null;
  const moduleConfigs = useAppSelector((s) => s.moduleConfigs.configs);
  const multiMenuMode = useAppSelector((s) => s.ui.multiMenuMode);
  const dispatch = useAppDispatch();

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = getSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setUsername("");
          setIsAuthenticated(false);
          return;
        }
        const fullName = user.user_metadata?.full_name;
        setUsername(typeof fullName === "string" && fullName.trim() ? fullName : user.email ?? "");
        setIsAuthenticated(true);
      } catch {
        setUsername("");
        setIsAuthenticated(false);
      }
    }

    void loadUser();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStatus = (event: Event) => {
      const detail = (event as CustomEvent<"pending" | "synced" | "error">).detail;
      if (detail) {
        setCloudStatus(detail);
        setCloudEnabled(true);
      }
    };

    window.addEventListener("dashboard-cloud-sync-status", handleStatus as EventListener);

    return () => {
      window.removeEventListener("dashboard-cloud-sync-status", handleStatus as EventListener);
    };
  }, []);

  // react-grid-layout expects a layout array for every breakpoint; start with empty defaults
  const defaultLayouts: Layouts = { lg: [], md: [], sm: [], xs: [], xxs: [] };
  // Merge the stored layouts (if any) with the empty defaults so missing breakpoints still exist
  const baseLayouts: Layouts =
    active?.layouts ? ({ ...defaultLayouts, ...active.layouts } as Layouts) : defaultLayouts;
  
  // Mark locked modules as static (non-draggable) and apply min/max constraints
  const layouts: Layouts = Object.keys(baseLayouts).reduce((acc, bp) => {
    acc[bp as keyof Layouts] = baseLayouts[bp as keyof Layouts].map((item) => {
      const moduleInstance = active?.modules.find((m) => m.id === item.i);
      const moduleMeta = moduleInstance ? getModuleByType(moduleInstance.type) : null;
      
      const layoutItem: Layout = {
        ...item,
        static: moduleConfigs[item.i]?.locked ?? false,
      };
      
      // Apply min/max constraints from module metadata
      if (moduleMeta) {
        if (moduleMeta.minGridSize) {
          layoutItem.minW = moduleMeta.minGridSize.w;
          layoutItem.minH = moduleMeta.minGridSize.h;
        }
        if (moduleMeta.maxGridSize) {
          layoutItem.maxW = moduleMeta.maxGridSize.w;
          layoutItem.maxH = moduleMeta.maxGridSize.h;
        }
      }
      
      return layoutItem;
    });
    return acc;
  }, {} as Layouts);

  function handleLayoutChange(current: Layout[], allLayouts: Layouts) {
    if (!active) return;
    // Persist the complete set of breakpoint layouts so drag/resize survives reloads
    // Layouts are now the single source of truth for module positions
    dispatch(
      updateDashboardLayouts({
        dashboardId: active.id,
        layouts: allLayouts,
      })
    );
  }

  function handleWidthChange(
    containerWidth: number,
    margin: [number, number],
    cols: number,
    containerPadding: [number, number] | null
  ) {
    dispatch(
      setGridContainerParams({
        containerWidth,
        margin,
        cols,
        containerPadding,
      })
    );
  }

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  }

  const statusDotClass = !cloudEnabled
    ? "bg-slate-400"
    : cloudStatus === "pending"
      ? "bg-amber-400"
      : cloudStatus === "error"
        ? "bg-rose-500"
        : "bg-emerald-500";

  useEffect(() => {
    if (multiMenuMode === "search") {
      setIsSearchBarVisible(true);
    } else if (previousModeRef.current === "search" && multiMenuMode === null) {
      // Only hide when search is explicitly toggled off.
      setIsSearchBarVisible(false);
    }

    previousModeRef.current = multiMenuMode;
  }, [multiMenuMode]);

  return (
    <main className="relative min-h-screen bg-gradient-to-b to-blue-100 from-slate-600">
      <div className="relative sticky top-0 z-10 pt-2 pb-2 space-y-3">
        <div className="absolute left-3 top-3 z-20 !mt-0">
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300/40 bg-white/40 text-slate-800 shadow-md backdrop-blur transition hover:bg-white/60 hover:text-slate-900"
            aria-label="Open menu"
          >
            <span className="sr-only">Open menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="h-5 w-5"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
        <div className="absolute right-3 top-3 z-20 !mt-0 md:hidden">
          <button
            type="button"
            onClick={() => setShowMobileMultiMenu((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300/40 bg-white/40 text-slate-800 shadow-md backdrop-blur transition hover:bg-white/60 hover:text-slate-900"
            aria-label={showMobileMultiMenu ? "Hide mode controls" : "Show mode controls"}
            aria-pressed={showMobileMultiMenu}
          >
            <span className="sr-only">
              {showMobileMultiMenu ? "Hide mode controls" : "Show mode controls"}
            </span>
            {showMobileMultiMenu ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="h-5 w-5"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
                aria-hidden
              >
                <rect x="5" y="5" width="5" height="5" rx="1" />
                <rect x="14" y="5" width="5" height="5" rx="1" />
                <rect x="5" y="14" width="5" height="5" rx="1" />
                <rect x="14" y="14" width="5" height="5" rx="1" />
              </svg>
            )}
          </button>
        </div>
        <DashboardTabs />
        {isSearchBarVisible && <LLMPromptBar />}
      </div>

      <div className="mx-auto px-2 pb-24 max-w-full">
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={GRID_LAYOUT_CONFIG.breakpoints}
          cols={GRID_LAYOUT_CONFIG.cols}
          rowHeight={GRID_LAYOUT_CONFIG.rowHeight}
          margin={GRID_LAYOUT_CONFIG.margin}
          compactType={multiMenuMode === "organise" ? "vertical" : null}
          draggableHandle=".module-drag-handle"
          draggableCancel=".module-actions-interactive"
          preventCollision={true}
          onLayoutChange={(layout, allLayouts) => handleLayoutChange(layout, allLayouts as Layouts)}
          onWidthChange={handleWidthChange}
        >
          {active?.modules.map((m) => {
            const meta = getModuleByType(m.type);
            if (!meta) return null;
            const ModuleComp = meta.component;
            return (
              <div key={m.id}>
                <ModuleWrapper moduleId={m.id}>
                  <ModuleComp moduleId={m.id} config={moduleConfigs[m.id]} />
                </ModuleWrapper>
              </div>
            );
          })}
        </ResponsiveGridLayout>
      </div>

      {/* Floating mode & add buttons */}
      {showMobileMultiMenu && (
        <div className="md:hidden">
          <MultiModeMenu />
        </div>
      )}
      <div className="hidden md:block">
        <MultiModeMenu />
      </div>
      <AddModuleButton />
      
      {/* Version display */}
      <AppVersion />

      {/* Configuration Sheet - off-canvas menu for module configuration */}
      <ConfigSheet />

      {/* Search results tab (right edge, only when results exist) and off-canvas panel */}
      <SearchResultsTab />
      <SearchResultsPanel />
      <LeftSidebarMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        username={username}
        isAuthenticated={Boolean(isAuthenticated)}
        onLogout={handleLogout}
      />
      {/* Cloud/local sync status indicator dot (bottom-left) */}
      <CloudStatusIndicator statusDotClass={statusDotClass} />
    </main>
  );
}
