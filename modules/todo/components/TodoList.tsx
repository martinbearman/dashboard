"use client";

import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { 
  setActiveGoal, 
  deleteTodo, 
  clearActiveGoal, 
  createTodo,
  selectIncompleteTodosByListId,
  toggleTodo,
  updateTodo
} from "@/lib/store/slices/todoSlice";
import { setTimeRemaining } from "@/modules/timer/store/slices/timerSlice";
import { useState, useRef, useEffect } from "react";
import TodoCard from "./TodoCard";

const MAX_GOAL_DESCRIPTION_LENGTH = 120;

interface TodoListProps {
  moduleId: string;
  config?: Record<string, any>;
}

/**
 * TodoList Component
 * 
 * Displays and manages todos. Migrated from GoalHistory functionality.
 * Shows todos with timer-related information and allows switching active goals.
 */
export default function TodoList({ moduleId, config }: TodoListProps) {
  const listId = (config?.listId as string) ?? "default";

  const todos = useAppSelector((state) =>
    selectIncompleteTodosByListId(state, listId)
  );

  const isRunning = useAppSelector(state => state.timer.isRunning);
  const studyDuration = useAppSelector(state => state.timer.studyDuration);
  const dispatch = useAppDispatch();
  const [newTodoText, setNewTodoText] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Sort todos: active goal first (only one can be active), then by creation date (oldest first, so new todos appear at end)
  const sortedTodos = [...todos].sort((a, b) => {
    // Active goal always comes first
    if (a.isActiveGoal) return -1;
    if (b.isActiveGoal) return 1;
    // Otherwise sort by creation date (oldest first, so new todos appear at end)
    return a.createdAt - b.createdAt;
  });

  const handleTodoClick = (todoId: string) => {
    // Only allow switching if timer is NOT running
    if (!isRunning) {
      const todo = todos.find(t => t.id === todoId);
      if (!todo || todo.isActiveGoal) return;
      
      // Set this todo as the active goal
      dispatch(setActiveGoal(todoId));
      
      // Reset timer to full duration when switching goals
      dispatch(setTimeRemaining(studyDuration));
    }
  };

  const handleDeleteTodo = (todoId: string) => {
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;
    
    // If this is the active goal, clear it first
    if (todo.isActiveGoal) {
      dispatch(clearActiveGoal());
    }
    dispatch(deleteTodo(todoId));
  };

  const handleCompleteTodo = (todoId: string) => {
    const todo = todos.find(t => t.id === todoId);
    if (!todo || todo.completed) return;

    if (todo.isActiveGoal) {
      dispatch(clearActiveGoal());
    }

    dispatch(toggleTodo(todoId));
  };

  // Auto-focus input when it appears
  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showInput]);

  const handleCreateTodo = () => {
    if (newTodoText.trim() === "") return;
    
    dispatch(createTodo({
      description: newTodoText.trim().slice(0, MAX_GOAL_DESCRIPTION_LENGTH),
      listId,
    }));
    
    setNewTodoText("");
    setShowInput(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCreateTodo();
    } else if (e.key === "Escape") {
      setNewTodoText("");
      setShowInput(false);
    }
  };

  const handleToggleInput = () => {
    setShowInput(!showInput);
    if (!showInput) {
      // Clear text when opening
      setNewTodoText("");
    }
  };

  const handleStartEdit = (todoId: string, description: string) => {
    setEditingTodoId(todoId);
    setEditingText(description);
  };

  const handleCancelEdit = () => {
    setEditingTodoId(null);
    setEditingText("");
  };

  const handleSaveEdit = () => {
    if (!editingTodoId) return;
    const trimmed = editingText.trim();
    if (trimmed === "") {
      handleCancelEdit();
      return;
    }
    const bounded = trimmed.slice(0, MAX_GOAL_DESCRIPTION_LENGTH);
    const todo = todos.find(t => t.id === editingTodoId);
    if (todo && todo.description === bounded) {
      handleCancelEdit();
      return;
    }
    dispatch(updateTodo({ id: editingTodoId, description: bounded }));
    handleCancelEdit();
  };

  const isEditing = (todoId: string) => editingTodoId === todoId;

  return (
    <div className="relative h-full flex flex-col">
      {/* Details Toggle - Only shown when there are todos */}
      {sortedTodos.length > 0 && (
        <div className="flex justify-end px-4 pt-2 pb-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            aria-label={showDetails ? "Hide details" : "Show details"}
            title={showDetails ? "Hide details" : "Show details"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 transition-transform duration-200 ${showDetails ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
            <span>{showDetails ? "Hide Details" : "Show Details"}</span>
          </button>
        </div>
      )}
      
      {/* Todos List - Scrollable */}
      <div className="flex-1 overflow-auto pb-20 px-4 pt-4">
        {sortedTodos.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center text-gray-500">
            <p className="text-lg">No items yet. Click the + button to add one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTodos.map((todo) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                onCardClick={
                  isEditing(todo.id)
                    ? undefined
                    : () => handleTodoClick(todo.id)
                }
                onDelete={handleDeleteTodo}
                onEditStart={() => handleStartEdit(todo.id, todo.description)}
                isEditing={isEditing(todo.id)}
                editValue={isEditing(todo.id) ? editingText : undefined}
                onEditChange={(value) => {
                  if (value.length <= MAX_GOAL_DESCRIPTION_LENGTH) {
                    setEditingText(value);
                  }
                }}
                onEditSave={handleSaveEdit}
                onEditCancel={handleCancelEdit}
                showDetails={showDetails}
                actionSlot={
                  isEditing(todo.id)
                    ? null
                    : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteTodo(todo.id);
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-400 text-sm font-medium text-gray-600 hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-colors"
                        aria-label="Mark item done"
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
                    )
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Section - Button and Input */}
      {showInput && (
        <div className="absolute bottom-0 left-0 right-0 h-[80px] bg-gradient-to-b from-transparent to-white pointer-events-none z-10"></div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-end gap-2 z-20 max-w-full">
        {/* Item Creation Input - Shown when + button is clicked */}
        {showInput && (
          <div className="flex gap-2 transition-all duration-200 flex-1 max-w-[calc(100%-3rem)]">
            <div className="flex-1 min-w-0 relative">
              <input
                ref={inputRef}
                type="text"
                value={newTodoText}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_GOAL_DESCRIPTION_LENGTH) {
                    setNewTodoText(e.target.value);
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Add a new item..."
                maxLength={MAX_GOAL_DESCRIPTION_LENGTH}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                aria-label="Add a new item"
              />
              <div className="absolute bottom-0 right-0 text-xs text-gray-400 mb-1 mr-2">
                {MAX_GOAL_DESCRIPTION_LENGTH - newTodoText.length}
              </div>
            </div>
            <button
              onClick={handleCreateTodo}
              disabled={newTodoText.trim() === ""}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex-shrink-0 ${
                newTodoText.trim() === ""
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}
              aria-label="Add item"
            >
              Add
            </button>
          </div>
        )}
        
        {/* Circular Add Button - Bottom Right */}
        <button
          onClick={handleToggleInput}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg flex-shrink-0 ${
            showInput
              ? "bg-gray-400 hover:bg-gray-500 text-white rotate-45"
              : "bg-red-500 hover:bg-red-600 text-white"
          }`}
          aria-label={showInput ? "Cancel" : "Add new item"}
          title={showInput ? "Cancel" : "Add new item"}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M12 4v16m8-8H4" 
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

