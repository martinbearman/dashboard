import { createSlice, PayloadAction } from '@reduxjs/toolkit'

/** Grid container params from react-grid-layout's onWidthChange callback */
export interface GridContainerParams {
  containerWidth: number;
  margin: [number, number];
  cols: number;
  containerPadding: [number, number] | null;
}

export type MultiMenuMode = "context" | "organise" | "delete" | "stash" | null;

export interface UiState {
  activeDashboardId: string | null;
  moduleConfigPanel: { moduleId: string } | null;
  /** Latest grid container params from ResponsiveGridLayout onWidthChange */
  gridContainerParams: GridContainerParams | null;
  /** Current multi-mode menu selection (C/O/D/S) */
  multiMenuMode: MultiMenuMode;
  /** Modules currently selected for multi-actions (context/delete/stash/organise) */
  selectedModuleIds: string[];
};

const initialState: UiState = {
  activeDashboardId: null,
  moduleConfigPanel: null,
  gridContainerParams: null,
  multiMenuMode: null,
  selectedModuleIds: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveDashboardId: (state, action: PayloadAction<string>) => {
      state.activeDashboardId = action.payload;
    },
    openModuleConfigPanel: (state, action: PayloadAction<{ moduleId: string }>) => {
      state.moduleConfigPanel = action.payload;
    },
    closeModuleConfigPanel: (state) => {
      state.moduleConfigPanel = null;
    },
    setGridContainerParams: (state, action: PayloadAction<GridContainerParams | null>) => {
      state.gridContainerParams = action.payload;
    },
    setMultiMenuMode: (state, action: PayloadAction<MultiMenuMode>) => {
      state.multiMenuMode = action.payload;
      // Clear selection when turning mode off
      if (!action.payload) {
        state.selectedModuleIds = [];
      }
    },
    toggleModuleSelected: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.selectedModuleIds.includes(id)) {
        state.selectedModuleIds = state.selectedModuleIds.filter((moduleId) => moduleId !== id);
      } else {
        state.selectedModuleIds.push(id);
      }
    },
    clearSelectedModules: (state) => {
      state.selectedModuleIds = [];
    },
  },
});

export const { 
    setActiveDashboardId, 
    openModuleConfigPanel, 
    closeModuleConfigPanel,
    setGridContainerParams,
    setMultiMenuMode,
    toggleModuleSelected,
    clearSelectedModules,
} = uiSlice.actions;

export default uiSlice.reducer;