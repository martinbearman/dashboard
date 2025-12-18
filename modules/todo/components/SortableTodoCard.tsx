"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TodoCard from "./TodoCard";
import type { Todo, TodoLinkType } from "@/lib/store/slices/todoSlice";

export interface SortableTodoCardProps {
  todo: Todo;
  isEditing: boolean;
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

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    cursor: isDragging ? "grabbing" : "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TodoCard
        todo={todo}
        onCardClick={onCardClick}
        onDelete={onDelete}
        onEditStart={onEditStart}
        isEditing={isEditing}
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

