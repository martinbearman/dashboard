import { createSlice, PayloadAction } from '@reduxjs/toolkit'

/** Grid container params from react-grid-layout's onWidthChange callback */
export interface GridContainerParams {
  containerWidth: number;
  margin: [number, number];
  cols: number;
  containerPadding: [number, number] | null;
}

export interface UiState {
    activeDashboardId: string | null;
    moduleConfigPanel: { moduleId: string } | null;
    /** Latest grid container params from ResponsiveGridLayout onWidthChange */
    gridContainerParams: GridContainerParams | null;
};

const initialState: UiState = {
    activeDashboardId: null,
    moduleConfigPanel: null,
    gridContainerParams: null,
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
  },
});

export const { 
    setActiveDashboardId, 
    openModuleConfigPanel, 
    closeModuleConfigPanel,
    setGridContainerParams,
} = uiSlice.actions;

export default uiSlice.reducer;