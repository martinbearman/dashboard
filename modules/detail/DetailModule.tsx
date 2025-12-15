"use client";

import { ModuleProps } from "@/lib/types/dashboard";
import type { DetailModuleConfig } from "@/lib/types/dashboard";

/**
 * DetailModule
 *
 * Renders a simple "detail document" based on its config.
 * For now this is read‑only and uses very basic styling.
 */
export default function DetailModule({ moduleId, config }: ModuleProps) {
  // 1) Treat the generic config blob as a DetailModuleConfig
  const detailConfig = (config ?? {}) as DetailModuleConfig;

  // 2) Provide safe defaults so the module never crashes
  const {
    title = "Untitled detail",
    content = "",
    imageUrls = [],
    links = [],
  } = detailConfig;

  // 3) Render current config values
  return (
    <div className="flex flex-col gap-2 p-3 text-sm">
      <h2 className="font-semibold text-base">{title}</h2>
      {content && (
        <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
      )}
      {imageUrls.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {imageUrls.map((url) => (
            <img
              key={url}
              src={url}
              alt=""
              className="max-h-32 rounded border border-neutral-700 object-contain"
            />
          ))}
        </div>
      )}
      {links.length > 0 && (
        <div className="mt-2 flex flex-col gap-1">
          {links.map((link, index) => {
            const displayText = link.label || link.url;
            const isInternal = link.type === 'internal';
            
            return (
              <a
                key={link.url + index}
                href={link.url}
                target={isInternal ? undefined : "_blank"}
                rel={isInternal ? undefined : "noopener noreferrer"}
                className={`hover:underline break-all ${
                  isInternal
                    ? "text-purple-600 hover:text-purple-800"
                    : "text-blue-600 hover:text-blue-800"
                }`}
              >
                {isInternal && (
                  <span className="inline-block mr-1.5 text-xs">📄</span>
                )}
                {displayText}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}