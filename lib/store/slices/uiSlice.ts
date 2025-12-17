import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../store'

export interface UiState {
    activeDashboardId: string | null;
    moduleConfigPanel: { moduleId: string } | null;
};

const initialState: UiState = {
    activeDashboardId: null,
    moduleConfigPanel: null,
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
  },
});

export const { 
    setActiveDashboardId, 
    openModuleConfigPanel, 
    closeModuleConfigPanel 
} = uiSlice.actions;

export default uiSlice.reducer;