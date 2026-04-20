import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

describe("Pixabay API route", () => {
  const originalApiKey = process.env.PIXABAY_API_KEY;
  const originalMaxResults = process.env.PIXABAY_MAX_RESULTS;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.PIXABAY_API_KEY = "test-api-key";
    delete process.env.PIXABAY_MAX_RESULTS;
  });

  afterEach(() => {
    process.env.PIXABAY_API_KEY = originalApiKey;
    process.env.PIXABAY_MAX_RESULTS = originalMaxResults;
  });

  it("returns 400 when query param is missing", async () => {
    const response = await GET(new Request("http://localhost/api/pixabay"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Missing q query param",
    });
  });

  it("returns 503 when PIXABAY_API_KEY is missing", async () => {
    delete process.env.PIXABAY_API_KEY;

    const response = await GET(new Request("http://localhost/api/pixabay?q=cat"));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "Image search is not configured (PIXABAY_API_KEY missing)",
    });
  });

  it("calls Pixabay with expected query params and fetch options", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          hits: [],
        }),
        { status: 200 }
      )
    );

    const response = await GET(new Request("http://localhost/api/pixabay?q=cat photo"));

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [requestUrl, requestOptions] = fetchMock.mock.calls[0] as [
      string,
      RequestInit,
    ];
    const parsed = new URL(requestUrl);

    expect(parsed.origin + parsed.pathname).toBe("https://pixabay.com/api/");
    expect(parsed.searchParams.get("key")).toBe("test-api-key");
    expect(parsed.searchParams.get("q")).toBe("cat photo");
    expect(parsed.searchParams.get("image_type")).toBe("photo");
    expect(parsed.searchParams.get("safesearch")).toBe("true");
    expect(parsed.searchParams.get("per_page")).toBe("30");

    expect(requestOptions.cache).toBe("no-store");
    expect(requestOptions.headers).toMatchObject({
      Accept: "application/json",
      "User-Agent": "DashboardApp/1.0 (+https://dashboard.local)",
    });
    expect(requestOptions.signal).toBeInstanceOf(AbortSignal);
  });

  it("passes through Pixabay non-OK responses", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("Rate limit exceeded", { status: 429 })
    );

    const response = await GET(new Request("http://localhost/api/pixabay?q=cat"));

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({
      error: "Pixabay request failed",
      status: 429,
      body: "Rate limit exceeded",
    });
  });

  it("limits mapped results using PIXABAY_MAX_RESULTS", async () => {
    process.env.PIXABAY_MAX_RESULTS = "1";

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          hits: [
            {
              id: 1,
              previewURL: "http://cdn.pixabay.com/photo-preview.jpg",
              webformatURL: "http://cdn.pixabay.com/photo-small.jpg",
              largeImageURL: "http://cdn.pixabay.com/photo-large.jpg",
              tags: "first image",
              user: "alice",
              pageURL: "https://pixabay.com/photos/example-1/",
              imageWidth: 800,
              imageHeight: 600,
            },
            {
              id: 2,
              previewURL: "http://cdn.pixabay.com/photo-preview-2.jpg",
              webformatURL: "http://cdn.pixabay.com/photo-small-2.jpg",
              largeImageURL: "http://cdn.pixabay.com/photo-large-2.jpg",
              tags: "second image",
              user: "bob",
              pageURL: "https://pixabay.com/photos/example-2/",
              imageWidth: 1024,
              imageHeight: 768,
            },
          ],
        }),
        { status: 200 }
      )
    );

    const response = await GET(new Request("http://localhost/api/pixabay?q=landscape"));
    const json = (await response.json()) as {
      payload: { images: Array<{ id: string; fullUrl: string; regularUrl: string }> };
    };

    expect(response.status).toBe(200);
    expect(json.payload.images).toHaveLength(1);
    expect(json.payload.images[0].id).toBe("1");
    expect(json.payload.images[0].regularUrl).toBe("https://cdn.pixabay.com/photo-small.jpg");
    expect(json.payload.images[0].fullUrl).toBe("https://cdn.pixabay.com/photo-large.jpg");
  });
});
