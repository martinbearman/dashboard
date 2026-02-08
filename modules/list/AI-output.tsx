"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ModuleProps } from "@/lib/types/dashboard";
import type { ListModuleConfig } from "@/lib/types/dashboard";

/**
 * AI output
 *
 * Renders a list of items from config. Config-driven and AI-populatable.
 * Read-only display; items are edited via config panel or programmatically.
 */
export default function AIOutput({ moduleId, config }: ModuleProps) {
  const listConfig = (config ?? {}) as ListModuleConfig;
  const {
    items = [],
  } = listConfig;

  // Filter out empty items (from empty lines in config panel)
  const displayItems = items.filter((item) => item.text.trim());

  return (
    <div className="flex flex-col gap-2 p-3 text-sm">
      {displayItems.length === 0 ? (
        <p className="text-gray-500 italic">No ouput yet..</p>
      ) : (
        <div className="space-y-1">
          {displayItems.map((item, index) => (
            <div key={index} className="leading-relaxed">
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                >
                  <span className={item.done ? "line-through text-gray-500" : ""}>
                    <span className="[&_ul]:list-disc [&_ol]:list-decimal [&_ul]:list-inside [&_ol]:list-inside [&_pre]:bg-slate-100 [&_pre]:p-2 [&_pre]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:rounded [&_h1]:font-bold [&_h1]:text-lg [&_h2]:font-bold [&_h2]:text-base [&_p]:my-0.5">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.text}</ReactMarkdown>
                    </span>
                  </span>
                </a>
              ) : (
                <span className={item.done ? "line-through text-gray-500" : ""}>
                  <span className="[&_ul]:list-disc [&_ol]:list-decimal [&_ul]:list-inside [&_ol]:list-inside [&_pre]:bg-slate-100 [&_pre]:p-2 [&_pre]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:rounded [&_h1]:font-bold [&_h1]:text-lg [&_h2]:font-bold [&_h2]:text-base [&_p]:my-0.5">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.text}</ReactMarkdown>
                  </span>
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
