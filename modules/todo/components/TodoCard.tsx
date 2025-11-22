"use client";

import { ReactNode } from "react";
import { Todo } from "@/lib/store/slices/todoSlice";
import { formatTotalTime, formatTimeStamp, isToday } from "@/modules/timer/lib/utils";

interface TodoCardProps {
  todo: Todo;
  onCardClick?: () => void;
  onDelete?: (todoId: string) => void;
  actionSlot?: ReactNode;
  showDetails?: boolean; // Controls whether to show extra information (Created, Total Time, Sessions)
}

/**
 * TodoCard
 *
 * Shared visual component for displaying todo information (active or completed)
 * across different modules. Accepts optional click/delete handlers and an action
 * slot for context-specific controls (e.g., mark complete, restore).
 */
export default function TodoCard({
  todo,
  onCardClick,
  onDelete,
  actionSlot,
  showDetails = false, // Default to hiding details for cleaner UI
}: TodoCardProps) {

  const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onDelete?.(todo.id);
  };

  let stateClass = "bg-gray-50 border-gray-200 cursor-default";
  if (!todo.completed && onCardClick) {
    stateClass =
      "bg-white border-gray-200 hover:border-gray-400 hover:bg-gray-50 cursor-pointer";
  }
  if (todo.isActiveGoal && !todo.completed) {
    stateClass =
      "bg-red-100 border-red-300 shadow-md cursor-pointer hover:shadow-xl hover:scale-[1.02]";
  }
  const containerClasses = `relative p-4 rounded-lg border transition-all duration-200 ${stateClass}`;

  return (
    <div className={containerClasses} onClick={onCardClick}>
      <button
        onClick={handleDeleteClick}
        className="absolute -top-2 -right-2 w-6 h-6 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-500 transition-colors shadow-sm hover:shadow-md z-10"
        aria-label="Delete todo"
        title="Delete todo"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <div className="flex justify-between items-center gap-3 mb-0 flex-wrap">
        <h3
          className={`font-semibold text-lg flex-1 min-w-0 ${
            todo.completed
              ? "line-through text-gray-400"
              : todo.isActiveGoal
              ? "text-red-800"
              : "text-gray-800"
          }`}
        >
          {todo.description}
        </h3>
        <div className="flex items-center gap-2 flex-shrink-0">
          {todo.isActiveGoal && !todo.completed && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              Current
            </span>
          )}
          {actionSlot && (
            <div className="flex items-center gap-2">{actionSlot}</div>
          )}
        </div>
        {todo.completed && (
        <div className="flex items-center w-20 flex-shrink-0">
          <span className="absolute top-1/2 right-5 text-green-500 text-5xl font-bold pointer-events-none select-none transform -translate-y-1/2 rotate-[-15deg] opacity-70">
            ✓
          </span>
        </div>
        )}
      </div>

      {showDetails && (
        <div className="grid grid-cols-3 gap-4 text-sm mt-3">
          <div>
            <span className="text-gray-500 block">Created</span>
            <span className="text-gray-700" suppressHydrationWarning>
              {formatTimeStamp(todo.createdAt)}{" "}
              {isToday(todo.createdAt) ? "(today)" : ""}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block">Total Time</span>
            <span className="text-gray-700 font-medium">
              {formatTotalTime(todo.totalTimeStudied)}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block">Sessions</span>
            <span className="text-gray-700 font-medium">
              {todo.sessions.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

