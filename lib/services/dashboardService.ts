import type { AppDispatch, RootState } from "@/lib/store/store";
import { removeDashboard } from "@/lib/store/slices/dashboardsSlice";
import { removeModuleConfig } from "@/lib/store/slices/moduleConfigsSlice";
import { removeLinksForModules } from "@/lib/store/slices/moduleLinksSlice";

class DashboardService {
    /**
     * Removes a dashboard and all its associated data.
     * 
     * This coordinates multiple Redux actions to ensure consistent state:
     * - Removes module configs for all modules in the dashboard
     * - Removes module links for all modules in the dashboard
     * - Removes the dashboard itself (including modules and layouts)
     * 
     * @param dispatch - Redux dispatch function
     * @param getState - Redux getState function
     * @param dashboardId - ID of dashboard to remove
     */
    public static removeDashboard(
        dispatch: AppDispatch,
        getState: () => RootState,
        dashboardId: string
    ) {
        // Never remove the seeded default dashboard.
        if (dashboardId === "board-1") {
            return;
        }

        const state = getState();
        const dashboard = state.dashboards.dashboards[dashboardId];
        
        // Exit early if the requested dashboard no longer exists.
        if (!dashboard) {
            return;
        }

        // Collect all module IDs from this dashboard
        const moduleIds = dashboard.modules.map((module) => module.id);

        // Remove module configs for all modules
        moduleIds.forEach((moduleId) => {
            dispatch(removeModuleConfig(moduleId));
        });

        // Remove module links for all modules (bulk cleanup)
        if (moduleIds.length > 0) {
            dispatch(removeLinksForModules(moduleIds));
        }

        // Finally, remove the dashboard itself (this also removes modules and layouts)
        dispatch(removeDashboard(dashboardId));
    }
}

export default DashboardService;
