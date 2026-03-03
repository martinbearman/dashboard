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