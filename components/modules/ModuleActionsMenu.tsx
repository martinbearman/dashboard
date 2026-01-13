"use client";

import { useState, type MouseEvent } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { useClickOutside } from "@/lib/hooks/useClickOutside";
import { getModuleByType } from "@/modules/registry";
import ModuleService from "@/lib/services/moduleService";
import { openModuleConfigPanel } from "@/lib/store/slices/uiSlice";
import { updateModuleConfig } from "@/lib/store/slices/moduleConfigsSlice";

type ModuleActionsMenuProps = {
  moduleId: string;
  locked: boolean;
  moduleName: string;
};

export function ModuleActionsMenu({ moduleId, locked, moduleName }: ModuleActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();
  // Track the dashboard so removal can target the proper slice entry.
  const { activeDashboardId, dashboards } = useAppSelector((state) => state.dashboards);
  
  // Get module type and config panel
  const active = activeDashboardId ? dashboards[activeDashboardId] : null;
  const moduleInstance = active?.modules.find((m) => m.id === moduleId);
  const moduleMeta = moduleInstance ? getModuleByType(moduleInstance.type) : null;
  const ConfigPanel = moduleMeta?.configPanel;
  const moduleConfig = useAppSelector((state) => state.moduleConfigs.configs[moduleId]);
  // Use custom list name for todo modules, otherwise use the generic module name
  const displayName = 
    moduleInstance?.type === "todo" && moduleConfig?.listName
      ? (moduleConfig.listName as string)
      : moduleName;

  // Close the menu when the user clicks/taps outside of the trigger + menu region.
  const containerRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false), isOpen);

  // Shared helper so every handler collapses the dropdown after running.
  const closeMenu = () => setIsOpen(false);

  // Compose a handler that runs `handler` then immediately closes the menu.
  const withMenuClose =
    (handler: (event: MouseEvent<HTMLButtonElement>) => void) =>
    (event: MouseEvent<HTMLButtonElement>) => {
      handler(event);
      closeMenu();
    };

  // Toggle the popover visibility when the trigger button is pressed.
  const handleToggle = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setIsOpen((prev) => !prev);
  };

  // Prevent drag initiation when interacting with menu elements
  const handleMenuInteraction = (event: React.MouseEvent | React.PointerEvent) => {
    event.stopPropagation();
    event.preventDefault();
  };

  const handleConfigure = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (ConfigPanel) {
      dispatch(openModuleConfigPanel({ moduleId }));
    }
  };

  const handleToggleLock = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    // Flip the persisted lock bit for the module config.
    dispatch(
      updateModuleConfig({
        moduleId,
        config: { locked: !locked },
      }),
    );
  };

  const handleRemove = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    // Locked modules cannot be removed through the menu.
    if (locked) {
      return;
    }
    if (!activeDashboardId) {
      console.warn("Attempted to remove a module, but no dashboard is active.");
      return;
    }

    // Use ModuleService to coordinate removal of both module instance and config
    ModuleService.removeModule(dispatch, activeDashboardId, moduleId);
  };

  return (
    <>
      <div
        ref={containerRef}
        className="flex items-center justify-between px-3 py-2 bg-gray-100 border-b border-gray-300 rounded-t-lg"
      >
      {/* Module name with drag indicator - only this part is draggable */}
      <div 
        className={`module-drag-handle flex items-center gap-2 text-sm flex-1 ${
          locked ? "cursor-default text-gray-500" : "cursor-move text-gray-700"
        }`}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={locked ? "text-gray-400" : "text-gray-500"}
        >
          <circle cx="2" cy="2" r="1" fill="currentColor" />
          <circle cx="6" cy="2" r="1" fill="currentColor" />
          <circle cx="10" cy="2" r="1" fill="currentColor" />
          <circle cx="2" cy="6" r="1" fill="currentColor" />
          <circle cx="6" cy="6" r="1" fill="currentColor" />
          <circle cx="10" cy="6" r="1" fill="currentColor" />
          <circle cx="2" cy="10" r="1" fill="currentColor" />
          <circle cx="6" cy="10" r="1" fill="currentColor" />
          <circle cx="10" cy="10" r="1" fill="currentColor" />
        </svg>
        <span className="text-sm font-medium">
          {displayName}
          {locked && <span className="text-gray-400 font-normal"> (locked)</span>}
        </span>
      </div>

      {/* Menu button - separate from drag handle */}
      <div 
        className="relative z-30 module-actions-interactive"
        onMouseDown={handleMenuInteraction}
        onPointerDown={handleMenuInteraction}
      >
        <button
          type="button"
          className="relative z-30 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white text-gray-700 transition hover:bg-gray-50 hover:border-gray-400 hover:scale-110"
          aria-label="Open module menu"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          onMouseDown={handleMenuInteraction}
          onPointerDown={handleMenuInteraction}
          onClick={handleToggle}
        >
          ⋮
        </button>
        {isOpen ? (
          <div
            role="menu"
            className="module-actions-interactive absolute right-0 mt-2 w-40 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg z-30"
            onMouseDown={handleMenuInteraction}
            onPointerDown={handleMenuInteraction}
          >
            <button
              type="button"
              role="menuitem"
              className="w-full px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              onMouseDown={handleMenuInteraction}
              onPointerDown={handleMenuInteraction}
              onClick={withMenuClose(handleConfigure)}
              disabled={!ConfigPanel}
            >
              Configure
            </button>
            <button
              type="button"
              role="menuitem"
              className="w-full px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100"
              onMouseDown={handleMenuInteraction}
              onPointerDown={handleMenuInteraction}
              onClick={withMenuClose(handleToggleLock)}
            >
              {locked ? "Unlock" : "Lock"}
            </button>
            <button
              type="button"
              role="menuitem"
              className="w-full px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              onMouseDown={handleMenuInteraction}
              onPointerDown={handleMenuInteraction}
              onClick={withMenuClose(handleRemove)}
              disabled={locked}
              aria-disabled={locked}
            >
              Close
            </button>
          </div>
        ) : null}
      </div>
    </div>
    </>
  );
}

