import * as AI from "ai";
import { google } from "@ai-sdk/google";
import { moduleRegistry } from "@/modules/registry";
import { stepCountIs } from "ai";
import { z } from "zod";

// Module types that the AI can generate layouts for
const AI_MODULE_TYPES = [
  "article-body",
  "image",
  "pull-quote",
  "stat-block",
  "ai-output",
] as const;

// Build size hints from registry defaults
const sizeHints = moduleRegistry
  .filter((m) => AI_MODULE_TYPES.includes(m.type as (typeof AI_MODULE_TYPES)[number]))
  .map((m) => `${m.type} w=${m.defaultGridSize.w} h=${m.defaultGridSize.h}`)
  .join(", ");

const LAYOUT_SYSTEM_PROMPT = `
You are a dashboard layout generator. Given a user prompt and context, you design a magazine-style dashboard layout for a personal dashboard app.
ALWAYS∫ respond with images if possible.
ALWAYS respond with a SINGLE JSON object matching this TypeScript-style schema (no extra text, no explanation):

type ModuleType = "article-body" | "image" | "pull-quote" | "stat-block" | "ai-output";

interface LayoutResponse {
  version?: string;
  dashboard: {
    title?: string;
    modules: {
      id?: string;
      type: ModuleType;
      position?: { x: number; y: number; w: number; h: number };
      config?: Record<string, unknown>;
    }[];
  };
}

GRID:
- The layout uses an 8-column grid at the large breakpoint (x + w must be <= 8).
- Recommended default sizes: ${sizeHints}.
- y is the vertical position; start at y=0 and stack modules downwards as needed.

MODULE CONFIG SHAPES (use these keys inside config):
- article-body: { title?: string; body: string; style?: "primary" | "secondary" }
- image: { alt?: string; caption?: string } — do NOT include imageUrl or imageRef; images are populated from Unsplash based on the user's prompt.
- pull-quote: { quote: string; attribution?: string; emphasis?: "low" | "medium" | "high" }
- stat-block: { title?: string; items: { label: string; value: string }[] }

RULES:
1. Prefer ONE main article-body for long narrative text.
2. Use pull-quote modules for short highlighted quotes.
3. Use stat-block for compact key numbers/specs.
4. Use image modules when the user mentions or provides imagery.
5. NEVER include imageUrl or imageRef in image config — the app fetches images from Unsplash.
6. If the user just wants a simple answer, you may return a single article-body module with items[0].text as the answer.
7. Do NOT include comments, trailing commas, or any text outside the JSON.
`.trim();


// Define the Serper search tool (commented out for now)
// const serperTool = {
//   description: "Search the web using Google Search via Serper API. Use this when you need current information, facts, or data from the internet.",
//   inputSchema: z.object({
//     query: z.string().describe("The search query to look up"),
//   }),
//   execute: async ({ query }: { query: string }) => {
//     console.log("Serper search called with:", query);
//
//     const response = await fetch("https://google.serper.dev/search", {
//       method: "POST",
//       headers: {
//         "X-API-KEY": process.env.SERPER_API_KEY!,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ q: query }),
//     });
//
//     const data = await response.json();
//
//     // Return a summarized version of results
//     return {
//       organic: data.organic?.slice(0, 5).map((r: any) => ({
//         title: r.title,
//         snippet: r.snippet,
//         link: r.link,
//       })),
//       answerBox: data.answerBox,
//       knowledgeGraph: data.knowledgeGraph,
//     };
//   },
// };

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: AI.UIMessage[] };

  const systemMessage: AI.UIMessage = {
    id: "layout-system",
    role: "system",
    parts: [
      {
        type: "text",
        text: LAYOUT_SYSTEM_PROMPT,
      },
    ],
  };

  const result = AI.streamText({
    model: google("gemini-2.5-flash-lite"),
    messages: await AI.convertToModelMessages([systemMessage, ...messages]),
    // tools: {
    //   webSearch: serperTool,
    // },
    // stopWhen: stepCountIs(2)
  });

  return result.toUIMessageStreamResponse();
}
