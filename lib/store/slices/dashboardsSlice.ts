import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Dashboard, ModuleInstance } from "@/lib/types/dashboard";

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
          type: "timer", // matches your registry
          gridPosition: { x: 0, y: 0, w: 3, h: 2 },
        },
      ],
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
      action: PayloadAction<{ dashboardId: string; module: ModuleInstance }>
    ) => {
      const dashboard = state.dashboards[action.payload.dashboardId];
      if (dashboard) {
        dashboard.modules.push(action.payload.module);
      }
    },
    removeModule: (
      state,
      action: PayloadAction<{ dashboardId: string; moduleId: string }>
    ) => {
      const dashboard = state.dashboards[action.payload.dashboardId];
      if (dashboard) {
        dashboard.modules = dashboard.modules.filter(
          (m) => m.id !== action.payload.moduleId
        );
      }
    },
    updateModulePosition: (
      state,
      action: PayloadAction<{
        dashboardId: string;
        moduleId: string;
        position: { x: number; y: number; w: number; h: number };
      }>
    ) => {
      const dashboard = state.dashboards[action.payload.dashboardId];
      if (dashboard) {
        const moduleInstance = dashboard.modules.find(
          (m) => m.id === action.payload.moduleId
        );
        if (moduleInstance) {
          moduleInstance.gridPosition = action.payload.position;
        }
      }
    },
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
  },
});

export const {
  addDashboard,
  setActiveDashboard,
  addModule,
  removeModule,
  updateModulePosition,
  removeDashboard,
} = dashboardsSlice.actions;

export default dashboardsSlice.reducer;

