"use client";

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
  const { imageUrl, imageRef, alt, caption } = imageConfig;

  const src = imageUrl ?? imageRef;

  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50/60 px-4 py-6 text-xs text-slate-500 italic">
        No image configured.
      </div>
    );
  }

  return (
    <figure className="flex h-full w-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white/80 shadow-sm">
      <div className="relative flex-1 min-h-[120px] bg-slate-100">
        {/* Using plain img for maximum flexibility; can be swapped to next/image later */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt || caption || "Dashboard image"}
          className="h-full w-full object-cover"
        />
      </div>
      {(caption || alt) && (
        <figcaption className="border-t border-slate-200 bg-white/90 px-3 py-2 text-xs text-slate-700">
          {caption || alt}
        </figcaption>
      )}
    </figure>
  );
}

