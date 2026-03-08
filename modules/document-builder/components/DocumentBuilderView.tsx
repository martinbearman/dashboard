"use client";

import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import {
  addBlock,
  removeBlock,
  reorderBlocks,
  setBlocks,
  updateBlock,
} from "@/lib/store/slices/documentBuilderSlice";
import type {
  DocumentBlock,
  HeadingBlock,
  ParagraphBlock,
  BulletsBlock,
  TableBlock,
  ImageBlock,
} from "@/lib/types/document";
import { useCallback, useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableDocumentBlock from "./SortableDocumentBlock";

function createDemoBlocks(): DocumentBlock[] {
  return [
    {
      id: crypto.randomUUID(),
      type: "heading",
      level: 1,
      text: "Document builder prototype",
    } as HeadingBlock,
    {
      id: crypto.randomUUID(),
      type: "paragraph",
      text: "This is a paragraph. You can add headings, paragraphs, bullet lists, tables, and images. Drag the handle on the left to reorder blocks.",
    } as ParagraphBlock,
    {
      id: crypto.randomUUID(),
      type: "bullets",
      items: ["First point", "Second point", "Third point"],
    } as BulletsBlock,
    {
      id: crypto.randomUUID(),
      type: "table",
      headers: ["Name", "Role", "Status"],
      rows: [
        ["Alice", "Editor", "Active"],
        ["Bob", "Reviewer", "Pending"],
      ],
    } as TableBlock,
    {
      id: crypto.randomUUID(),
      type: "image",
      url: "https://picsum.photos/400/200",
      alt: "Sample",
      caption: "Optional caption",
    } as ImageBlock,
  ];
}

function createBlock(
  type: DocumentBlock["type"],
  overrides?: Partial<DocumentBlock>
): DocumentBlock {
  const id = crypto.randomUUID();
  const base = { id, type };
  switch (type) {
    case "heading":
      return { ...base, level: 1, text: "New heading" } as HeadingBlock;
    case "paragraph":
      return { ...base, text: "New paragraph." } as ParagraphBlock;
    case "bullets":
      return { ...base, items: ["Item 1", "Item 2"] } as BulletsBlock;
    case "table":
      return {
        ...base,
        headers: ["A", "B"],
        rows: [["1", "2"]],
      } as TableBlock;
    case "image":
      return {
        ...base,
        url: "https://picsum.photos/400/200",
        alt: "Image",
      } as ImageBlock;
    default:
      return { ...base, text: "" } as ParagraphBlock;
  }
}

interface DocumentBuilderViewProps {
  moduleId: string;
}

export default function DocumentBuilderView({ moduleId }: DocumentBuilderViewProps) {
  const dispatch = useAppDispatch();
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const blocks = useAppSelector(
    (state) => state.documentBuilder?.byModuleId?.[moduleId] ?? []
  );

  const handleUpdate = useCallback(
    (blockId: string, updates: Record<string, unknown>) => {
      dispatch(updateBlock({ moduleId, blockId, updates }));
    },
    [dispatch, moduleId]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      dispatch(
        reorderBlocks({
          moduleId,
          activeId: String(active.id),
          overId: String(over.id),
        })
      );
    },
    [dispatch, moduleId]
  );

  const handleRemove = useCallback(
    (blockId: string) => {
      dispatch(removeBlock({ moduleId, blockId }));
    },
    [dispatch, moduleId]
  );

  const handleAddBlock = useCallback(
    (type: DocumentBlock["type"]) => {
      dispatch(addBlock({ moduleId, block: createBlock(type) }));
    },
    [dispatch, moduleId]
  );

  useEffect(() => {
    if (blocks.length === 0) {
      dispatch(setBlocks({ moduleId, blocks: createDemoBlocks() }));
    }
  }, [moduleId, blocks.length, dispatch]);

  const blockIds = blocks.map((b) => b.id);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
        <span className="text-xs font-medium text-slate-500 self-center mr-1">
          Add:
        </span>
        {(
          [
            ["heading", "Heading"],
            ["paragraph", "Paragraph"],
            ["bullets", "Bullets"],
            ["table", "Table"],
            ["image", "Image"],
          ] as const
        ).map(([type, label]) => (
          <button
            key={type}
            type="button"
            onClick={() => handleAddBlock(type)}
            className="rounded bg-white border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto p-4">
        {blocks.length === 0 ? (
          <p className="text-slate-500 text-sm">Loading demo blocks…</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={blockIds}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {blocks.map((block) => (
                  <SortableDocumentBlock
                    key={block.id}
                    block={block}
                    onRemove={handleRemove}
                    isEditing={editingBlockId === block.id}
                    onStartEdit={() => setEditingBlockId(block.id)}
                    onEndEdit={() => setEditingBlockId(null)}
                    onUpdate={handleUpdate}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
