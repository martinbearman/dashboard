import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ModuleConfig = Record<string, any> & {
  locked: boolean;
};

export interface ModuleConfigsState {
  configs: Record<string, ModuleConfig>; // moduleId -> config object
}

export const createInitialModuleConfigsState = (): ModuleConfigsState => ({
  configs: {},
});

const ensureModuleConfig = (config?: Record<string, any>): ModuleConfig => ({
  locked: false,
  ...config,
});

const initialState: ModuleConfigsState = createInitialModuleConfigsState();

const moduleConfigsSlice = createSlice({
  name: "moduleConfigs",
  initialState,
  reducers: {
    setModuleConfig: (
      state,
      action: PayloadAction<{ moduleId: string; config: Record<string, any> }>
    ) => {
      state.configs[action.payload.moduleId] = ensureModuleConfig(
        action.payload.config
      );
    },
    updateModuleConfig: (
      state,
      action: PayloadAction<{ moduleId: string; config: Partial<Record<string, any>> }>
    ) => {
      const existing =
        state.configs[action.payload.moduleId] ?? ensureModuleConfig();
      state.configs[action.payload.moduleId] = ensureModuleConfig({
        ...existing,
        ...action.payload.config,
      });
    },
    removeModuleConfig: (state, action: PayloadAction<string>) => {
      delete state.configs[action.payload];
    },
  },
});

export const { setModuleConfig, updateModuleConfig, removeModuleConfig } =
  moduleConfigsSlice.actions;

export default moduleConfigsSlice.reducer;

