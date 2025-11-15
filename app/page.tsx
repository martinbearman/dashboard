"use client";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import DashboardTabs from "@/components/layout/DashboardTabs";
import AddModuleButton from "@/components/layout/AddModuleButton";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { getModuleByType } from "@/modules/registry";
import ModuleWrapper from "@/components/modules/ModuleWrapper";
import {
  updateModulePosition,
  updateDashboardLayouts,
} from "@/lib/store/slices/dashboardsSlice";
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
  
  // Mark locked modules as static (non-draggable)
  const layouts: Layouts = Object.keys(baseLayouts).reduce((acc, bp) => {
    acc[bp as keyof Layouts] = baseLayouts[bp as keyof Layouts].map((item) => ({
      ...item,
      static: moduleConfigs[item.i]?.locked ?? false,
    }));
    return acc;
  }, {} as Layouts);

  function handleLayoutChange(current: Layout[], allLayouts: Layouts) {
    if (!active) return;
    // Update the canonical gridPosition for each module (used by modules and default layout seeds)
    current.forEach(({ i, x, y, w, h }) => {
      dispatch(
        updateModulePosition({
          dashboardId: active.id,
          moduleId: i,
          position: { x, y, w, h },
        })
      );
    });
    // Persist the complete set of breakpoint layouts so drag/resize survives reloads
    dispatch(
      updateDashboardLayouts({
        dashboardId: active.id,
        layouts: allLayouts,
      })
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b to-blue-100 from-slate-600">
      <div className="py-6">
        {/* dashboard tabs (centered) */}
        <DashboardTabs />
      </div>

      <div className="mx-auto px-4 pb-24 max-w-full">
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1024, md: 768, sm: 640, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 8, sm: 6, xs: 4, xxs: 1 }}
          rowHeight={150}
          margin={[16, 16]}
          compactType="vertical"
          draggableHandle=".module-drag-handle"
          draggableCancel=".module-actions-interactive"
          preventCollision={false}
          onLayoutChange={(layout, allLayouts) => handleLayoutChange(layout, allLayouts as Layouts)}
        >
          {active?.modules.map((m) => {
            const meta = getModuleByType(m.type);
            if (!meta) return null;
            const ModuleComp = meta.component;
            return (
              <div key={m.id}>
                <ModuleWrapper moduleId={m.id}>
                  <ModuleComp moduleId={m.id} />
                </ModuleWrapper>
              </div>
            );
          })}
        </ResponsiveGridLayout>
      </div>

      {/* Floating add button (will become a dropdown sourced from the registry) */}
      <AddModuleButton />
    </main>
  );
}