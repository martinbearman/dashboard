import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

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

async function getRandomArtwork(): Promise<NextResponse> {
  try {
    // Read the artworks JSON file
    const filePath = join(process.cwd(), "lib", "data", "artworks.json");
    const fileContents = await readFile(filePath, "utf8");
    const artworks: Artwork[] = JSON.parse(fileContents);

    // Validate that we have artworks
    if (!Array.isArray(artworks) || artworks.length === 0) {
      return NextResponse.json(
        { error: "No artworks available" },
        { status: 500 }
      );
    }

    // Select a random artwork
    const randomIndex = Math.floor(Math.random() * artworks.length);
    const randomArtwork = artworks[randomIndex];

    // Validate artwork structure
    if (!randomArtwork || !randomArtwork.id || !randomArtwork.title) {
      return NextResponse.json(
        { error: "Invalid artwork data structure" },
        { status: 500 }
      );
    }

    return NextResponse.json(randomArtwork, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Cache-Control": "no-cache", // Don't cache, always fetch fresh artwork
      },
    });
  } catch (error) {
    console.error("Error fetching artwork:", {
      error: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : "Unknown",
      stack: error instanceof Error ? error.stack : undefined,
    });

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      {
        error: "Failed to fetch artwork",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return getRandomArtwork();
}

