import type { AppDispatch } from "../store";
import { updateModuleConfig } from "../slices/moduleConfigsSlice";
import type { ListItem } from "@/lib/types/dashboard";

/**
 * Thunk to populate a content-list module with items.
 * Use when you have items ready (e.g. from API, AI, or hardcoded data).
 */
export const populateContentList =
  (moduleId: string, items: ListItem[], title?: string) =>
  (dispatch: AppDispatch) => {
    dispatch(
      updateModuleConfig({
        moduleId,
        config: { items, ...(title !== undefined && { title }) },
      })
    );
  };
