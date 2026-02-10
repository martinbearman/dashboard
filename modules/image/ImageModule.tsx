"use client";

import { useState } from "react";
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

  const src = imageUrl ?? imageRef;

  // if (!src) {
  //   return (
  //     <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50/60 px-4 py-6 text-xs text-slate-500 italic">
  //       No image configured.
  //     </div>
  //   );
  // }

  // if (hasError) {
  //   return (
  //     <div className="flex h-full w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-6 text-xs text-slate-500 italic">
  //       Image could not be loaded.
  //     </div>
  //   );
  // }

  return (
    <figure className="group flex h-full w-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white/80 shadow-sm">
      <div className="relative flex-1 min-h-[120px] bg-slate-100">
        {/* Using plain img for maximum flexibility; can be swapped to next/image later */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt || caption || "Dashboard image"}
          className="h-full w-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
        />
        {/* Photographer attribution overlay for Unsplash images */}
        {photographerName && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-md bg-black/40 px-1.5 py-0.5 text-[10px] font-medium text-white/90 truncate opacity-0 group-hover:opacity-100 transition-opacity">
            {photographerUrl ? (
              <a
                href={photographerUrl}
                target="_blank"
                rel="noreferrer"
                className="pointer-events-auto hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Photo by {photographerName}
              </a>
            ) : (
              `Photo by ${photographerName}`
            )}
          </div>
        )}
      </div>
      {(caption || alt) && (
        <figcaption className="border-t border-slate-200 bg-white/90 px-3 py-2 text-xs text-slate-700">
          {caption || alt}
        </figcaption>
      )}
    </figure>
  );
}

