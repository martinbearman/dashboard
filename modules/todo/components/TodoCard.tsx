"use client";

import { ReactNode } from "react";
import { Todo, TodoLinkType } from "@/lib/store/slices/todoSlice";
import { formatTotalTime, formatTimeStamp, isToday } from "@/modules/timer/lib/utils";

interface TodoCardProps {
  todo: Todo;
  onCardClick?: () => void;
  onDelete?: (todoId: string) => void;
  onEditStart?: (todoId: string) => void;
  isEditing?: boolean;
  editValue?: string;
  onEditChange?: (value: string) => void;
  onEditSave?: () => void;
  onEditCancel?: () => void;
  onToggleDetails?: () => void;
  onLinkClick?: () => void;
  onLinkEdit?: () => void;
  linkLabel?: string;
  linkType?: TodoLinkType;
  hasLink?: boolean;
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
  onEditStart,
  isEditing = false,
  editValue = "",
  onEditChange,
  onEditSave,
  onEditCancel,
  onToggleDetails,
  onLinkClick,
  onLinkEdit,
  linkLabel,
  linkType,
  hasLink = false,
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
      {onEditStart && !isEditing && (
        <button
          onClick={(event) => {
            event.stopPropagation();
            onEditStart(todo.id);
          }}
          className="absolute -top-2 -left-2 w-6 h-6 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-500 transition-colors shadow-sm hover:shadow-md z-10"
          aria-label="Edit todo"
          title="Edit todo"
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
              d="M15.232 5.232l3.536 3.536M4 20h4.586a1 1 0 00.707-.293l9.414-9.414a1 1 0 000-1.414l-3.586-3.586a1 1 0 00-1.414 0L4 14.586A1 1 0 003.707 15.293L4 16v4z"
            />
          </svg>
        </button>
      )}
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
      {onToggleDetails && !isEditing && (
        <button
          onClick={(event) => {
            event.stopPropagation();
            onToggleDetails();
          }}
          className="absolute -bottom-2 -left-2 w-6 h-6 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-500 transition-colors shadow-sm hover:shadow-md z-10"
          aria-label={showDetails ? "Hide details" : "Show details"}
          title={showDetails ? "Hide details" : "Show details"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 transition-transform duration-200 ${showDetails ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      )}
      {onLinkEdit && !isEditing && (
        <button
          onClick={(event) => {
            event.stopPropagation();
            onLinkEdit();
          }}
          className={`absolute -bottom-2 -right-2 w-7 h-7 bg-white border-2 rounded-full flex items-center justify-center transition-colors shadow-sm hover:shadow-md z-10 ${
            hasLink
              ? "border-blue-400 text-blue-500 hover:border-blue-500 hover:text-blue-600"
              : "border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500"
          }`}
          aria-label={hasLink ? "Edit link" : "Add link"}
          title={hasLink ? "Edit link" : "Add link"}
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
              d="M13.828 10.172a4 4 0 010 5.656l-1.414 1.414a4 4 0 01-5.656-5.656l1.414-1.414M10.172 13.828a4 4 0 010-5.656l1.414-1.414a4 4 0 015.656 5.656l-1.414 1.414"
            />
          </svg>
        </button>
      )}

      <div className="flex justify-between items-center gap-3 mb-0 flex-wrap">
        {isEditing ? (
          <div className="flex-1 min-w-0 flex items-center gap-3">
            <input
              value={editValue}
              onChange={(e) => onEditChange?.(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onEditSave?.();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  onEditCancel?.();
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
              aria-label="Edit todo text"
              maxLength={120}
              autoFocus
            />
            <div className="flex items-center gap-3 justify-center ml-3 pr-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditSave?.();
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-green-500 text-green-600 bg-green-50 transition-colors"
                aria-label="Save todo"
                title="Save"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditCancel?.();
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-500 text-red-600 bg-red-50 transition-colors"
                aria-label="Cancel edit"
                title="Cancel"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        ) : (
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
        )}
        {!isEditing && linkLabel && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLinkClick?.();
            }}
            className={`inline-flex items-center gap-1 rounded-full text-xs font-medium m-0 px-3 py-1 border ${
              linkType === "url"
                ? "bg-orange-50 text-orange-700 border-orange-100 hover:border-orange-200"
                : linkType === "dashboard"
                ? "bg-blue-50 text-blue-700 border-blue-100 hover:border-blue-200"
                : linkType === "module"
                ? "bg-green-50 text-green-700 border-green-100 hover:border-green-200"
                : "bg-orange-50 text-orange-700 border-orange-100 hover:border-orange-200"
            }`}
            aria-label="Open link"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m-6 1h6a2 2 0 002-2V7"
              />
            </svg>
            <span className="truncate max-w-[180px]">{linkLabel}</span>
          </button>
        )}
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

