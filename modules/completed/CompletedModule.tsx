"use client";

import { ModuleProps } from "@/lib/types/dashboard";
import CompletedList from "./components/CompletedList";

/**
 * Completed Module Component Wrapper
 *
 * Provides the dashboard integration layer for displaying completed todos.
 */
export default function CompletedModule({ moduleId, config }: ModuleProps) {
  return (
    <div className="h-full w-full overflow-auto p-4">
      <CompletedList moduleId={moduleId} config={config} />
    </div>
  );
}

