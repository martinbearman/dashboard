import type { AppDispatch, RootState } from "../store";
import { updateModuleConfig } from "../slices/moduleConfigsSlice";
import { addModule } from "../slices/dashboardsSlice";
import { setModuleConfig } from "../slices/moduleConfigsSlice";
import { selectModulePositions } from "../selectors/dashboardSelectors";
import { moduleRegistry, DEFAULT_GRID_SIZE } from "@/modules/registry";
import type { ListItem } from "@/lib/types/dashboard";
import { GRID_COLS } from "@/lib/constants/grid";

/** Grid columns at lg breakpoint (used when computing next position) */
const LG_COLS = GRID_COLS.lg;

/**
 * Compute the next grid position so the new module doesn't overlap existing ones.
 * Used when no explicit position is provided (e.g. by LLM or caller).
 */
export function nextPosition(
  existing: { x: number; y: number; w: number; h: number }[]
): { x: number; y: number; w: number; h: number } {
  if (existing.length === 0) return { x: 0, y: 0, w: 4, h: 3 };
  const sorted = [...existing].sort((a, b) =>
    a.y !== b.y ? a.y - b.y : a.x - b.x
  );
  const last = sorted[sorted.length - 1];
  const nextX = last.x + last.w;
  if (nextX + last.w <= LG_COLS)
    return { x: nextX, y: last.y, w: last.w, h: last.h };
  return { x: 0, y: last.y + last.h, w: last.w, h: last.h };
}

export interface AddModuleToDashboardParams {
  dashboardId: string;
  type: string;
  /** Optional position/size. If omitted, uses nextPosition(existing) and registry defaults. */
  position?: Partial<{ x: number; y: number; w: number; h: number }>;
  /** Optional initial config override. Merged with type-derived defaults (e.g. ai-output items). */
  initialConfig?: Record<string, unknown>;
}

/**
 * Shared helper to add a module to a dashboard.
 * Used by the Add Module button and by the LLM/prompt flow (and later by LLM-chosen type/position).
 * Returns the new module's id so the caller can e.g. append content to it.
 */
export const addModuleToDashboard =
  (params: AddModuleToDashboardParams) =>
  (dispatch: AppDispatch, getState: () => RootState): string => {
    const { dashboardId, type, position: explicitPosition, initialConfig: configOverride } = params;
    // Read the latest Redux state so we can inspect the target dashboard
    const state = getState();
    const dashboard = state.dashboards.dashboards[dashboardId];
    if (!dashboard) throw new Error(`Dashboard not found: ${dashboardId}`);

    // Look up the module's metadata (default size, min/max constraints, etc.) from the registry
    const meta = moduleRegistry.find((m) => m.type === type);
    let size = meta?.defaultGridSize ?? DEFAULT_GRID_SIZE;
    if (meta?.minGridSize) {
      size = {
        w: Math.max(size.w, meta.minGridSize.w),
        h: Math.max(size.h, meta.minGridSize.h),
      };
    }
    if (meta?.maxGridSize) {
      size = {
        w: Math.min(size.w, meta.maxGridSize.w),
        h: Math.min(size.h, meta.maxGridSize.h),
      };
    }

    // Get grid positions of existing modules on this dashboard at the "lg" breakpoint
    const existingPositions = selectModulePositions(state, dashboardId, "lg");
    // Start from the requested size if provided, otherwise fall back to the registry/default size
    const w = explicitPosition?.w ?? size.w;
    const h = explicitPosition?.h ?? size.h;
    // Ensure the width/height are clamped to the module's min/max and a reasonable grid limit
    const clampedW = meta
      ? Math.min(Math.max(w, meta.minGridSize?.w ?? 0), meta.maxGridSize?.w ?? 12)
      : w;
    const clampedH = meta
      ? Math.min(Math.max(h, meta.minGridSize?.h ?? 0), meta.maxGridSize?.h ?? 12)
      : h;

    let x: number;
    let y: number;
    // If the caller explicitly provides x/y, honor those coordinates as-is
    if (
      explicitPosition != null &&
      typeof explicitPosition.x === "number" &&
      typeof explicitPosition.y === "number"
    ) {
      x = explicitPosition.x;
      y = explicitPosition.y;
    } else {
      // Otherwise compute the next free position based on where existing modules currently are
      const next = existingPositions.length
        ? nextPosition(existingPositions)
        : { x: 0, y: 0, w: clampedW, h: clampedH };
      x = next.x;
      y = next.y;
    }

    // Create a unique id for the new module so it can be referenced and configured
    const moduleId = crypto.randomUUID();
    dispatch(
      addModule({
        dashboardId,
        module: { id: moduleId, type },
        initialPosition: { x, y, w: clampedW, h: clampedH },
      })
    );

    // Build up the initial configuration object for the new module type
    let initialConfig: Record<string, unknown> = { ...configOverride };
    if (type === "ai-output" && !configOverride?.items) {
      // AI-output: default to an empty list of items if none is provided
      initialConfig = { ...initialConfig, items: initialConfig.items ?? [] };
    } else if (type === "todo") {
      // Todo: derive a stable list id and a human-friendly default list name
      const existingModules = dashboard.modules.filter(
        (m) => m.type === "todo" || m.type === "completed"
      );
      const count = existingModules.length + 1;
      initialConfig = {
        ...initialConfig,
        listId: initialConfig.listId ?? moduleId,
        listName: initialConfig.listName ?? `Todo List ${count}`,
      };
    } else if (type === "completed") {
      // Completed: default to "master" mode if the caller doesn't choose one
      initialConfig = { ...initialConfig, mode: initialConfig.mode ?? "master" };
    }

    dispatch(setModuleConfig({ moduleId, config: initialConfig }));
    return moduleId;
  };

/**
 * Thunk to populate an ai-output module with items.
 * Use when you have items ready (e.g. from API, AI, or hardcoded data).
 */
export const populateContentList =
  (moduleId: string, items: ListItem[], title?: string) =>
  (dispatch: AppDispatch) => {
    // Merge the items into the module config, and only set title if one is supplied
    dispatch(
      updateModuleConfig({
        moduleId,
        config: { items, ...(title !== undefined && { title }) },
      })
    );
  };
