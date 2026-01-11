import { configureStore, combineReducers } from "@reduxjs/toolkit";
import dashboardsReducer from "./slices/dashboardsSlice";
import globalConfigReducer from "./slices/globalConfigSlice";
import moduleConfigsReducer from "./slices/moduleConfigsSlice";
import moduleLinksReducer from "./slices/moduleLinksSlice";
import todoReducer from "./slices/todoSlice";
import uiReducer from "./slices/uiSlice";
// Timer module slices
import timerReducer from "../../modules/timer/store/slices/timerSlice";
import { localStorageMiddleware } from "./middleware/localStorageMiddleware";
import { timerListenerMiddleware } from "../../modules/timer/store/listenerMiddleware";

const rootReducer = combineReducers({
  dashboards: dashboardsReducer,
  globalConfig: globalConfigReducer,
  moduleConfigs: moduleConfigsReducer,
  moduleLinks: moduleLinksReducer,
  todo: todoReducer,
  timer: timerReducer,
  ui: uiReducer,
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
