/**
 * Utility Functions for Art Module
 */

/**
 * Convert image dimensions to CSS aspect ratio string
 * 
 * @param dimensions - Object with width and height
 * @param defaultRatio - Default aspect ratio if dimensions are null (default: "1 / 1")
 * @returns CSS aspect ratio string (e.g., "800 / 600" or "1 / 1")
 * 
 * Example:
 * getAspectRatio({ width: 800, height: 600 }) => "800 / 600"
 * getAspectRatio(null) => "1 / 1"
 */
export function getAspectRatio(
  dimensions: { width: number; height: number } | null,
  defaultRatio: string = "1 / 1"
): string {
  if (!dimensions || !dimensions.width || !dimensions.height) {
    return defaultRatio;
  }
  return `${dimensions.width} / ${dimensions.height}`;
}

