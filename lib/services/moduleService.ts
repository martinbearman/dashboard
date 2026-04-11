import type { AppDispatch, RootState } from "@/lib/store/store";
import { removeModule } from "@/lib/store/slices/dashboardsSlice";
import { removeModuleConfig } from "@/lib/store/slices/moduleConfigsSlice";
import { removeLinksForModule } from "@/lib/store/slices/moduleLinksSlice";

class ModuleService {
    /**
     * Removes a module and all its associated data.
     *
     * This coordinates multiple Redux actions to ensure consistent state:
     * - Removes module from dashboard (including layout cleanup)
     * - Removes module config
     *
     * Locked modules are never removed (see module config `locked`).
     *
     * @param moduleId - ID of module to remove
     * @param dashboardId - ID of dashboard containing the module
     * @param dispatch - Redux dispatch function
     * @param getState - Read current state to respect `locked` on the module config
     */
    public static removeModule(
        dispatch: AppDispatch,
        getState: () => RootState,
        dashboardId: string,
        moduleId: string,
    ) {
        if (getState().moduleConfigs.configs[moduleId]?.locked) {
            return;
        }
        dispatch(removeModule({ dashboardId, moduleId }));
        dispatch(removeModuleConfig(moduleId));
        dispatch(removeLinksForModule(moduleId));
    }
}

export default ModuleService;