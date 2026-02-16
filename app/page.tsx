"use client";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import DashboardTabs from "@/components/layout/DashboardTabs";
import LLMPromptBar from "@/components/layout/LLMPromptBar";
import AddModuleButton from "@/components/layout/AddModuleButton";
import AppVersion from "@/components/layout/AppVersion";
import ConfigSheet from "@/components/ui/ConfigSheet";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { getModuleByType } from "@/modules/registry";
import ModuleWrapper from "@/components/modules/ModuleWrapper";
import {
  updateDashboardLayouts,
} from "@/lib/store/slices/dashboardsSlice";
import { setGridContainerParams } from "@/lib/store/slices/uiSlice";
import { GRID_LAYOUT_CONFIG } from "@/lib/constants/grid";
import { WidthProvider, Responsive, type Layout, type Layouts } from "react-grid-layout";

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function Home() {
  // Read the active dashboard and all dashboards from Redux
  const { activeDashboardId, dashboards } = useAppSelector((s) => s.dashboards);
  const active = activeDashboardId ? dashboards[activeDashboardId] : null;
  const moduleConfigs = useAppSelector((s) => s.moduleConfigs.configs);
  const dispatch = useAppDispatch();

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

  return (
    <main className="min-h-screen bg-gradient-to-b to-blue-100 from-slate-600">
      <div className="sticky top-0 z-10 pt-2 pb-2 space-y-3">
        <DashboardTabs />
        <LLMPromptBar />
      </div>

      <div className="mx-auto px-4 pb-24 max-w-full">
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={GRID_LAYOUT_CONFIG.breakpoints}
          cols={GRID_LAYOUT_CONFIG.cols}
          rowHeight={GRID_LAYOUT_CONFIG.rowHeight}
          margin={GRID_LAYOUT_CONFIG.margin}
          compactType="vertical"
          draggableHandle=".module-drag-handle"
          draggableCancel=".module-actions-interactive"
          preventCollision={false}
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

      {/* Floating add button (will become a dropdown sourced from the registry) */}
      <AddModuleButton />
      
      {/* Version display */}
      <AppVersion />

      {/* Configuration Sheet - off-canvas menu for module configuration */}
      <ConfigSheet />
    </main>
  );
}