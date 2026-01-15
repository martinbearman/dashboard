import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../store'

export interface UiState {
    activeDashboardId: string | null;
    moduleConfigPanel: { moduleId: string } | null;
    dashboardSettingsPanel: boolean;
};

const initialState: UiState = {
    activeDashboardId: null,
    moduleConfigPanel: null,
    dashboardSettingsPanel: false,
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
    openDashboardSettingsPanel: (state) => {
      state.dashboardSettingsPanel = true;
    },
    closeDashboardSettingsPanel: (state) => {
      state.dashboardSettingsPanel = false;
    },
  },
});

export const { 
    setActiveDashboardId, 
    openModuleConfigPanel, 
    closeModuleConfigPanel,
    openDashboardSettingsPanel,
    closeDashboardSettingsPanel
} = uiSlice.actions;

export default uiSlice.reducer;