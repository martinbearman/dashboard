"use client";

import { useState, useCallback } from "react";
import { Responsive, WidthProvider, type Layout } from "react-grid-layout";
import type { ModuleProps } from "@/lib/types/dashboard";

const ResponsiveGridLayout = WidthProvider(Responsive);

/**
 * Example module demonstrating nested grids with draggable elements
 * 
 * Key techniques:
 * 1. Separate GridLayout instance for nested content
 * 2. Event isolation to prevent parent grid interference
 * 3. CSS scoping to avoid style conflicts
 * 4. Independent layout state management
 */
export default function NestedGridModule({ moduleId, config }: ModuleProps) {
  // Manage nested grid layout state independently
  const [nestedLayout, setNestedLayout] = useState<Layout[]>([
    { i: "item-1", x: 0, y: 0, w: 2, h: 1 },
    { i: "item-2", x: 2, y: 0, w: 2, h: 1 },
    { i: "item-3", x: 0, y: 1, w: 4, h: 1 },
  ]);

  const handleLayoutChange = useCallback((layout: Layout[]) => {
    setNestedLayout(layout);
    // Optionally persist to module config:
    // dispatch(updateModuleConfig({ moduleId, config: { nestedLayout: layout } }));
  }, []);

  return (
    <div className="h-full w-full p-2 flex flex-col">
      <h3 className="text-sm font-semibold mb-2">Nested Grid Module</h3>
      
      {/* Nested Grid Container */}
      <div className="flex-1 overflow-hidden">
        <ResponsiveGridLayout
          className="nested-grid-layout"
          layouts={{ lg: nestedLayout }}
          breakpoints={{ lg: 1024 }}
          cols={{ lg: 4 }}
          rowHeight={60} // Smaller row height for nested items
          margin={[8, 8]} // Smaller margins
          isDraggable={true}
          isResizable={true}
          preventCollision={false}
          // CRITICAL: Prevent drag events from bubbling to parent grid
          onDragStart={(layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => {
            // Stop event propagation to prevent parent grid from handling the drag
            e.stopPropagation();
          }}
          onDragStop={(layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => {
            e.stopPropagation();
          }}
          onResizeStart={(layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => {
            e.stopPropagation();
          }}
          onResizeStop={(layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => {
            e.stopPropagation();
          }}
          onLayoutChange={(layout: Layout[], layouts) => {
            // Extract layout for lg breakpoint (or first available)
            const lgLayout = layouts?.lg || layout;
            handleLayoutChange(lgLayout);
          }}
          // Use a different drag handle class to avoid conflicts
          draggableHandle=".nested-drag-handle"
        >
          {nestedLayout.map((item) => (
            <div
              key={item.i}
              className="bg-blue-100 border border-blue-300 rounded p-2 flex items-center justify-between"
            >
              <span className="text-xs">{item.i}</span>
              {/* Custom drag handle for nested grid */}
              <div className="nested-drag-handle cursor-move text-blue-600 hover:text-blue-800">
                ⋮⋮
              </div>
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>
    </div>
  );
}
