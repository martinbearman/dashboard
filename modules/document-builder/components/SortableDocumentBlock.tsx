"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRef, useEffect, useState } from "react";
import BlockContent from "./BlockContent";
import type { DocumentBlock } from "@/lib/types/document";

interface SortableDocumentBlockProps {
  block: DocumentBlock;
  onRemove: (blockId: string) => void;
}

export default function SortableDocumentBlock({
  block,
  onRemove,
}: SortableDocumentBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [fixedHeight, setFixedHeight] = useState<number | null>(null);

  useEffect(() => {
    if (isDragging && containerRef.current) {
      setFixedHeight(containerRef.current.offsetHeight);
    } else if (!isDragging) {
      const t = setTimeout(() => setFixedHeight(null), 300);
      return () => clearTimeout(t);
    }
  }, [isDragging]);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
    height: fixedHeight ? `${fixedHeight}px` : undefined,
    minHeight: fixedHeight ? `${fixedHeight}px` : undefined,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        containerRef.current = node;
      }}
      style={style}
      className="group rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:border-slate-300"
    >
      <div className="flex items-start gap-2">
        <div
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab touch-none rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8h16M4 16h16"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <BlockContent block={block} />
        </div>
        <button
          type="button"
          onClick={() => onRemove(block.id)}
          className="mt-0.5 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Remove block"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
