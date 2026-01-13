import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import type { ModuleLink, LinkPattern } from "@/lib/types/dashboard";

/**
 * Get all links
 */
export const selectAllLinks = createSelector(
  [(state: RootState) => state.moduleLinks.links],
  (links) => Object.values(links)
);

/**
 * Get all enabled links only
 */
export const selectEnabledLinks = createSelector(
  [selectAllLinks],
  (links) => links.filter((link) => link.metadata.enabled !== false)
);

/**
 * Get a specific link by ID
 */
export const selectLinkById = (state: RootState, linkId: string): ModuleLink | null => {
  return state.moduleLinks.links[linkId] ?? null;
};

/**
 * Get all links for a module (both as source and target)
 */
export const selectLinksForModule = createSelector(
  [(state: RootState) => state.moduleLinks.links, (_: RootState, moduleId: string) => moduleId],
  (links, moduleId) => {
    return Object.values(links).filter(
      (link) => link.sourceModuleId === moduleId || link.targetModuleId === moduleId
    );
  }
);

/**
 * Get links where the module is the source
 */
export const selectSourceLinks = createSelector(
  [(state: RootState) => state.moduleLinks.links, (_: RootState, moduleId: string) => moduleId],
  (links, moduleId) => {
    return Object.values(links).filter((link) => link.sourceModuleId === moduleId);
  }
);

/**
 * Get links where the module is the target
 */
export const selectTargetLinks = createSelector(
  [(state: RootState) => state.moduleLinks.links, (_: RootState, moduleId: string) => moduleId],
  (links, moduleId) => {
    return Object.values(links).filter((link) => link.targetModuleId === moduleId);
  }
);

/**
 * Get links between two specific modules
 */
export const selectLinksBetweenModules = createSelector(
  [
    (state: RootState) => state.moduleLinks.links,
    (_: RootState, sourceModuleId: string) => sourceModuleId,
    (_: RootState, _sourceModuleId: string, targetModuleId: string) => targetModuleId,
  ],
  (links, sourceModuleId, targetModuleId) => {
    return Object.values(links).filter(
      (link) =>
        (link.sourceModuleId === sourceModuleId && link.targetModuleId === targetModuleId) ||
        (link.sourceModuleId === targetModuleId && link.targetModuleId === sourceModuleId)
    );
  }
);

/**
 * Get links by pattern type
 */
export const selectLinksByPattern = createSelector(
  [(state: RootState) => state.moduleLinks.links, (_: RootState, pattern: LinkPattern) => pattern],
  (links, pattern) => {
    return Object.values(links).filter((link) => link.pattern === pattern);
  }
);