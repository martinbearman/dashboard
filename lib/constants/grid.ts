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

/** Number of grid columns per breakpoint */
export const GRID_COLS: Record<Breakpoint, number> = {
  lg: 8,
  md: 6,
  sm: 4,
  xs: 3,
  xxs: 1,
};

/** Default row height (in px) for the dashboard grid */
export const GRID_ROW_HEIGHT = 100;

/** Default margin between grid items: [horizontal, vertical] (in px) */
export const GRID_MARGIN: [number, number] = [16, 16];

/** Convenience bundle for wiring into ResponsiveGridLayout */
export const GRID_LAYOUT_CONFIG = {
  breakpoints: GRID_BREAKPOINT_WIDTHS,
  cols: GRID_COLS,
  rowHeight: GRID_ROW_HEIGHT,
  margin: GRID_MARGIN,
};

