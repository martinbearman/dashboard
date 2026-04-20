import { describe, it, expect } from "vitest";
import { pickDisplayUrl, toImageModuleConfig } from "../imageMapping";
import type { ImageSearchResult } from "@/lib/types/search";

function makeImage(overrides: Partial<ImageSearchResult> = {}): ImageSearchResult {
  return {
    id: "img-1",
    source: "pixabay",
    width: 1200,
    height: 800,
    alt: "city skyline",
    thumbUrl: "https://example.com/thumb.jpg",
    smallUrl: "https://example.com/small.jpg",
    regularUrl: "https://example.com/regular.jpg",
    fullUrl: "https://example.com/full.jpg",
    photographerName: "Alex",
    photographerUrl: "https://example.com/alex",
    ...overrides,
  };
}

describe("pickDisplayUrl", () => {
  it("uses regularUrl when present", () => {
    const image = makeImage();
    expect(pickDisplayUrl(image)).toBe("https://example.com/regular.jpg");
  });

  it("falls back from regularUrl to smallUrl then fullUrl then thumbUrl", () => {
    expect(pickDisplayUrl(makeImage({ regularUrl: "" }))).toBe("https://example.com/small.jpg");
    expect(pickDisplayUrl(makeImage({ regularUrl: "", smallUrl: "" }))).toBe(
      "https://example.com/full.jpg"
    );
    expect(pickDisplayUrl(makeImage({ regularUrl: "", smallUrl: "", fullUrl: "" }))).toBe(
      "https://example.com/thumb.jpg"
    );
  });
});

describe("toImageModuleConfig", () => {
  it("maps fields for pixabay with fallback alt", () => {
    const config = toImageModuleConfig(makeImage({ alt: "", source: "pixabay" }));

    expect(config.imageUrl).toBe("https://example.com/regular.jpg");
    expect(config.alt).toBe("Pixabay image");
    expect(config.caption).toBeUndefined();
    expect(config.unsplashPhotoUrl).toBeUndefined();
  });

  it("adds unsplash photo URL when source is unsplash", () => {
    const config = toImageModuleConfig(
      makeImage({ id: "abc123", source: "unsplash", alt: "mountain pass" })
    );

    expect(config.alt).toBe("Mountain pass");
    expect(config.caption).toBe("Mountain pass");
    expect(config.unsplashPhotoUrl).toBe("https://unsplash.com/photos/abc123");
  });
});
