import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import type { Breakpoint } from "@/lib/types/dashboard";

/**
 * Selector to get a dashboard by ID
 */
export const selectDashboardById = (state: RootState, dashboardId: string) => {
  return state.dashboards.dashboards[dashboardId] ?? null;
};

/**
 * Selector to get the active dashboard
 */
export const selectActiveDashboard = createSelector(
  [(state: RootState) => state.dashboards],
  (dashboardsState) => {
    if (!dashboardsState.activeDashboardId) return null;
    return dashboardsState.dashboards[dashboardsState.activeDashboardId] ?? null;
  }
);

/**
 * Derives gridPosition for a module from the layouts.
 * This replaces the stored gridPosition property - layouts are now the single source of truth.
 * 
 * @param state - Redux state
 * @param moduleId - ID of the module
 * @param breakpoint - Breakpoint to get position for (defaults to "lg")
 * @returns Position object or null if not found
 */
export const selectModuleGridPosition = createSelector(
  [
    (state: RootState, moduleId: string, breakpoint: Breakpoint = "lg") => {
      // Find the dashboard containing this module
      const dashboard = Object.values(state.dashboards.dashboards).find((d) =>
        d.modules.some((m) => m.id === moduleId)
      );
      return dashboard;
    },
    (_: RootState, moduleId: string) => moduleId,
    (_: RootState, _moduleId: string, breakpoint: Breakpoint = "lg") => breakpoint,
  ],
  (dashboard, moduleId, breakpoint) => {
    if (!dashboard?.layouts?.[breakpoint]) {
      return null;
    }

    const layoutItem = dashboard.layouts[breakpoint]!.find((item) => item.i === moduleId);

    if (!layoutItem) {
      return null;
    }

    // Derive gridPosition from the layout
    return {
      x: layoutItem.x,
      y: layoutItem.y,
      w: layoutItem.w,
      h: layoutItem.h,
    };
  }
);

/**
 * Gets all module positions for a given breakpoint.
 * Useful for calculating next position when adding modules.
 * 
 * @param state - Redux state
 * @param dashboardId - ID of the dashboard
 * @param breakpoint - Breakpoint to get positions for (defaults to "lg")
 * @returns Array of position objects
 */
export const selectModulePositions = createSelector(
  [
    (state: RootState, dashboardId: string) => {
      return state.dashboards.dashboards[dashboardId] ?? null;
    },
    (_: RootState, _dashboardId: string, breakpoint: Breakpoint = "lg") => breakpoint,
  ],
  (dashboard, breakpoint) => {
    if (!dashboard?.layouts?.[breakpoint]) {
      return [];
    }

    return dashboard.layouts[breakpoint]!.map((item) => ({
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
    }));
  }
);

