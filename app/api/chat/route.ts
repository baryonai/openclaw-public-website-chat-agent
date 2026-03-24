import { NextResponse } from "next/server";
import { sendToGateway } from "../../../lib/gateway-client";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { messages?: ChatMessage[] };
    const messages = body.messages ?? [];

    if (messages.length === 0) {
      return NextResponse.json({ reply: "메시지가 비어 있습니다." });
    }

    const reply = await sendToGateway(messages);
    return NextResponse.json({ reply });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    console.error("[api/chat] error:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
