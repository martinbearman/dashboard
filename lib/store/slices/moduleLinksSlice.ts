import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ModuleLink, LinkPattern, LinkMetadata } from "@/lib/types/dashboard";

export interface ModuleLinksState {
  links: Record<string, ModuleLink>; // linkId -> ModuleLink
}

export const createInitialModuleLinksState = (): ModuleLinksState => ({
  links: {},
});

const initialState: ModuleLinksState = createInitialModuleLinksState();

const moduleLinksSlice = createSlice({
  name: "moduleLinks",
  initialState,
  reducers: {
    /**
     * Add a new link between modules
     */
    addLink: (
      state,
      action: PayloadAction<{
        sourceModuleId: string;
        targetModuleId: string;
        pattern: LinkPattern;
        metadata?: LinkMetadata;
        id?: string; // Optional - will be generated if not provided
      }>
    ) => {
      const { sourceModuleId, targetModuleId, pattern, metadata = {}, id } = action.payload;
      
      const linkId = id ?? crypto.randomUUID();
      
      const newLink: ModuleLink = {
        id: linkId,
        sourceModuleId,
        targetModuleId,
        pattern,
        metadata: {
          enabled: true,
          ...metadata,
        },
        createdAt: Date.now(),
      };
      
      state.links[linkId] = newLink;
    },
    
    /**
     * Update an existing link's metadata or pattern
     */
    updateLink: (
      state,
      action: PayloadAction<{
        linkId: string;
        updates: {
          pattern?: LinkPattern;
          metadata?: Partial<LinkMetadata>;
        };
      }>
    ) => {
      const { linkId, updates } = action.payload;
      const existingLink = state.links[linkId];
      
      if (!existingLink) return;
      
      state.links[linkId] = {
        ...existingLink,
        ...(updates.pattern && { pattern: updates.pattern }),
        ...(updates.metadata && {
          metadata: {
            ...existingLink.metadata,
            ...updates.metadata,
          },
        }),
      };
    },
    
    /**
     * Remove a specific link
     */
    removeLink: (state, action: PayloadAction<string>) => {
      delete state.links[action.payload];
    },
    
    /**
     * Remove all links for a module (when module is deleted)
     * This handles both source and target relationships
     */
    removeLinksForModule: (state, action: PayloadAction<string>) => {
      const moduleId = action.payload;
      const linkIds = Object.keys(state.links);
      
      linkIds.forEach((linkId) => {
        const link = state.links[linkId];
        if (
          link.sourceModuleId === moduleId ||
          link.targetModuleId === moduleId
        ) {
          delete state.links[linkId];
        }
      });
    },
    
    /**
     * Remove all links for multiple modules (bulk cleanup)
     */
    removeLinksForModules: (state, action: PayloadAction<string[]>) => {
      const moduleIds = new Set(action.payload);
      const linkIds = Object.keys(state.links);
      
      linkIds.forEach((linkId) => {
        const link = state.links[linkId];
        if (
          moduleIds.has(link.sourceModuleId) ||
          moduleIds.has(link.targetModuleId)
        ) {
          delete state.links[linkId];
        }
      });
    },
  },
});

export const {
  addLink,
  updateLink,
  removeLink,
  removeLinksForModule,
  removeLinksForModules,
} = moduleLinksSlice.actions;

export default moduleLinksSlice.reducer;