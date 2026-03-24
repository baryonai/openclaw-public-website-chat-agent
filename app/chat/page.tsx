"use client";

import { FormEvent, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const initialMessages: ChatMessage[] = [
  {
    role: "assistant",
    content: "Hi — I’m your website chat agent MVP. Ask a question to test the flow.",
  },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const nextMessages = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const data = (await response.json()) as { reply?: string; error?: string };

      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            data.reply ?? data.error ?? "The chat endpoint returned an unexpected response.",
        },
      ]);
    } catch {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: "Couldn’t reach the API route. Make sure the dev server is running.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="chat-page">
      <section className="chat-shell card">
        <div className="chat-header">
          <div>
            <span className="eyebrow">Demo chat</span>
            <h1>Website Chat Agent</h1>
          </div>
          <p>Messages are sent to a local Next.js API route stub.</p>
        </div>

        <div className="chat-messages">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`message ${message.role === "user" ? "message-user" : "message-assistant"}`}
            >
              <span className="message-role">{message.role === "user" ? "You" : "Agent"}</span>
              <p>{message.content}</p>
            </div>
          ))}
        </div>

        <form className="chat-form" onSubmit={handleSubmit}>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about pricing, support, onboarding..."
            aria-label="Chat message"
          />
          <button className="button primary" type="submit" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send"}
          </button>
        </form>
      </section>
    </main>
  );
}
