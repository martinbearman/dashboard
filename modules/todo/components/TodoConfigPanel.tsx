"use client";

import { useState, useEffect } from "react";
import type { ModuleConfigProps } from "@/lib/types/dashboard";

export default function TodoConfigPanel({
  moduleId,
  config,
  onConfigChange,
}: ModuleConfigProps) {
  const [listName, setListName] = useState(
    (config?.listName as string) ?? "Todo List"
  );

  // Update local state when config changes externally
  useEffect(() => {
    if (config?.listName) {
      setListName(config.listName as string);
    }
  }, [config?.listName]);

  const handleNameChange = (newName: string) => {
    setListName(newName);
    onConfigChange({
      ...config,
      listName: newName,
      // Keep listId if it exists, otherwise generate one from the name
      listId: config?.listId ?? `todo-list-${newName.toLowerCase().replace(/\s+/g, "-")}`,
    });
  };

  return (
    <div className="p-4">
      <h3 className="font-semibold text-lg mb-4">Todo List Settings</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          List Name
        </label>
        <input
          type="text"
          value={listName}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Enter list name..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          This name helps you identify this todo list.
        </p>
      </div>

      {config?.listId && (
        <div className="text-xs text-gray-400">
          List ID: <code className="bg-gray-100 px-1 rounded">{config.listId}</code>
        </div>
      )}
    </div>
  );
}