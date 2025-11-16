import { configureStore, combineReducers } from "@reduxjs/toolkit";
import dashboardsReducer from "./slices/dashboardsSlice";
import globalConfigReducer from "./slices/globalConfigSlice";
import moduleConfigsReducer from "./slices/moduleConfigsSlice";
import todoReducer from "./slices/todoSlice";
// Timer module slices
import timerReducer from "../../modules/timer/store/slices/timerSlice";
import goalReducer from "../../modules/timer/store/slices/goalSlice";
import { localStorageMiddleware } from "./middleware/localStorageMiddleware";
import { timerListenerMiddleware } from "../../modules/timer/store/listenerMiddleware";

const rootReducer = combineReducers({
  dashboards: dashboardsReducer,
  globalConfig: globalConfigReducer,
  moduleConfigs: moduleConfigsReducer,
  todo: todoReducer,
  timer: timerReducer,
  goal: goalReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export const makeStore = (preloadedState?: Partial<RootState>) => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .prepend(timerListenerMiddleware.middleware)
        .concat(localStorageMiddleware),
    // Preload state from localStorage (passed from StoreProvider)
    preloadedState: preloadedState || undefined,
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];

