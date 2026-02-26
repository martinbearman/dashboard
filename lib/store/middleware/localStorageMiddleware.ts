import { Middleware } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { saveState } from "../localStorage";

const DEBOUNCE_TIME = 1000;
let saveTimeoutID: ReturnType<typeof setTimeout> | null = null;

export const localStorageMiddleware: Middleware<{}, RootState> =
  (store) => (next) => (action) => {
    const result = next(action);
    const state = store.getState();
    
    if(saveTimeoutID !== null) {
      clearTimeout(saveTimeoutID);
    }

    saveTimeoutID = setTimeout(() => {
      saveState(state);
    }, DEBOUNCE_TIME);
    
    (state);
    saveState
    return result;
  };

