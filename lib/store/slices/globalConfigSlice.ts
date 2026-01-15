import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DEFAULT_THEME_ID, migrateLegacyTheme } from "@/lib/constants/themes";

export interface GlobalConfigState {
  /** Default theme ID that new dashboards inherit */
  defaultTheme: string;
}

export const createInitialGlobalConfigState = (): GlobalConfigState => ({
  defaultTheme: DEFAULT_THEME_ID,
});

const initialState: GlobalConfigState = createInitialGlobalConfigState();

const globalConfigSlice = createSlice({
  name: "globalConfig",
  initialState,
  reducers: {
    setDefaultTheme: (state, action: PayloadAction<string>) => {
      state.defaultTheme = action.payload;
    },
    /** @deprecated Legacy action - kept for migration compatibility */
    setTheme: (state, action: PayloadAction<"light" | "dark" | "tron">) => {
      // Migrate legacy theme to new theme ID system
      state.defaultTheme = migrateLegacyTheme(action.payload);
    },
  },
});

export const { setDefaultTheme, setTheme } = globalConfigSlice.actions;

export default globalConfigSlice.reducer;

