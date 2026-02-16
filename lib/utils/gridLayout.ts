import type { DashboardModule } from "@/lib/types/dashboard";
import { DEFAULT_GRID_SIZE, getModuleByType } from "@/modules/registry";
import { GRID_ROW_HEIGHT } from "@/lib/constants/grid";

export type GridSize = { w: number; h: number };

/** Grid container params from react-grid-layout's onWidthChange (matches lib formula) */
export type GridContainerParams = {
  containerWidth: number;
  margin: [number, number];
  cols: number;
  containerPadding: [number, number] | null;
};

/**
 * Compute column width in px using the same formula as react-grid-layout.
 * @see node_modules/react-grid-layout/lib/calculateUtils.js calcGridColWidth
 */
function calcGridColWidth(params: GridContainerParams): number {
  const { margin, containerPadding, containerWidth, cols } = params;
  const cp = containerPadding ?? margin;
  return (
    (containerWidth - margin[0] * (cols - 1) - cp[0] * 2) / cols
  );
}

/**
 * Cell ratio: colWidth / rowHeight. A w×h grid block has visual aspect ratio (w/h) * cellRatio.
 * When cellRatio = 1, grid cells are square; when > 1, columns are wider than rows are tall.
 */
export function computeCellRatio(params: GridContainerParams): number {
  const colWidth = calcGridColWidth(params);
  return colWidth / GRID_ROW_HEIGHT;
}

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

/**
 * @param cellRatio colWidth/rowHeight from the grid. When 1, cells are square; when >1, columns
 * are wider than rows. Visual aspect of a w×h block = (w/h) * cellRatio.
 */
function computeSizeForImage(
  meta: DashboardModule,
  content: ImageContentMeta,
  cellRatio: number = 1
): GridSize {
  const base = meta.defaultGridSize ?? DEFAULT_GRID_SIZE;
  const min = meta.minGridSize ?? { w: 1, h: 1 };
  const max = meta.maxGridSize ?? { w: 12, h: 12 };

  const aspect =
    content.aspectRatio ??
    (content.width && content.height ? content.width / content.height : undefined);

  if (!aspect || !isFinite(aspect) || aspect <= 0 || cellRatio <= 0) {
    return base;
  }

  const candidateHeights: number[] = [];
  for (let h = min.h; h <= max.h; h += 1) {
    candidateHeights.push(h);
  }

  let best: GridSize = base;
  let bestError = Number.POSITIVE_INFINITY;

  // visualAspect = (w/h) * cellRatio; we want visualAspect ≈ aspect
  // so w/h ≈ aspect / cellRatio, i.e. w ≈ aspect * h / cellRatio
  for (const h of candidateHeights) {
    const wFloat = (aspect * h) / cellRatio;
    const w = Math.round(wFloat);

    if (w < min.w || w > max.w) continue;

    const visualAspect = (w / h) * cellRatio;
    const error = Math.abs(visualAspect - aspect);

    if (error < bestError) {
      bestError = error;
      best = { w, h };
    }
  }

  return best;
}

function computeSizeForChart(
  meta: DashboardModule,
  content: ChartContentMeta,
  cellRatio: number = 1
): GridSize {
  const base = meta.defaultGridSize ?? DEFAULT_GRID_SIZE;

  if (content.aspectRatio && content.aspectRatio > 0 && isFinite(content.aspectRatio)) {
    return computeSizeForImage(
      meta,
      { kind: "image", aspectRatio: content.aspectRatio },
      cellRatio
    );
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
 * - When gridParams is provided, uses the actual grid cell ratio so image aspect ratios
 *   match the rendered dimensions (grid cells are not square; colWidth ≠ rowHeight).
 */
export function computeGridSizeForModule(
  type: DashboardModule["type"],
  contentMeta?: ModuleContentMeta,
  gridParams?: GridContainerParams | null
): GridSize {
  const meta = getModuleByType(type);
  const base = meta?.defaultGridSize ?? DEFAULT_GRID_SIZE;
  const cellRatio = gridParams ? computeCellRatio(gridParams) : 1;

  if (!meta || !contentMeta) {
    return clampGridSize(base, meta);
  }

  switch (contentMeta.kind) {
    case "image":
      return clampGridSize(computeSizeForImage(meta, contentMeta, cellRatio), meta);
    case "chart":
      return clampGridSize(computeSizeForChart(meta, contentMeta, cellRatio), meta);
    case "text":
      return clampGridSize(computeSizeForText(meta, contentMeta), meta);
    case "generic":
    default:
      return clampGridSize(base, meta);
  }
}

