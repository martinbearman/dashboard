"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppSelector } from "@/lib/store/hooks";
import type { ModuleConfigProps } from "@/lib/types/dashboard";

export default function CompletedConfigPanel({
  moduleId,
  config,
  onConfigChange,
}: ModuleConfigProps) {
  const [mode, setMode] = useState<"master" | "linked">(
    (config?.mode as "master" | "linked") ?? "master"
  );
  const [linkedListId, setLinkedListId] = useState(
    (config?.linkedListId as string) ?? ""
  );

  // Get all modules and their configs to build the list dropdown
  const { activeDashboardId, dashboards } = useAppSelector((s) => s.dashboards);
  const moduleConfigs = useAppSelector((s) => s.moduleConfigs.configs);
  const todosByList = useAppSelector((s) => s.todo.todosByList);

  // Build list of available todo lists
  const availableLists = useMemo(() => {
    const active = activeDashboardId ? dashboards[activeDashboardId] : null;
    if (!active) return [];

    // Find all todo modules and their configs
    const todoModules = active.modules.filter((m) => m.type === "todo");
    
    return todoModules
      .map((module) => {
        const moduleConfig = moduleConfigs[module.id];
        const listId = (moduleConfig?.listId as string) ?? module.id;
        const listName = (moduleConfig?.listName as string) ?? `Todo List ${module.id.slice(0, 8)}`;
        
        return {
          listId,
          listName,
        };
      })
      .filter((list) => list.listId in todosByList); // Only include lists that exist in state
  }, [activeDashboardId, dashboards, moduleConfigs, todosByList]);

  // Update local state when config changes externally
  useEffect(() => {
    if (config?.mode) {
      setMode(config.mode as "master" | "linked");
    }
    if (config?.linkedListId) {
      setLinkedListId(config.linkedListId as string);
    }
  }, [config?.mode, config?.linkedListId]);

  const handleModeChange = (newMode: "master" | "linked") => {
    setMode(newMode);
    onConfigChange({
      ...config,
      mode: newMode,
      // Clear linkedListId if switching to master mode
      linkedListId: newMode === "master" ? undefined : linkedListId,
    });
  };

  const handleListChange = (newListId: string) => {
    setLinkedListId(newListId);
    onConfigChange({
      ...config,
      linkedListId: newListId,
    });
  };

  return (
    <div className="p-4">
      <h3 className="font-semibold text-lg mb-4">Completed Tasks Settings</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Display Mode
        </label>
        <div className="space-y-2">
          <label className="flex items-start">
            <input
              type="radio"
              name="mode"
              value="master"
              checked={mode === "master"}
              onChange={() => handleModeChange("master")}
              className="mt-1 mr-2"
            />
            <div>
              <span className="text-sm font-medium">Master</span>
              <p className="text-xs text-gray-500">
                Show all completed tasks from all todo lists
              </p>
            </div>
          </label>
          <label className="flex items-start">
            <input
              type="radio"
              name="mode"
              value="linked"
              checked={mode === "linked"}
              onChange={() => handleModeChange("linked")}
              className="mt-1 mr-2"
            />
            <div>
              <span className="text-sm font-medium">Linked</span>
              <p className="text-xs text-gray-500">
                Show completed tasks from a specific todo list
              </p>
            </div>
          </label>
        </div>
      </div>

      {mode === "linked" && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Link to Todo List
          </label>
          {availableLists.length === 0 ? (
            <p className="text-sm text-gray-500">
              No todo lists available. Create a todo list module first.
            </p>
          ) : (
            <select
              value={linkedListId}
              onChange={(e) => handleListChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Select a todo list...</option>
              {availableLists.map((list) => (
                <option key={list.listId} value={list.listId}>
                  {list.listName}
                </option>
              ))}
            </select>
          )}
        </div>
      )}
    </div>
  );
}

