"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRef, useEffect, useState } from "react";
import TodoCard from "./TodoCard";
import type { Todo, TodoLinkType } from "@/lib/store/slices/todoSlice";

export interface SortableTodoCardProps {
  todo: Todo;
  isEditing: boolean;
  editValue: string;
  showDetails: boolean;
  linkLabel: string;
  linkType: TodoLinkType | undefined;
  hasLink: boolean;
  onCardClick?: () => void;
  onDelete: (todoId: string) => void;
  onEditStart: () => void;
  onEditChange: (value: string) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onToggleDetails: () => void;
  onLinkClick: () => void;
  onLinkEdit: () => void;
  actionSlot: React.ReactNode;
}

export default function SortableTodoCard({
  todo,
  isEditing,
  editValue,
  showDetails,
  linkLabel,
  linkType,
  hasLink,
  onCardClick,
  onDelete,
  onEditStart,
  onEditChange,
  onEditSave,
  onEditCancel,
  onToggleDetails,
  onLinkClick,
  onLinkEdit,
  actionSlot,
}: SortableTodoCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [fixedHeight, setFixedHeight] = useState<number | null>(null);

  // Capture and lock height when dragging starts
  useEffect(() => {
    if (isDragging && containerRef.current) {
      // Capture the natural height before any transforms
      const height = containerRef.current.offsetHeight;
      setFixedHeight(height);
    } else if (!isDragging) {
      // Clear fixed height after drag ends (with delay to allow transition)
      const timer = setTimeout(() => setFixedHeight(null), 300);
      return () => clearTimeout(timer);
    }
  }, [isDragging]);

  // Parse transform to remove scale-y if present
  const transformString = CSS.Transform.toString(transform);
  const transformWithoutScaleY = transformString
    ? transformString.replace(/scaleY\([^)]+\)/g, '').trim().replace(/\s+/g, ' ')
    : '';

  const style: React.CSSProperties = {
    transform: transformWithoutScaleY || undefined,
    transition: isDragging ? undefined : transition,
    height: fixedHeight ? `${fixedHeight}px` : undefined,
    minHeight: fixedHeight ? `${fixedHeight}px` : undefined,
    maxHeight: fixedHeight ? `${fixedHeight}px` : undefined,
    zIndex: isDragging ? 50 : "auto",
    cursor: isDragging ? "grabbing" : "grab",
  };

  return (
    <div 
      ref={(node) => {
        setNodeRef(node);
        containerRef.current = node;
      }} 
      style={style} 
      {...attributes} 
      {...listeners}
    >
      <TodoCard
        todo={todo}
        onCardClick={onCardClick}
        onDelete={onDelete}
        onEditStart={onEditStart}
        isEditing={isEditing}
        editValue={editValue}
        onEditChange={onEditChange}
        onEditSave={onEditSave}
        onEditCancel={onEditCancel}
        onToggleDetails={onToggleDetails}
        onLinkClick={onLinkClick}
        onLinkEdit={onLinkEdit}
        linkLabel={linkLabel}
        linkType={linkType}
        hasLink={hasLink}
        actionSlot={actionSlot}
        showDetails={showDetails}
      />
    </div>
  );
}

