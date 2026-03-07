export interface ImageSearchResult {
  id: string;
  width: number;
  height: number;
  alt: string;
  thumbUrl: string;
  smallUrl: string;
  regularUrl: string;
  fullUrl: string;
  photographerName: string;
  photographerUrl: string;
}

export interface ImageSearchResponse {
  query?: string;
  images: ImageSearchResult[];
}

/** Payload for a text search result (e.g. snippet, article). */
export interface TextSearchResultData {
  title?: string;
  body: string;
  source?: string;
}

/**
 * Generic search result: discriminated union so one list can hold images and text.
 * Use result.type to narrow and access result.data in a type-safe way.
 */
export type SearchResult =
  | { type: "image"; id: string; data: ImageSearchResult }
  | { type: "text"; id: string; data: TextSearchResultData };

/** Generic search response: query plus an array of any result type. */
export interface SearchResponse {
  query?: string;
  results: SearchResult[];
}