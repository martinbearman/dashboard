"use client";

import { useMemo } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import {
  selectAllLinks,
  selectEnabledLinks,
  selectLinksForModule,
  selectSourceLinks,
  selectTargetLinks,
  selectLinksBetweenModules,
  selectLinkById,
} from "@/lib/store/selectors/moduleLinksSelectors";
import {
  addLink,
  updateLink,
  removeLink,
} from "@/lib/store/slices/moduleLinksSlice";
import type { LinkPattern, LinkMetadata, ModuleLink } from "@/lib/types/dashboard";

/**
 * Hook to get all links for a specific module (both as source and target)
 */
export function useModuleLinks(moduleId: string) {
  return useAppSelector((state) => selectLinksForModule(state, moduleId));
}

/**
 * Hook to get only enabled links for a module
 */
export function useEnabledModuleLinks(moduleId: string) {
  const allLinks = useModuleLinks(moduleId);
  return useMemo(
    () => allLinks.filter((link) => link.metadata.enabled !== false),
    [allLinks]
  );
}

/**
 * Hook to get links where the module is the source
 */
export function useSourceLinks(moduleId: string) {
  return useAppSelector((state) => selectSourceLinks(state, moduleId));
}

/**
 * Hook to get links where the module is the target
 */
export function useTargetLinks(moduleId: string) {
  return useAppSelector((state) => selectTargetLinks(state, moduleId));
}

/**
 * Hook to get links between two specific modules
 */
export function useLinksBetweenModules(
  sourceModuleId: string,
  targetModuleId: string
) {
  return useAppSelector((state) =>
    selectLinksBetweenModules(state, sourceModuleId, targetModuleId)
  );
}

/**
 * Hook to get a specific link by ID
 */
export function useLink(linkId: string | null) {
  return useAppSelector((state) =>
    linkId ? selectLinkById(state, linkId) : null
  );
}

/**
 * Hook to check if two modules are linked
 */
export function useAreModulesLinked(
  moduleId1: string,
  moduleId2: string
): boolean {
  const links = useLinksBetweenModules(moduleId1, moduleId2);
  return useMemo(() => links.length > 0, [links.length]);
}

/**
 * Hook to get all links (useful for admin/debugging views)
 */
export function useAllLinks() {
  return useAppSelector(selectAllLinks);
}

/**
 * Hook to get all enabled links
 */
export function useAllEnabledLinks() {
  return useAppSelector(selectEnabledLinks);
}

/**
 * Hook with actions to manage links for a module
 * Returns links and helper functions to add/update/remove links
 */
export function useModuleLinksWithActions(moduleId: string) {
  const dispatch = useAppDispatch();
  const links = useModuleLinks(moduleId);
  const sourceLinks = useSourceLinks(moduleId);
  const targetLinks = useTargetLinks(moduleId);

  const addLinkAction = (
    targetModuleId: string,
    pattern: LinkPattern,
    metadata?: LinkMetadata,
    linkId?: string
  ) => {
    dispatch(
      addLink({
        sourceModuleId: moduleId,
        targetModuleId,
        pattern,
        metadata,
        id: linkId,
      })
    );
  };

  const updateLinkAction = (
    linkId: string,
    updates: {
      pattern?: LinkPattern;
      metadata?: Partial<LinkMetadata>;
    }
  ) => {
    dispatch(updateLink({ linkId, updates }));
  };

  const removeLinkAction = (linkId: string) => {
    dispatch(removeLink(linkId));
  };

  return {
    links,
    sourceLinks,
    targetLinks,
    addLink: addLinkAction,
    updateLink: updateLinkAction,
    removeLink: removeLinkAction,
  };
}

/**
 * Hook to manage a specific link by ID
 */
export function useLinkWithActions(linkId: string | null) {
  const dispatch = useAppDispatch();
  const link = useLink(linkId);

  const updateLinkAction = (updates: {
    pattern?: LinkPattern;
    metadata?: Partial<LinkMetadata>;
  }) => {
    if (!linkId) return;
    dispatch(updateLink({ linkId, updates }));
  };

  const removeLinkAction = () => {
    if (!linkId) return;
    dispatch(removeLink(linkId));
  };

  const toggleEnabled = () => {
    if (!link) return;
    updateLinkAction({
      metadata: { enabled: !link.metadata.enabled },
    });
  };

  return {
    link,
    updateLink: updateLinkAction,
    removeLink: removeLinkAction,
    toggleEnabled,
  };
}

/**
 * Hook to get links filtered by pattern
 */
export function useLinksByPattern(pattern: LinkPattern) {
  return useAppSelector((state) => {
    const allLinks = selectAllLinks(state);
    return allLinks.filter((link) => link.pattern === pattern);
  });
}

/**
 * Hook to get enabled links filtered by pattern
 */
export function useEnabledLinksByPattern(pattern: LinkPattern) {
  const links = useLinksByPattern(pattern);
  return useMemo(
    () => links.filter((link) => link.metadata.enabled !== false),
    [links]
  );
}