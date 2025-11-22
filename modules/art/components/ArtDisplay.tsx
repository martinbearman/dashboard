"use client";

import { useState, useEffect, useRef } from "react";
import { ModuleProps } from "@/lib/types/dashboard";
import Image from "next/image";
import { getAspectRatio } from "../lib/utils";

interface Artwork {
  id: string;
  title: string;
  artist: string;
  year: string;
  medium: string;
  description: string;
  imageUrl: string;
  museum: string;
}

const ARTWORK_INDEX_KEY = "artwork-current-index";

function getCurrentArtworkIndex(): number {
  if (typeof window === "undefined") {
    return 0;
  }
  try {
    const stored = localStorage.getItem(ARTWORK_INDEX_KEY);
    return stored !== null ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
}

function setCurrentArtworkIndex(index: number): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.setItem(ARTWORK_INDEX_KEY, index.toString());
  } catch {
    // Ignore localStorage errors
  }
}

function getNextArtworkIndex(): number {
  const currentIndex = getCurrentArtworkIndex();
  const nextIndex = currentIndex + 1;
  setCurrentArtworkIndex(nextIndex);
  return nextIndex;
}

export default function ArtDisplay({ moduleId, config }: ModuleProps) {
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchArtwork = async (useNextIndex: boolean = true) => {
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a new AbortController for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      // Get the next artwork index for linear rotation
      const artworkIndex = useNextIndex ? getNextArtworkIndex() : getCurrentArtworkIndex();
      const response = await fetch(`/api/art?index=${artworkIndex}`, {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch artwork: ${response.status}`);
      }

      const data: Artwork = await response.json();

      // Only update state if this is still the active request
      if (abortControllerRef.current === controller && data?.id) {
        setArtwork(data);
        // Reset image dimensions when new artwork loads
        setImageDimensions(null);
      }
    } catch (err) {
      // Don't update state if request was aborted (component unmounted)
      if (abortControllerRef.current !== controller) {
        return;
      }

      // Ignore abort errors (component unmounting)
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      // Set error message
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load artwork";
      setError(errorMessage);
      console.error("Error fetching artwork:", err);
    } finally {
      // Only update loading state if this is still the active request
      if (abortControllerRef.current === controller) {
        setLoading(false);
        abortControllerRef.current = null;
      }
    }
  };

  useEffect(() => {
    // On initial load, use current index (don't increment)
    fetchArtwork(false);

    return () => {
      // Cancel any pending request when component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  // Show full-screen error only on initial load (when no artwork exists)
  const showFullScreenError = error && !artwork && !loading;

  return (
    <div className="h-full w-full flex flex-col">
      {loading && !artwork && (
        <div className="flex items-center justify-center h-full">
          <div className="text-red-600 animate-pulse">Loading artwork...</div>
        </div>
      )}

      {showFullScreenError && (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <div className="text-red-600 text-sm">{error}</div>
          <button
            onClick={fetchArtwork}
            className="px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {artwork && (
        <>
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Artwork Image with Hover Overlay */}
            <div
              className="group relative w-full h-full overflow-hidden"
              style={{
                aspectRatio: getAspectRatio(imageDimensions),
              }}
            >
              <Image
                src={artwork.imageUrl}
                alt={artwork.title}
                fill
                className="object-contain"
                unoptimized
                onLoad={(e) => {
                  // Get natural image dimensions when loaded
                  const img = e.target as HTMLImageElement;
                  if (img.naturalWidth && img.naturalHeight) {
                    setImageDimensions({
                      width: img.naturalWidth,
                      height: img.naturalHeight,
                    });
                  }
                }}
                onError={(e) => {
                  // Fallback if image doesn't exist
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="flex items-center justify-center h-full text-gray-400 text-sm">
                        Image not available
                      </div>
                    `;
                  }
                }}
              />
              
              {/* Artwork Information Overlay - Hidden until hover */}
              <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-y-auto">
                <div className="p-4 h-full flex flex-col gap-2 text-white">
                  <h2 className="text-xl font-bold">{artwork.title}</h2>
                  <div className="text-lg text-red-400 font-semibold">
                    {artwork.artist}
                  </div>
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="font-medium">Year:</span> {artwork.year}
                    </div>
                    <div>
                      <span className="font-medium">Medium:</span> {artwork.medium}
                    </div>
                    <div>
                      <span className="font-medium">Museum:</span> {artwork.museum}
                    </div>
                  </div>
                  {artwork.description && (
                    <p className="text-sm mt-2 leading-relaxed">
                      {artwork.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer with New Artwork button */}
          <div className="mt-4 pt-4 border-t border-gray-700 flex-shrink-0">
            <button
              onClick={fetchArtwork}
              className="w-full px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
              aria-label="Get new artwork"
            >
              {loading ? "Loading..." : "New Artwork"}
            </button>
            {error && artwork && (
              <span className="text-xs text-red-600 italic mt-2 block text-center">
                ⚠ {error}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

