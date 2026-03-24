"use client";

import { FormEvent, useEffect, useState } from "react";
import { type Dict, type Locale, getDict } from "../../lib/i18n";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function useLocaleDict(): Dict {
  const [dict, setDict] = useState<Dict>(getDict("ko"));

  useEffect(() => {
    const locale = (document.body.dataset.locale as Locale) || "ko";
    setDict(getDict(locale));
  }, []);

  return dict;
}

export default function ChatPage() {
  const t = useLocaleDict();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Set welcome message after dict is loaded
  useEffect(() => {
    setMessages([{ role: "assistant", content: t.chatWelcome }]);
  }, [t.chatWelcome]);

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const data = (await response.json()) as { reply?: string; error?: string };

      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: data.reply ?? data.error ?? t.chatUnexpected,
        },
      ]);
    } catch {
      setMessages([
        ...nextMessages,
        { role: "assistant", content: t.chatError },
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
            <span className="eyebrow">{t.chatEyebrow}</span>
            <h1>{t.chatTitle}</h1>
          </div>
          <p>{t.chatSubtitle}</p>
        </div>

        <div className="chat-messages">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`message ${message.role === "user" ? "message-user" : "message-assistant"}`}
            >
              <span className="message-role">
                {message.role === "user" ? t.chatYou : t.chatAgent}
              </span>
              <p>{message.content}</p>
            </div>
          ))}
        </div>

        <form className="chat-form" onSubmit={handleSubmit}>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={t.chatPlaceholder}
            aria-label="Chat message"
          />
          <button className="button primary" type="submit" disabled={isLoading}>
            {isLoading ? t.chatSending : t.chatSend}
          </button>
        </form>
      </section>
    </main>
  );
}
