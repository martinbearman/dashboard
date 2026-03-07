import type { ImageSearchResponse } from "@/lib/types/search";

/** Error payload from /api/unsplash when !res.ok */
interface UnsplashErrorBody {
  error?: string;
  message?: string;
  resetAt?: string;
  status?: number;
  body?: string;
}

/**
 * POST /api/unsplash with { q, context }, returns typed ImageSearchResponse.
 * On !res.ok: parses JSON for error/message/resetAt, builds one error string (rate-limit aware) and throws.
 */
export async function searchUnsplash(
  query: string
): Promise<ImageSearchResponse> {
  const res = await fetch("/api/unsplash", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: query, context: query }),
  });

  if (!res.ok) {
    let errorMessage = "Image search failed";
    try {
      const data = (await res.json()) as UnsplashErrorBody;
      const parts: string[] = [];
      if (data.error) parts.push(data.error);
      if (data.message) parts.push(data.message);
      if (data.resetAt) {
        parts.push(
          `Rate limited. You can try again after ${new Date(data.resetAt).toLocaleString()}.`
        );
      }
      if (parts.length) errorMessage = parts.join(" ");
    } catch {
      errorMessage = `Image search failed (${res.status})`;
    }
    throw new Error(errorMessage);
  }

  const data = (await res.json()) as { payload: ImageSearchResponse };
  return data.payload;
}
