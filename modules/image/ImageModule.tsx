"use client";

import { useState } from "react";
import { useAppSelector } from "@/lib/store/hooks";
import { selectModuleGridPosition } from "@/lib/store/selectors/dashboardSelectors";
import type { ModuleProps, ImageModuleConfig } from "@/lib/types/dashboard";

/**
 * Image module
 *
 * Renders a single image with an optional caption. The image can be referenced
 * either by a direct URL or by a logical imageRef that the host application
 * resolves to a URL.
 */
export default function ImageModule({ moduleId, config }: ModuleProps) {
  const imageConfig = (config ?? {}) as ImageModuleConfig;
  const { imageUrl, imageRef, alt, caption, photographerName, photographerUrl } = imageConfig;

  const [hasError, setHasError] = useState(false);

  const gridPosition = useAppSelector((state) =>
    selectModuleGridPosition(state, moduleId, "lg")
  );

  const src = imageUrl ?? imageRef;

  if (!src || (typeof src === "string" && src.trim() === "")) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50/60 px-4 py-6 text-xs text-slate-500 italic">
        No image configured.
      </div>
    );
  }

  const hasValidSrc =
    src != null &&
    typeof src === "string" &&
    src.trim().length > 0;

  return (
    <figure className="group flex h-full w-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white/80 shadow-sm">
      <div className="relative flex min-h-0 flex-1 w-full flex-col bg-slate-100">
        {hasError ? (
          <div className="flex min-h-0 flex-1 w-full flex-col items-center justify-center gap-1 px-4 py-6 text-xs text-red-600">
            <span>Failed to load image.</span>
          </div>
        ) : hasValidSrc ? (
          /* Using plain img for maximum flexibility; can be swapped to next/image later */
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={src}
            alt={alt || caption || "Dashboard image"}
            className="h-full w-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="flex h-full min-h-[120px] w-full items-center justify-center px-4 py-6 text-xs text-slate-500 italic">
            No image configured.
          </div>
        )}

        {/* Alt + photographer overlay at the top, shown on hover */}
        {(alt || photographerName) && (
          <div className="pointer-events-none absolute right-1.5 top-1.5 max-w-[75%] rounded bg-black/55 px-2 py-1 text-base font-medium text-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
            {alt && (
              <div className="truncate">
                {alt}
              </div>
            )}
            {photographerName && (
              photographerUrl ? (
                <a
                  href={photographerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="pointer-events-auto hover:underline block truncate italic mt-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  Photo: {photographerName}
                </a>
              ) : (
                <div className="truncate italic mt-1">
                  Photo: {photographerName}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </figure>
  );
}

