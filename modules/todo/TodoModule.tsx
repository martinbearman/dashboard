"use client";

import { ModuleProps } from "@/lib/types/dashboard";
import TodoList from "./components/TodoList";

/**
 * Todo Module Component Wrapper
 * 
 * This component wraps the todo module's main display to integrate
 * with the dashboard module system. It receives moduleId and config
 * props from the dashboard.
 */
export default function TodoModule({ moduleId, config }: ModuleProps) {
  return (
    <div className="h-full w-full overflow-auto p-4">
      <TodoList moduleId={moduleId} config={config} />
    </div>
  );
}

