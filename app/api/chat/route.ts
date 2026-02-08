import * as AI from "ai";
import { google } from "@ai-sdk/google";

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: AI.UIMessage[] };

  const result = AI.streamText({
    model: google("gemini-2.5-flash-lite"),
    messages: await AI.convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
