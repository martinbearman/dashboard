import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://zenquotes.io/api/random", {
      headers: {
        "User-Agent": "Dashboard App",
      },
      next: { revalidate: 0 }, // Don't cache, always fetch fresh quote
    });

    if (!response.ok) {
      throw new Error(`ZenQuotes API returned ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
      },
    });
  } catch (error) {
    console.error("Error fetching quote:", error);
    return NextResponse.json(
      { error: "Oh, failed to fetch quote" },
      { status: 500 }
    );
  }
}

