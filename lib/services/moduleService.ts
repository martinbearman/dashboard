import type { AppDispatch } from "@/lib/store/store";
import { removeModule } from "@/lib/store/slices/dashboardsSlice";
import { removeModuleConfig } from "@/lib/store/slices/moduleConfigsSlice";

class ModuleService {
    /**
     * Removes a module and all its associated data.
     * 
     * This coordinates multiple Redux actions to ensure consistent state:
     * - Removes module from dashboard (including layout cleanup)
     * - Removes module config
     * 
     * @param moduleId - ID of module to remove
     * @param dashboardId - ID of dashboard containing the module
     * @param dispatch - Redux dispatch function
     */
    public static removeModule(dispatch: AppDispatch, dashboardId: string, moduleId: string) {
        dispatch(removeModule({ dashboardId, moduleId }));
        dispatch(removeModuleConfig(moduleId));
    }
}

export default ModuleService;