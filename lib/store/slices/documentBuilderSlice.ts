import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { DocumentBlock } from "@/lib/types/document";

/**
 * Document builder state: one ordered list of blocks per module instance (keyed by moduleId).
 */
export interface DocumentBuilderState {
  byModuleId: Record<string, DocumentBlock[]>;
}

const initialState: DocumentBuilderState = {
  byModuleId: {},
};

function getBlocks(state: DocumentBuilderState, moduleId: string): DocumentBlock[] {
  if (!state.byModuleId[moduleId]) {
    state.byModuleId[moduleId] = [];
  }
  return state.byModuleId[moduleId];
}

const documentBuilderSlice = createSlice({
  name: "documentBuilder",
  initialState,
  reducers: {
    setBlocks: (
      state,
      action: PayloadAction<{ moduleId: string; blocks: DocumentBlock[] }>
    ) => {
      const { moduleId, blocks } = action.payload;
      state.byModuleId[moduleId] = blocks;
    },

    addBlock: (
      state,
      action: PayloadAction<{ moduleId: string; block: DocumentBlock }>
    ) => {
      const { moduleId, block } = action.payload;
      const list = getBlocks(state, moduleId);
      list.push(block);
    },

    updateBlock: (
      state,
      action: PayloadAction<{
        moduleId: string;
        blockId: string;
        updates: Partial<Omit<DocumentBlock, "id" | "type">>;
      }>
    ) => {
      const { moduleId, blockId, updates } = action.payload;
      const list = getBlocks(state, moduleId);
      const block = list.find((b) => b.id === blockId);
      if (block) Object.assign(block, updates);
    },

    removeBlock: (
      state,
      action: PayloadAction<{ moduleId: string; blockId: string }>
    ) => {
      const { moduleId, blockId } = action.payload;
      const list = state.byModuleId[moduleId];
      if (!list) return;
      const idx = list.findIndex((b) => b.id === blockId);
      if (idx !== -1) list.splice(idx, 1);
    },

    reorderBlocks: (
      state,
      action: PayloadAction<{
        moduleId: string;
        activeId: string;
        overId: string;
      }>
    ) => {
      const { moduleId, activeId, overId } = action.payload;
      const list = state.byModuleId[moduleId];
      if (!list) return;
      const oldIndex = list.findIndex((b) => b.id === activeId);
      const newIndex = list.findIndex((b) => b.id === overId);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
      const [moved] = list.splice(oldIndex, 1);
      list.splice(newIndex, 0, moved);
    },
  },
});

export const {
  setBlocks,
  addBlock,
  updateBlock,
  removeBlock,
  reorderBlocks,
} = documentBuilderSlice.actions;
export default documentBuilderSlice.reducer;
