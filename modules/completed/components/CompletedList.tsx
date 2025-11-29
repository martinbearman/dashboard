"use client";

import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";

import {
  deleteTodo,
  toggleTodo,
  selectCompletedTodosByListId,
  selectAllCompletedTodos,
} from "@/lib/store/slices/todoSlice";
import TodoCard from "@/modules/todo/components/TodoCard";

interface CompletedListProps {
  moduleId: string;
  config?: Record<string, any>;
}

/**
 * CompletedList Component
 *
 * Displays todos that have been marked as completed and lets the user restore
 * them to the active todo list or delete them permanently.
 */
export default function CompletedList({ moduleId, config }: CompletedListProps) {
  const mode = (config?.mode as "linked" | "master") ?? "master";
  const linkedListId = config?.linkedListId as string | undefined;

  const completedTodos = useAppSelector((state) => {
    if (mode === "linked" && linkedListId) {
      return selectCompletedTodosByListId(state, linkedListId);
    }
    return selectAllCompletedTodos(state);
  });

  const dispatch = useAppDispatch();

  const sortedTodos = [...completedTodos].sort((a, b) => b.createdAt - a.createdAt);

  const handleDelete = (todoId: string) => {
    dispatch(deleteTodo(todoId));
  };

  const handleRestore = (todoId: string) => {
    dispatch(toggleTodo(todoId));
  };

  if (sortedTodos.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-center text-gray-500">
        <p className="text-lg">No completed tasks yet.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-4 space-y-3">
      {sortedTodos.map((todo) => (
        <TodoCard
          key={todo.id}
          todo={todo}
          onDelete={handleDelete}
          showDetails={false}
          actionSlot={
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRestore(todo.id);
              }}
              className="inline-flex items-center gap-1 rounded-md border border-red-400 px-3 py-1 text-sm font-medium text-red-500 hover:bg-red-50"
              aria-label="Move todo back to active list"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Restore
            </button>
          }
        />
      ))}
    </div>
  );
}

