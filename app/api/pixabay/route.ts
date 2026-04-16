import { ImageSearchResult, ImageSearchResponse } from "@/lib/types/search";

interface PixabayHit {
  id: number;
  webformatURL: string;
  largeImageURL: string;
  previewURL: string;
  tags: string;
  user: string;
  pageURL: string;
  imageWidth: number;
  imageHeight: number;
}

interface PixabaySearchResult {
  hits: PixabayHit[];
}

async function runSearch(query: string) {
  const pixabayApiKey = process.env.PIXABAY_API_KEY;
  if (!pixabayApiKey) {
    return new Response(
      JSON.stringify({ error: "Image search is not configured (PIXABAY_API_KEY missing)" }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const pixabayUrl =
    "https://pixabay.com/api/" +
    `?key=${encodeURIComponent(pixabayApiKey)}` +
    `&q=${encodeURIComponent(query)}` +
    "&image_type=photo&safesearch=true&per_page=30";

  const res = await fetch(pixabayUrl, { cache: "no-store" });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    // eslint-disable-next-line no-console
    console.error("Pixabay error:", res.status, text);

    return new Response(
      JSON.stringify({
        error: "Pixabay request failed",
        status: res.status,
        body: text,
      }),
      {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const data: PixabaySearchResult = await res.json();
  const maxResults = process.env.PIXABAY_MAX_RESULTS
    ? Math.min(Math.max(1, parseInt(process.env.PIXABAY_MAX_RESULTS, 10)), 30)
    : undefined;
  const hits = maxResults ? data.hits.slice(0, maxResults) : data.hits;

  const images: ImageSearchResult[] = hits.map((hit) => ({
    id: String(hit.id),
    source: "pixabay",
    width: hit.imageWidth,
    height: hit.imageHeight,
    alt: hit.tags ?? "",
    thumbUrl: hit.previewURL,
    smallUrl: hit.webformatURL,
    regularUrl: hit.webformatURL,
    fullUrl: hit.largeImageURL,
    photographerName: hit.user,
    photographerUrl: hit.pageURL,
  }));

  const payload: ImageSearchResponse = {
    query,
    images,
  };

  return new Response(JSON.stringify({ payload }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim();
  if (!query) {
    return new Response(JSON.stringify({ error: "Missing q query param" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  return runSearch(query);
}

export async function POST(req: Request) {
  let body: { q?: string; context?: unknown };
  try {
    body = (await req.json()) as { q?: string; context?: unknown };
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const query = typeof body.q === "string" ? body.q.trim() : null;
  if (!query) {
    return new Response(JSON.stringify({ error: "Missing search query (q in body)" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  return runSearch(query);
}
