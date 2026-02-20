"use client";

import { useState, useCallback, useEffect } from "react";
import { Responsive, WidthProvider, type Layout } from "react-grid-layout";
import type { ModuleProps } from "@/lib/types/dashboard";
import { useAppDispatch } from "@/lib/store/hooks";
import { updateModuleConfig } from "@/lib/store/slices/moduleConfigsSlice";

const ResponsiveGridLayout = WidthProvider(Responsive);

type DocumentElementType = "title" | "list" | "summary" | "paragraph";

interface DocumentElement {
  id: string;
  type: DocumentElementType;
  content: string;
}

/**
 * Document Builder Module
 * 
 * A fine-grained grid-based document builder where users can:
 * - Drag and resize document elements (titles, lists, summaries)
 * - Use a 48-column grid for maximum layout control
 * - Create structured documents with precise positioning
 */
export default function DocumentBuilderModule({ moduleId, config }: ModuleProps) {
  const dispatch = useAppDispatch();
  
  // Load saved layout and elements from config, or use defaults
  const savedLayout = config?.layout as Layout[] | undefined;
  const savedElements = config?.elements as DocumentElement[] | undefined;
  
  const [layout, setLayout] = useState<Layout[]>(
    savedLayout || [
      { i: "title-1", x: 0, y: 0, w: 12, h: 2, minW: 3, minH: 1 },
      { i: "paragraph-1", x: 0, y: 2, w: 12, h: 3, minW: 3, minH: 2 },
      { i: "list-1", x: 0, y: 5, w: 6, h: 4, minW: 3, minH: 2 },
      { i: "summary-1", x: 6, y: 5, w: 6, h: 4, minW: 3, minH: 2 },
    ]
  );

  const [elements, setElements] = useState<DocumentElement[]>(
    savedElements || [
      { id: "title-1", type: "title", content: "Document Title" },
      { id: "paragraph-1", type: "paragraph", content: "Start writing your document here..." },
      { id: "list-1", type: "list", content: "• Item 1\n• Item 2\n• Item 3" },
      { id: "summary-1", type: "summary", content: "Summary: Key points go here..." },
    ]
  );

  // Persist layout and elements to module config
  const persistState = useCallback((newLayout: Layout[], newElements: DocumentElement[]) => {
    dispatch(updateModuleConfig({
      moduleId,
      config: {
        layout: newLayout,
        elements: newElements,
      },
    }));
  }, [dispatch, moduleId]);

  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    setLayout(newLayout);
    persistState(newLayout, elements);
  }, [elements, persistState]);

  const handleElementChange = useCallback((id: string, content: string) => {
    const newElements = elements.map(el => 
      el.id === id ? { ...el, content } : el
    );
    setElements(newElements);
    persistState(layout, newElements);
  }, [layout, elements, persistState]);

  const addElement = useCallback((type: DocumentElementType) => {
    const newId = `${type}-${Date.now()}`;
    const defaultContent: Record<DocumentElementType, string> = {
      title: "New Title",
      paragraph: "New paragraph...",
      list: "• Item 1\n• Item 2",
      summary: "Summary...",
    };

    const newElement: DocumentElement = {
      id: newId,
      type,
      content: defaultContent[type],
    };

    // Find the bottom-most item to place new element below
    const maxY = layout.reduce((max, item) => Math.max(max, item.y + item.h), 0);
    const defaultWidth = type === "title" ? 12 : 6;
    const defaultHeight = type === "title" ? 2 : type === "summary" ? 3 : 2;

    const newLayoutItem: Layout = {
      i: newId,
      x: 0,
      y: maxY,
      w: defaultWidth,
      h: defaultHeight,
      minW: 3,
      minH: 1,
    };

    setLayout([...layout, newLayoutItem]);
    setElements([...elements, newElement]);
    persistState([...layout, newLayoutItem], [...elements, newElement]);
  }, [layout, elements, persistState]);

  const deleteElement = useCallback((id: string) => {
    setLayout(layout.filter(item => item.i !== id));
    setElements(elements.filter(el => el.id !== id));
    persistState(
      layout.filter(item => item.i !== id),
      elements.filter(el => el.id !== id)
    );
  }, [layout, elements, persistState]);

  const getElementTypeStyles = (type: DocumentElementType) => {
    switch (type) {
      case "title":
        return "text-2xl font-bold";
      case "summary":
        return "text-sm italic bg-yellow-50 border-l-4 border-yellow-400 pl-3";
      case "list":
        return "text-sm space-y-1";
      default:
        return "text-base";
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b bg-gray-50">
        <span className="text-xs font-medium text-gray-600">Add:</span>
        <button
          onClick={() => addElement("title")}
          className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded"
        >
          Title
        </button>
        <button
          onClick={() => addElement("paragraph")}
          className="px-2 py-1 text-xs bg-green-100 hover:bg-green-200 rounded"
        >
          Paragraph
        </button>
        <button
          onClick={() => addElement("list")}
          className="px-2 py-1 text-xs bg-purple-100 hover:bg-purple-200 rounded"
        >
          List
        </button>
        <button
          onClick={() => addElement("summary")}
          className="px-2 py-1 text-xs bg-yellow-100 hover:bg-yellow-200 rounded"
        >
          Summary
        </button>
      </div>

      {/* Document Grid */}
      <div className="flex-1 overflow-auto p-2">
        <ResponsiveGridLayout
          className="document-grid-layout"
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1024 }}
          cols={{ lg: 12 }} // 12 columns for standard grid
          rowHeight={20} // 20px rows for fine control
          margin={[4, 4]} // 4px margins
          isDraggable={true}
          isResizable={true}
          preventCollision={false}
          compactType={null}
          // CRITICAL: Prevent drag events from bubbling to parent grid
          onDragStart={(layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => {
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
            const lgLayout = layouts?.lg || layout;
            handleLayoutChange(lgLayout);
          }}
          draggableHandle=".document-drag-handle"
        >
          {layout.map((item) => {
            const element = elements.find(el => el.id === item.i);
            if (!element) return null;

            return (
              <div
                key={item.i}
                className="bg-white border border-gray-200 rounded shadow-sm hover:shadow-md transition-shadow group relative"
              >
                {/* Drag Handle */}
                <div className="document-drag-handle absolute top-1 left-1 opacity-0 group-hover:opacity-100 cursor-move text-gray-400 hover:text-gray-600 text-xs">
                  ⋮⋮
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => deleteElement(item.i)}
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-xs font-bold"
                  title="Delete element"
                >
                  ×
                </button>

                {/* Content */}
                <div className="p-3 pt-6">
                  {element.type === "list" ? (
                    <textarea
                      value={element.content}
                      onChange={(e) => handleElementChange(element.id, e.target.value)}
                      className={`w-full h-full resize-none border-none outline-none bg-transparent ${getElementTypeStyles(element.type)}`}
                      placeholder="List items (one per line)"
                      style={{ minHeight: `${item.h * 20 - 24}px` }}
                    />
                  ) : (
                    <textarea
                      value={element.content}
                      onChange={(e) => handleElementChange(element.id, e.target.value)}
                      className={`w-full h-full resize-none border-none outline-none bg-transparent ${getElementTypeStyles(element.type)}`}
                      placeholder={`Enter ${element.type}...`}
                      style={{ minHeight: `${item.h * 20 - 24}px` }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </ResponsiveGridLayout>
      </div>
    </div>
  );
}
