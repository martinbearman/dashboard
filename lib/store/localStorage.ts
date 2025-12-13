import { RootState } from "./store";
import { createInitialDashboardsState } from "./slices/dashboardsSlice";
import { createInitialGlobalConfigState } from "./slices/globalConfigSlice";
import { createInitialModuleConfigsState } from "./slices/moduleConfigsSlice";
import type { TodoState } from "./slices/todoSlice";

const STORAGE_KEY = "dashboard-state";

/**
 * Load state from localStorage (browser only)
 * Returns null if localStorage is unavailable or no saved state exists
 */
export function loadState(): Partial<RootState> | null {
  if (typeof window === "undefined") {
    // SSR: localStorage not available
    return null;
  }

  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return null;
    }
    const parsed = JSON.parse(serializedState) as Partial<RootState>;

    const defaultDashboards = createInitialDashboardsState();
    const defaultGlobalConfig = createInitialGlobalConfigState();
    const defaultModuleConfigs = createInitialModuleConfigsState();

    // Timer module initial states
    const defaultTimerState = {
      timeRemaining: 1500,
      isRunning: false,
      isBreak: false,
      studyDuration: 1500,
      breakDuration: 420,
      studyElapsedTime: 0,
      breakElapsedTime: 0,
      showBreakPrompt: false,
      breakMode: 'manual' as const,
    };
    
    const defaultTodoState: TodoState = {
      todosByList: {
        default: [],
      },
    };

    return {
      dashboards: {
        ...defaultDashboards,
        ...(parsed.dashboards ?? {}),
        dashboards: {
          ...defaultDashboards.dashboards,
          ...(parsed.dashboards?.dashboards ?? {}),
        },
        activeDashboardId:
          parsed.dashboards?.activeDashboardId ?? defaultDashboards.activeDashboardId,
      },
      globalConfig: {
        ...defaultGlobalConfig,
        ...(parsed.globalConfig ?? {}),
      },
      moduleConfigs: {
        ...defaultModuleConfigs,
        ...(parsed.moduleConfigs ?? {}),
      },
      timer: {
        ...defaultTimerState,
        ...(parsed.timer ?? {}),
      },
      todo: {
        ...defaultTodoState,
        ...(parsed.todo ?? {}),
        todosByList: Object.entries(parsed.todo?.todosByList ?? defaultTodoState.todosByList).reduce(
          (acc, [listId, todos]) => {
            acc[listId] = todos.map((todo) => ({
              ...todo,
              link: todo.link ?? null,
            }));
            return acc;
          },
          {} as TodoState["todosByList"]
        ),
      },
    };
  } catch (error) {
    console.warn("Failed to load state from localStorage:", error);
    return null;
  }
}

/**
 * Save state to localStorage (browser only)
 * Silently fails if localStorage is unavailable
 */
export function saveState(state: RootState): void {
  if (typeof window === "undefined") {
    // SSR: localStorage not available
    return;
  }

  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (error) {
    console.warn("Failed to save state to localStorage:", error);
    // localStorage might be full or disabled
  }
}

/**
 * Clear saved state from localStorage
 */
export function clearState(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear state from localStorage:", error);
  }
}

