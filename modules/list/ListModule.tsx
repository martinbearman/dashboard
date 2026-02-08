"use client";

import { ModuleProps } from "@/lib/types/dashboard";
import type { ListModuleConfig } from "@/lib/types/dashboard";

/**
 * ListModule
 *
 * Renders a list of items from config. Config-driven and AI-populatable.
 * Read-only display; items are edited via config panel or programmatically.
 */
export default function ListModule({ moduleId, config }: ModuleProps) {
  const listConfig = (config ?? {}) as ListModuleConfig;
  const {
    title = "AI output",
    items = [],
  } = listConfig;
  // Filter out empty items (from empty lines in config panel)
  const displayItems = items.filter((item) => item.text.trim());

  return (
    <div className="flex flex-col gap-2 p-3 text-sm">
      <h2 className="font-semibold text-base">{title}</h2>
      {displayItems.length === 0 ? (
        <p className="text-gray-500 italic">No items</p>
      ) : (
        <ul className="list-disc list-inside space-y-1">
          {displayItems.map((item, index) => (
            <li key={index} className="leading-relaxed">
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                >
                  <span className={`whitespace-pre-wrap ${item.done ? "line-through text-gray-500" : ""}`}>
                    {item.text}
                  </span>
                </a>
              ) : (
                <span className={`whitespace-pre-wrap ${item.done ? "line-through text-gray-500" : ""}`}>
                  {item.text}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
