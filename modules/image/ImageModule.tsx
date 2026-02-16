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
  const [initialGridPosition] = useState(gridPosition);

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
      <div className="relative w-full bg-slate-100">
        {hasValidSrc ? (
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
          <div className="pointer-events-none absolute right-1.5 top-1.5 max-w-[75%] rounded bg-black/55 px-1.5 py-0.5 text-xs font-medium text-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
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
                  className="pointer-events-auto hover:underline block truncate italic"
                  onClick={(e) => e.stopPropagation()}
                >
                  Photo: {photographerName}
                </a>
              ) : (
                <div className="truncate italic">
                  Photo: {photographerName}
                </div>
              )
            )}
          </div>
        )}
        {initialGridPosition && (
          <div className="pointer-events-none absolute left-1.5 top-1.5 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white/90">
            Calculated size: w={initialGridPosition.w}, h={initialGridPosition.h}
          </div>
        )}
      </div>
      {(caption || alt) && (
        <figcaption className="border-t border-slate-200 bg-white/90 px-3 py-2 text-xs text-slate-700">
          <div>{caption || alt}</div>
        </figcaption>
      )}
    </figure>
  );
}

