import {
  unsplashRateLimiter,
  getClientIdentifier,
} from "@/lib/utils/rateLimiter";

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY ?? "";

if (!UNSPLASH_ACCESS_KEY) {
  throw new Error("UNSPLASH_ACCESS_KEY is not set");
}

interface UnsplashSearchResult {
  results: Array<{
    id: string;
    width: number;
    height: number;
    alt_description?: string | null;
    description?: string | null;
    urls: {
      thumb: string;
      small: string;
      regular: string;
      full: string;
    };
    user: {
      name: string;
      links: { html: string };
    };
  }>;
}

export async function GET(req: Request) {
  // Check rate limit
  const clientId = getClientIdentifier(req);
  const rateLimit = unsplashRateLimiter.check(clientId);

  if (!rateLimit.allowed) {
    const resetDate = new Date(rateLimit.resetAt);
    return new Response(
      JSON.stringify({
        error: "Rate limit exceeded",
        message: `Too many requests. Please try again after ${resetDate.toISOString()}`,
        resetAt: resetDate.toISOString(),
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": "50",
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          "X-RateLimit-Reset": Math.ceil(rateLimit.resetAt / 1000).toString(),
          "Retry-After": Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return new Response(JSON.stringify({ error: "Missing q query param" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const unsplashUrl =
    "https://api.unsplash.com/search/photos" +
    `?query=${encodeURIComponent(query)}` +
    "&per_page=30&content_filter=high" +
    `&client_id=${encodeURIComponent(UNSPLASH_ACCESS_KEY)}`;

  const res = await fetch(unsplashUrl, {
    headers: {
      "Accept-Version": "v1",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    // eslint-disable-next-line no-console
    console.error("Unsplash error:", res.status, text);

    return new Response(
      JSON.stringify({
        error: "Unsplash request failed",
        status: res.status,
        body: text,
      }),
      {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const data = (await res.json()) as UnsplashSearchResult;

  const images = data.results.map((photo) => ({
    id: photo.id,
    width: photo.width,
    height: photo.height,
    alt: photo.alt_description ?? photo.description ?? "",
    thumbUrl: photo.urls.thumb,
    smallUrl: photo.urls.small,
    regularUrl: photo.urls.regular,
    fullUrl: photo.urls.full,
    photographerName: photo.user.name,
    photographerUrl: photo.user.links.html,
  }));

  return new Response(JSON.stringify({ images }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "X-RateLimit-Limit": "50",
      "X-RateLimit-Remaining": rateLimit.remaining.toString(),
      "X-RateLimit-Reset": Math.ceil(rateLimit.resetAt / 1000).toString(),
    },
  });
}

