"use client";

import { useState, useEffect } from "react";
import type { ModuleConfigProps } from "@/lib/types/dashboard";
import type { ListModuleConfig, ListItem } from "@/lib/types/dashboard";

/**
 * ListConfigPanel
 *
 * Simple editor for the AI output (`ai-output`) module:
 * - Title (optional heading)
 * - Items (one per line, parsed into ListItem[])
 *
 * For POC, items are text-only; url and done can be set programmatically by AI.
 */
export default function ListConfigPanel({
  moduleId,
  config,
  onConfigChange,
}: ModuleConfigProps) {
  const typedConfig = (config ?? {}) as ListModuleConfig;

  const [title, setTitle] = useState<string>(typedConfig.title ?? "AI output");
  const [itemsText, setItemsText] = useState<string>(
    (typedConfig.items ?? []).map((item) => item.text).join("\n")
  );

  // Keep local state in sync if config changes externally
  useEffect(() => {
    if (typedConfig.title !== undefined) {
      setTitle(typedConfig.title);
    }
    if (typedConfig.items !== undefined) {
      setItemsText(typedConfig.items.map((item) => item.text).join("\n"));
    }
  }, [typedConfig.title, typedConfig.items]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    onConfigChange({
      ...config,
      title: newTitle,
    } as ListModuleConfig);
  };

  const handleItemsChange = (text: string) => {
    setItemsText(text);
    const items: ListItem[] = text
      .split(/\r?\n/)
      .map((line) => ({ text: line }));
    onConfigChange({
      ...config,
      items,
    } as ListModuleConfig);
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="AI output"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Items (one per line)
        </label>
        <textarea
          value={itemsText}
          onChange={(e) => handleItemsChange(e.target.value)}
          placeholder="Item 1&#10;Item 2&#10;Item 3"
          rows={10}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-y text-gray-900"
        />
        <p className="mt-1 text-xs text-gray-500">
          Each non-empty line becomes a list item. URLs and done state can be
          set programmatically (e.g. by AI).
        </p>
      </div>
    </div>
  );
}
