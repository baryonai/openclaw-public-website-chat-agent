import { NextResponse } from "next/server";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { messages?: ChatMessage[] };
    const lastUserMessage = [...(body.messages ?? [])]
      .reverse()
      .find((message) => message.role === "user");

    return NextResponse.json({
      reply: lastUserMessage
        ? `Stub response: you said “${lastUserMessage.content}”. Replace this route with your real LLM or backend integration.`
        : "Stub response: no user message was provided.",
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 }
    );
  }
}
