"use client";

import { useState, type MouseEvent } from "react";
import { useClickOutside } from "@/lib/hooks/useClickOutside";

type ModuleActionsMenuProps = {
  moduleId: string;
  locked: boolean;
};

export function ModuleActionsMenu({ moduleId, locked }: ModuleActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Close the menu when the user clicks/taps outside of the trigger + menu region.
  const containerRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false), isOpen);

  // Toggle the popover visibility when the trigger button is pressed.
  const handleToggle = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  // Produce click handlers for each menu item that close the menu after firing.
  const handleAction =
    (action: string) => (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      console.log(`${action} module ${moduleId}`);
      setIsOpen(false);
    };

  return (
    <div
      ref={containerRef}
      className="absolute top-2 right-2 z-20 module-actions-interactive"
    >
      <button
        type="button"
        className="module-actions-interactive relative z-20 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:bg-gray-100"
        aria-label="Open module menu"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={handleToggle}
      >
        ⋮
      </button>
      {isOpen ? (
        <div
          role="menu"
          className="module-actions-interactive absolute right-0 mt-2 w-36 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg z-10"
        >
          <button
            type="button"
            role="menuitem"
            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            onClick={handleAction("Configure")}
          >
            Configure
          </button>
          <button
            type="button"
            role="menuitem"
            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            onClick={handleAction(locked ? "Unlock" : "Lock")}
          >
            {locked ? "Unlock" : "Lock"}
          </button>
          <button
            type="button"
            role="menuitem"
            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            onClick={handleAction("Remove")}
          >
            Remove
          </button>
        </div>
      ) : null}
    </div>
  );
}

