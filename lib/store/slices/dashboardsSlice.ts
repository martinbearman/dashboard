import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Dashboard, ModuleInstance, Breakpoint } from "@/lib/types/dashboard";
import type { Layout, Layouts } from "react-grid-layout";
import { GRID_BREAKPOINTS } from "@/lib/constants/grid";

export interface DashboardsState {
  activeDashboardId: string | null;
  dashboards: Record<string, Dashboard>;
}

export const createInitialDashboardsState = (): DashboardsState => ({
  activeDashboardId: "board-1",
  dashboards: {
    "board-1": {
      id: "board-1",
      name: "Board 1",
      modules: [
        {
          id: "m-1",
          type: "Timer", // Pomodoro Timer
        },
        {
          id: "m-2",
          type: "todo", // Todo List
        },
        {
          id: "m-3",
          type: "quote", // Quotes
        },
        {
          id: "m-4",
          type: "completed", // Completed Tasks
        },
      ],
      layouts: {
        lg: [
          { i: "m-1", x: 0, y: 0, w: 6, h: 3 },
          { i: "m-2", x: 6, y: 0, w: 6, h: 3 },
          { i: "m-3", x: 0, y: 3, w: 6, h: 3 },
          { i: "m-4", x: 6, y: 3, w: 6, h: 3 }
        ],
        md: [
          { i: "m-1", x: 0, y: 0, w: 3, h: 3 },
          { i: "m-2", x: 3, y: 0, w: 3, h: 3 },
          { i: "m-3", x: 0, y: 3, w: 3, h: 3 },
          { i: "m-4", x: 3, y: 3, w: 3, h: 3 }
        ],
        sm: [
          { i: "m-1", x: 0, y: 0, w: 3, h: 3 },
          { i: "m-2", x: 3, y: 0, w: 3, h: 3 },
          { i: "m-3", x: 0, y: 3, w: 3, h: 3 },
          { i: "m-4", x: 3, y: 3, w: 3, h: 3 }
        ],
        xs: [
          { i: "m-1", x: 0, y: 0, w: 3, h: 3 },
          { i: "m-2", x: 0, y: 3, w: 3, h: 3 },
          { i: "m-3", x: 0, y: 6, w: 3, h: 3 },
          { i: "m-4", x: 0, y: 9, w: 3, h: 3 }
        ],
        xxs: [
          { i: "m-1", x: 0, y: 0, w: 1, h: 3 },
          { i: "m-2", x: 0, y: 3, w: 1, h: 3 },
          { i: "m-3", x: 0, y: 6, w: 1, h: 3 },
          { i: "m-4", x: 0, y: 9, w: 1, h: 3 }
        ]
      }
    },
  },
});

// Default initial state (used if no saved state exists)
const initialState: DashboardsState = createInitialDashboardsState();

const dashboardsSlice = createSlice({
  name: "dashboards",
  initialState,
  reducers: {
    addDashboard: (state, action: PayloadAction<Dashboard>) => {
      state.dashboards[action.payload.id] = action.payload;
      if (!state.activeDashboardId) {
        state.activeDashboardId = action.payload.id;
      }
    },
    setActiveDashboard: (state, action: PayloadAction<string>) => {
      if (state.dashboards[action.payload]) {
        state.activeDashboardId = action.payload;
      }
    },
    addModule: (
      state, 
      action: PayloadAction<{ 
        dashboardId: string; 
        module: ModuleInstance;
        initialPosition: { x: number; y: number; w: number; h: number };
      }>
    ) => {
      const { dashboardId, module, initialPosition } = action.payload;
      const dashboard = state.dashboards[dashboardId];
      if (!dashboard) return;
    
      dashboard.modules.push(module);
    
      dashboard.layouts = dashboard.layouts ?? {};
    
      // Initialize the module in all breakpoint layouts with the initial position
      // Layouts are now the single source of truth for module positions
      GRID_BREAKPOINTS.forEach((bp) => {
        const layout = dashboard.layouts![bp];
    
        if (layout) {
          // Remove any stale entry for this module (defensive)
          dashboard.layouts![bp] = layout.filter((item) => item.i !== module.id);
          dashboard.layouts![bp]!.push({
            i: module.id,
            x: initialPosition.x,
            y: initialPosition.y,
            w: initialPosition.w,
            h: initialPosition.h,
          });
        } else {
          // No layout for this breakpoint yet; create it with just this module
          dashboard.layouts![bp] = [{
            i: module.id,
            x: initialPosition.x,
            y: initialPosition.y,
            w: initialPosition.w,
            h: initialPosition.h,
          }];
        }
      });
    },
    removeModule: (
      state,
      action: PayloadAction<{ dashboardId: string; moduleId: string }>
    ) => {
      const { dashboardId, moduleId } = action.payload;
      const dashboard = state.dashboards[dashboardId];
      if (!dashboard) return;
    
      dashboard.modules = dashboard.modules.filter((m) => m.id !== moduleId);
    
      if (dashboard.layouts) {
        GRID_BREAKPOINTS.forEach((bp) => {
          const layout = dashboard.layouts![bp];
          if (layout) {
            // Drop the module from every breakpoint layout to avoid ghost grid items
            dashboard.layouts![bp] = layout.filter((item) => item.i !== moduleId);
          }
        });
      }
    },
    // Note: updateModulePosition has been removed.
    // Module positions are now stored only in Dashboard.layouts.
    // Use updateDashboardLayouts to update positions when layouts change.
    removeDashboard: (state, action: PayloadAction<string>) => {
      const dashboardId = action.payload;
      // Never remove the seeded default dashboard.
      if (dashboardId === "board-1") {
        return;
      }
      // Exit early if the requested dashboard no longer exists.
      if (!state.dashboards[dashboardId]) {
        return;
      }

      // Sort ids so we can deterministically pick neighbouring dashboards.
      const sortedIds = Object.keys(state.dashboards).sort((a, b) => {
        const [, aSuffix] = a.split("-");
        const [, bSuffix] = b.split("-");
        const aNum = Number(aSuffix);
        const bNum = Number(bSuffix);
        if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
          return aNum - bNum;
        }
        return a.localeCompare(b);
      });

      // Track the position of the dashboard being deleted within the sorted list.
      const index = sortedIds.indexOf(dashboardId);

      // Remove the dashboard from the collection.
      delete state.dashboards[dashboardId];

      // Keep a list of the remaining dashboards that still exist in state.
      const remainingIds = sortedIds.filter((id) => id !== dashboardId && state.dashboards[id]);

      if (state.activeDashboardId === dashboardId) {
        // Prefer the previous sorted dashboard, otherwise the next, otherwise the first remaining.
        const previousId = index > 0 ? sortedIds[index - 1] : undefined;
        const nextId = sortedIds[index + 1];

        const candidate =
          (previousId && state.dashboards[previousId] ? previousId : undefined) ??
          (nextId && state.dashboards[nextId] ? nextId : undefined) ??
          remainingIds[0] ??
          null;

        state.activeDashboardId = candidate;
      }

      if (state.activeDashboardId && !state.dashboards[state.activeDashboardId]) {
        // Active id points to a removed dashboard; fall back to the first available.
        state.activeDashboardId = remainingIds[0] ?? null;
      }

      if (!state.activeDashboardId && remainingIds.length > 0) {
        // No active dashboard selected yet; promote the first remaining option.
        state.activeDashboardId = remainingIds[0];
      }
    },
    updateDashboardLayouts: (
      state,
      action: PayloadAction<{
        dashboardId: string;
        layouts: Partial<Record<Breakpoint, Layout[]>> | Layouts;
      }>
    ) => {
      const dashboard = state.dashboards[action.payload.dashboardId];
      if (!dashboard) return;
      // Merge the layouts emitted by react-grid-layout so each breakpoint persists its latest arrangement
      dashboard.layouts = {
        ...dashboard.layouts,
        ...action.payload.layouts,
      };
    },
    updateDashboardName: (
      state,
      action: PayloadAction<{ dashboardId: string; name: string }>
    ) => {
      const dashboard = state.dashboards[action.payload.dashboardId];
      if (!dashboard) return;
      // Trim whitespace and ensure non-empty name
      const trimmedName = action.payload.name.trim();
      if (trimmedName.length > 0) {
        dashboard.name = trimmedName;
      }
    }
  },
});

export const {
  addDashboard,
  setActiveDashboard,
  addModule,
  removeModule,
  removeDashboard,
  updateDashboardLayouts,
  updateDashboardName
} = dashboardsSlice.actions;

export default dashboardsSlice.reducer;

