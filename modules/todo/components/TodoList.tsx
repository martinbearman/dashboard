"use client";

import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { setActiveGoal, deleteTodo, clearActiveGoal, createTodo } from "@/lib/store/slices/todoSlice";
import { setTimeRemaining } from "@/modules/timer/store/slices/timerSlice";
import { formatTime, formatTimeStamp, isToday } from "@/modules/timer/lib/utils";
import { useState, useRef, useEffect } from "react";

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
  const todos = useAppSelector(state => state.todo.todos);
  const isRunning = useAppSelector(state => state.timer.isRunning);
  const studyDuration = useAppSelector(state => state.timer.studyDuration);
  const dispatch = useAppDispatch();
  const [newTodoText, setNewTodoText] = useState("");
  const [showInput, setShowInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sort todos: active goal first (only one can be active), then by creation date (newest first)
  const sortedTodos = [...todos].sort((a, b) => {
    // Active goal always comes first
    if (a.isActiveGoal) return -1;
    if (b.isActiveGoal) return 1;
    // Otherwise sort by creation date (newest first)
    return b.createdAt - a.createdAt;
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

  const handleDeleteTodo = (e: React.MouseEvent, todoId: string) => {
    e.stopPropagation(); // Prevent triggering the todo click handler
    
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;
    
    // If this is the active goal, clear it first
    if (todo.isActiveGoal) {
      dispatch(clearActiveGoal());
    }
    
    // Delete the todo
    dispatch(deleteTodo(todoId));
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
      description: newTodoText.trim()
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

  return (
    <div className="relative h-full flex flex-col">
      {/* Todos List - Scrollable */}
      <div className="flex-1 overflow-auto pb-20 px-4 pt-4">
        {sortedTodos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">No todos yet. Click the + button to create one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTodos.map((todo) => (
            <div
              key={todo.id}
              onClick={() => handleTodoClick(todo.id)}
              className={`
                relative p-4 rounded-lg border transition-all duration-200 hover:shadow-md
                ${todo.isActiveGoal
                  ? 'bg-red-100 border-red-300 shadow-md cursor-pointer'  // Highlight active goal
                  : todo.completed
                  ? 'bg-gray-50 border-gray-200 cursor-default'
                  : 'bg-white border-gray-200 hover:border-gray-300 cursor-pointer'
                }
              `}
            >
              {/* Circular delete button positioned on the edge */}
              <button
                onClick={(e) => handleDeleteTodo(e, todo.id)}
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
              
              <div className="flex justify-between items-start mb-2">
                <h3 className={`font-semibold text-lg flex-1 ${
                  todo.completed 
                    ? 'line-through text-gray-400' 
                    : todo.isActiveGoal 
                    ? 'text-red-800' 
                    : 'text-gray-800'
                }`}>
                  {todo.description}
                </h3>
                <div className="flex items-center gap-2">
                  {todo.isActiveGoal && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      Current
                    </span>
                  )}
                  {todo.completed && (
                    <span className="text-green-500 text-xl">✓</span>
                  )}
                </div>
              </div>
              
              {/* Timer-related information */}
              <div className="grid grid-cols-3 gap-4 text-sm mt-3">
                <div>
                  <span className="text-gray-500 block">Created</span>
                  <span className="text-gray-700" suppressHydrationWarning>
                    {formatTimeStamp(todo.createdAt)} {isToday(todo.createdAt) ? '(today)' : ''}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Total Time</span>
                  <span className="text-gray-700 font-medium">{formatTime(todo.totalTimeStudied)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Sessions</span>
                  <span className="text-gray-700 font-medium">{todo.sessions.length}</span>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>

      {/* Bottom Section - Button and Input */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-end gap-2 z-20 max-w-full">
        {/* Todo Creation Input - Shown when + button is clicked */}
        {showInput && (
          <div className="flex gap-2 transition-all duration-200 flex-1 max-w-[calc(100%-3rem)]">
            <input
              ref={inputRef}
              type="text"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a new todo..."
              className="flex-1 min-w-0 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              aria-label="Add a new todo"
            />
            <button
              onClick={handleCreateTodo}
              disabled={newTodoText.trim() === ""}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex-shrink-0 ${
                newTodoText.trim() === ""
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}
              aria-label="Create todo"
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
          aria-label={showInput ? "Cancel" : "Add new todo"}
          title={showInput ? "Cancel" : "Add new todo"}
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

