import type { ImageModuleConfig } from "@/lib/types/dashboard";
import type { ImageSearchResult } from "@/lib/types/search";

function capitalizeFirst(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function pickDisplayUrl(image: ImageSearchResult): string {
  return image.regularUrl || image.smallUrl || image.fullUrl || image.thumbUrl;
}

export function toImageModuleConfig(image: ImageSearchResult): ImageModuleConfig {
  const altText = image.alt?.trim() ? capitalizeFirst(image.alt.trim()) : undefined;
  const config: ImageModuleConfig = {
    imageUrl: pickDisplayUrl(image),
    alt: altText || `${image.source === "pixabay" ? "Pixabay" : "Unsplash"} image`,
    caption: altText,
    photographerName: image.photographerName,
    photographerUrl: image.photographerUrl,
    unsplashPhotoUrl:
      image.source === "unsplash" ? `https://unsplash.com/photos/${image.id}` : undefined,
  };
  return config;
}
