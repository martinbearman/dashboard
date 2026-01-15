/**
 * Theme type definitions for dashboard theming system
 */

export type ThemeType = "predefined" | "custom";

/**
 * Color palette for custom themes
 */
export interface ThemeColors {
  primary?: string;
  secondary?: string;
  background?: string;
  foreground?: string;
  accent?: string;
  border?: string;
  text?: string;
}

/**
 * Background settings for themes
 */
export interface ThemeBackground {
  type: "solid" | "gradient" | "image" | "pattern";
  value: string; // color, gradient definition, image URL, or pattern name
  opacity?: number;
}

/**
 * Theme definition
 */
export interface Theme {
  /** Unique identifier for the theme */
  id: string;
  /** Display name */
  name: string;
  /** Theme type */
  type: ThemeType;
  /** CSS class to apply to body element */
  cssClass: string;
  /** Custom color palette (for custom themes) */
  colors?: ThemeColors;
  /** Custom background settings (for custom themes) */
  background?: ThemeBackground;
  /** Description for AI/UI context */
  description?: string;
  /** Semantic tags for AI understanding */
  semanticTags?: string[];
  /** Example use cases */
  useCases?: string[];
}
