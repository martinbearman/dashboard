import type { Breakpoint } from "@/lib/types/dashboard";

/** Ordered list of supported grid breakpoints (shared across app) */
export const GRID_BREAKPOINTS: Breakpoint[] = ["lg", "md", "sm", "xs", "xxs"];

/** Pixel widths used by react-grid-layout for each breakpoint */
export const GRID_BREAKPOINT_WIDTHS: Record<Breakpoint, number> = {
  lg: 1024,
  md: 768,
  sm: 640,
  xs: 480,
  xxs: 0,
};

/** Number of grid columns per breakpoint - 12/6/6/3/1 for clean 2-3 per row */
export const GRID_COLS: Record<Breakpoint, number> = {
  lg: 12,  // w=4 → 3 per row, w=6 → 2 per row
  md: 6,   // w=3 → 2 per row
  sm: 6,   // w=3 → 2 per row
  xs: 3,   // w=3 → 1 per row (full width)
  xxs: 1,  // stacked
};

/** Default row height (in px) for the dashboard grid */
export const GRID_ROW_HEIGHT = 100;

/** Default margin between grid items: [horizontal, vertical] (in px) */
export const GRID_MARGIN: [number, number] = [12, 12];

/** Convenience bundle for wiring into ResponsiveGridLayout */
export const GRID_LAYOUT_CONFIG = {
  breakpoints: GRID_BREAKPOINT_WIDTHS,
  cols: GRID_COLS,
  rowHeight: GRID_ROW_HEIGHT,
  margin: GRID_MARGIN,
};

