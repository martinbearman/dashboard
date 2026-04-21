import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { SearchResult } from '@/lib/types/search';

/** Grid container params from react-grid-layout's onWidthChange callback */
export interface GridContainerParams {
  containerWidth: number;
  margin: [number, number];
  cols: number;
  containerPadding: [number, number] | null;
}

export type MultiMenuMode = "context" | "organise" | "remove" | "search" | null;

/** Search results slide-out panel: query, results list, and selected ids for "Add selected". */
export interface SearchResultsPanelState {
  isOpen: boolean;
  query: string | null;
  results: SearchResult[];
  selectedResultIds: string[];
}

export interface UiState {
  moduleConfigPanel: { moduleId: string } | null;
  /** Latest grid container params from ResponsiveGridLayout onWidthChange */
  gridContainerParams: GridContainerParams | null;
  /** Current multi-mode menu selection (C/O/R/S) */
  multiMenuMode: MultiMenuMode;
  /** Modules currently selected for multi-actions (context/remove/search/organise) */
  selectedModuleIds: string[];
  /** Off-canvas search results panel (images now; later text, etc.) */
  searchResultsPanel: SearchResultsPanelState;
}

const initialSearchResultsPanel: SearchResultsPanelState = {
  isOpen: false,
  query: null,
  results: [],
  selectedResultIds: [],
};

const initialState: UiState = {
  moduleConfigPanel: null,
  gridContainerParams: null,
  multiMenuMode: null,
  selectedModuleIds: [],
  searchResultsPanel: initialSearchResultsPanel,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
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
      // Clear legacy module selection when turning mode off or entering search mode.
      if (!action.payload || action.payload === "search") {
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
    openSearchResultsPanel: (
      state,
      action: PayloadAction<{ query: string; results: SearchResult[] }>
    ) => {
      state.searchResultsPanel = {
        isOpen: true,
        query: action.payload.query,
        results: action.payload.results,
        selectedResultIds: [],
      };
    },
    closeSearchResultsPanel: (state) => {
      state.searchResultsPanel.isOpen = false;
    },
    toggleSearchResultsPanel: (state) => {
      if (state.searchResultsPanel.results.length > 0) {
        state.searchResultsPanel.isOpen = !state.searchResultsPanel.isOpen;
      }
    },
    toggleSearchResultSelected: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const ids = state.searchResultsPanel.selectedResultIds;
      if (ids.includes(id)) {
        state.searchResultsPanel.selectedResultIds = ids.filter((x) => x !== id);
      } else {
        state.searchResultsPanel.selectedResultIds = [...ids, id];
      }
    },
    clearSearchResultSelection: (state) => {
      state.searchResultsPanel.selectedResultIds = [];
    },
  },
});

export const {
    openModuleConfigPanel,
    closeModuleConfigPanel,
    setGridContainerParams,
    setMultiMenuMode,
    toggleModuleSelected,
    clearSelectedModules,
    openSearchResultsPanel,
    closeSearchResultsPanel,
    toggleSearchResultsPanel,
    toggleSearchResultSelected,
    clearSearchResultSelection,
} = uiSlice.actions;

export default uiSlice.reducer;