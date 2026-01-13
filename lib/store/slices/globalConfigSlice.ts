import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface GlobalConfigState {
  theme: "light" | "dark" | "tron";
}

export const createInitialGlobalConfigState = (): GlobalConfigState => ({
  theme: "tron",
});

const initialState: GlobalConfigState = createInitialGlobalConfigState();

const globalConfigSlice = createSlice({
  name: "globalConfig",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<"light" | "dark" | "tron">) => {
      state.theme = action.payload;
    },
  },
});

export const { setTheme } = globalConfigSlice.actions;

export default globalConfigSlice.reducer;

