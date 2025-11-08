"use client";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import DashboardTabs from "@/components/layout/DashboardTabs";
import AddModuleButton from "@/components/layout/AddModuleButton";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { getModuleByType } from "@/modules/registry";
import ModuleWrapper from "@/components/modules/ModuleWrapper";
import { updateModulePosition } from "@/lib/store/slices/dashboardsSlice";
import { WidthProvider, Responsive, type Layout } from "react-grid-layout";

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function Home() {
  // Read the active dashboard and all dashboards from Redux
  const { activeDashboardId, dashboards } = useAppSelector((s) => s.dashboards);
  const active = activeDashboardId ? dashboards[activeDashboardId] : null;
  const dispatch = useAppDispatch();

  const layouts = {
    lg:
      active?.modules.map<Layout>((m) => ({
        i: m.id,
        x: m.gridPosition.x,
        y: m.gridPosition.y,
        w: m.gridPosition.w,
        h: m.gridPosition.h,
      })) ?? [],
  };

  function handleLayoutChange(current: Layout[]) {
    if (!active) return;
    current.forEach(({ i, x, y, w, h }) => {
      dispatch(
        updateModulePosition({
          dashboardId: active.id,
          moduleId: i,
          position: { x, y, w, h },
        })
      );
    });
  }

  return (
    <main className="min-h-screen bg-gradient-to-b to-blue-100 from-slate-600">
      <div className="py-6">
        {/* dashboard tabs (centered) */}
        <DashboardTabs />
      </div>

      <div className="container mx-auto px-4 pb-24">
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1024, md: 768, sm: 640, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 8, sm: 6, xs: 4, xxs: 1 }}
          rowHeight={32}
          margin={[16, 16]}
          compactType="vertical"
          preventCollision={false}
          onLayoutChange={(layout) => handleLayoutChange(layout)}
        >
          {active?.modules.map((m) => {
            const meta = getModuleByType(m.type);
            if (!meta) return null;
            const ModuleComp = meta.component;
            return (
              <div
                key={m.id}
                data-grid={{
                  x: m.gridPosition.x,
                  y: m.gridPosition.y,
                  w: m.gridPosition.w,
                  h: m.gridPosition.h,
                }}
              >
                <ModuleWrapper>
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