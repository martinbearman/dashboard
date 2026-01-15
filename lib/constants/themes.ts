import type { Theme } from "@/lib/types/theme";

/**
 * Registry of predefined themes
 * Extensible for future AI-generated themes
 */
export const predefinedThemes: Theme[] = [
  {
    id: "light",
    name: "Light",
    type: "predefined",
    cssClass: "light-theme",
    description: "Clean and bright light theme",
    semanticTags: ["light", "bright", "minimal", "clean"],
    useCases: ["General use", "Daytime work", "Minimalist dashboards"],
  },
  {
    id: "dark",
    name: "Dark",
    type: "predefined",
    cssClass: "dark-theme",
    description: "Dark theme for reduced eye strain",
    semanticTags: ["dark", "night", "low-light", "modern"],
    useCases: ["Nighttime work", "Low-light environments", "Modern dashboards"],
  },
  {
    id: "tron",
    name: "Tron",
    type: "predefined",
    cssClass: "tron-theme",
    description: "Cyberpunk-inspired neon theme",
    semanticTags: ["cyberpunk", "neon", "futuristic", "tech", "glow"],
    useCases: ["Tech projects", "Gaming dashboards", "Futuristic aesthetics"],
  },
];

/**
 * Get a theme by ID
 */
export function getThemeById(id: string): Theme | undefined {
  return predefinedThemes.find((theme) => theme.id === id);
}

/**
 * Get all predefined themes
 */
export function getAllPredefinedThemes(): Theme[] {
  return predefinedThemes;
}

/**
 * Default theme ID (used when dashboard has no theme set)
 */
export const DEFAULT_THEME_ID = "tron";

/**
 * Legacy theme values that map to theme IDs
 * Used for migration from old global theme system
 */
export const LEGACY_THEME_IDS = ["light", "dark", "tron"] as const;

/**
 * Check if a string is a valid legacy theme value
 */
export function isLegacyTheme(value: string): value is "light" | "dark" | "tron" {
  return LEGACY_THEME_IDS.includes(value as any);
}

/**
 * Migrate legacy theme value to theme ID
 * Since legacy values match theme IDs, this is a simple passthrough with validation
 */
export function migrateLegacyTheme(legacyTheme: "light" | "dark" | "tron"): string {
  // Verify the theme exists in the registry
  const theme = getThemeById(legacyTheme);
  return theme ? theme.id : DEFAULT_THEME_ID;
}

/**
 * Theme metadata for easy access in components
 */
export interface ThemeMetadata {
  id: string;
  cssClass: string;
  isTron: boolean;
  isLight: boolean;
  isDark: boolean;
  name: string;
}

/**
 * Get theme metadata by ID
 * Provides convenient access to theme properties for component styling
 */
export function getThemeMetadata(id: string): ThemeMetadata {
  const theme = getThemeById(id);
  const resolvedId = theme?.id || DEFAULT_THEME_ID;
  const resolvedTheme = theme || getThemeById(DEFAULT_THEME_ID)!;
  
  return {
    id: resolvedId,
    cssClass: resolvedTheme.cssClass,
    isTron: resolvedId === "tron",
    isLight: resolvedId === "light",
    isDark: resolvedId === "dark",
    name: resolvedTheme.name,
  };
}
