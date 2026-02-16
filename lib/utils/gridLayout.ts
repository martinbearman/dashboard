import type { DashboardModule } from "@/lib/types/dashboard";
import { DEFAULT_GRID_SIZE, getModuleByType } from "@/modules/registry";

export type GridSize = { w: number; h: number };

export type ImageContentMeta = {
  kind: "image";
  width?: number;
  height?: number;
  /** Optional precomputed ratio; if not provided we'll derive from width/height */
  aspectRatio?: number; // width / height
};

export type ChartContentMeta = {
  kind: "chart";
  /** Prefer shape if no exact aspect ratio is known */
  orientation?: "wide" | "tall" | "square";
  aspectRatio?: number;
};

export type TextContentMeta = {
  kind: "text";
  /** Rough density / length hints */
  estimatedLines?: number;
  density?: "compact" | "normal" | "spacious";
};

export type GenericContentMeta = {
  kind: "generic";
};

export type ModuleContentMeta =
  | ImageContentMeta
  | ChartContentMeta
  | TextContentMeta
  | GenericContentMeta
  | undefined;

function clampGridSize(size: GridSize, meta?: DashboardModule): GridSize {
  if (!meta) return size;

  const min = meta.minGridSize ?? { w: 1, h: 1 };
  const max = meta.maxGridSize ?? { w: 12, h: 12 };

  return {
    w: Math.min(Math.max(size.w, min.w), max.w),
    h: Math.min(Math.max(size.h, min.h), max.h),
  };
}

function computeSizeForImage(meta: DashboardModule, content: ImageContentMeta): GridSize {
  const base = meta.defaultGridSize ?? DEFAULT_GRID_SIZE;
  const min = meta.minGridSize ?? { w: 1, h: 1 };
  const max = meta.maxGridSize ?? { w: 12, h: 12 };

  const aspect =
    content.aspectRatio ??
    (content.width && content.height ? content.width / content.height : undefined);

  if (!aspect || !isFinite(aspect) || aspect <= 0) {
    return base;
  }

  const candidateHeights: number[] = [];
  for (let h = min.h; h <= max.h; h += 1) {
    candidateHeights.push(h);
  }

  let best: GridSize = base;
  let bestError = Number.POSITIVE_INFINITY;

  for (const h of candidateHeights) {
    const wFloat = aspect * h;
    const w = Math.round(wFloat);

    if (w < min.w || w > max.w) continue;

    const gridAspect = w / h;
    const error = Math.abs(gridAspect - aspect);

    if (error < bestError) {
      bestError = error;
      best = { w, h };
    }
  }

  return best;
}

function computeSizeForChart(meta: DashboardModule, content: ChartContentMeta): GridSize {
  const base = meta.defaultGridSize ?? DEFAULT_GRID_SIZE;

  if (content.aspectRatio && content.aspectRatio > 0 && isFinite(content.aspectRatio)) {
    return computeSizeForImage(meta, {
      kind: "image",
      aspectRatio: content.aspectRatio,
    });
  }

  if (content.orientation === "wide") {
    return { w: Math.max(base.w, base.h + 1), h: base.h };
  }

  if (content.orientation === "tall") {
    return { w: base.w, h: Math.max(base.h, base.w + 1) };
  }

  return base;
}

function computeSizeForText(meta: DashboardModule, content: TextContentMeta): GridSize {
  const base = meta.defaultGridSize ?? DEFAULT_GRID_SIZE;

  const lines = content.estimatedLines ?? 10;
  const density = content.density ?? "normal";

  let h = base.h;
  if (lines > 20) h += 2;
  else if (lines > 10) h += 1;

  if (density === "spacious") h += 1;
  if (density === "compact") h = Math.max(h - 1, 1);

  return { w: base.w, h };
}

/**
 * Compute an appropriate grid size for a module type given some content metadata.
 * - Looks up defaults/min/max from the module registry
 * - Applies a per-kind heuristic (image/chart/text/generic)
 */
export function computeGridSizeForModule(
  type: DashboardModule["type"],
  contentMeta?: ModuleContentMeta
): GridSize {
  const meta = getModuleByType(type);
  const base = meta?.defaultGridSize ?? DEFAULT_GRID_SIZE;

  if (!meta || !contentMeta) {
    return clampGridSize(base, meta);
  }

  switch (contentMeta.kind) {
    case "image":
      return clampGridSize(computeSizeForImage(meta, contentMeta), meta);
    case "chart":
      return clampGridSize(computeSizeForChart(meta, contentMeta), meta);
    case "text":
      return clampGridSize(computeSizeForText(meta, contentMeta), meta);
    case "generic":
    default:
      return clampGridSize(base, meta);
  }
}

