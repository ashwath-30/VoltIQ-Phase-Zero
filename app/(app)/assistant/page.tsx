"use client";

import { useState, useRef, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/app-shell/page-header";
import { MessageBubble, ChatMessageData } from "@/components/assistant/message-bubble";
import { TypingIndicator } from "@/components/assistant/typing-indicator";
import { SuggestedPrompts } from "@/components/assistant/suggested-prompts";
import { ChatInput } from "@/components/assistant/chat-input";
import { createClient } from "@/lib/supabase/client";

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `msg_${idCounter}`;
}

const welcomeMessage: ChatMessageData = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I can answer questions about your bills, usage, and forecast — using your actual account history, not a generic answer. What would you like to know?",
};

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadHistory() {
      const supabase = createClient();
      const { data } = await supabase
        .from("chats")
        .select("*")
        .order("timestamp", { ascending: true });

      if (data && data.length > 0) {
        setMessages(
          data.map((row) => ({
            id: row.id,
            role: row.role as "user" | "assistant",
            content: row.content,
            sources: row.sources ?? undefined,
          }))
        );
      } else {
        // Nothing saved yet — show the welcome message locally (it isn't
        // persisted, so it won't clutter real history in the database).
        setMessages([welcomeMessage]);
      }
      setLoadingHistory(false);
    }

    loadHistory();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  async function handleSend(content: string) {
    const userMessage: ChatMessageData = { id: nextId(), role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    setError(null);

    const startedAt = Date.now();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });

      const result = await response.json();

      // Keep a small minimum delay so the typing indicator doesn't just
      // flash for a few milliseconds on a very fast response.
      const elapsed = Date.now() - startedAt;
      if (elapsed < 500) {
        await new Promise((resolve) => setTimeout(resolve, 500 - elapsed));
      }

      if (!response.ok) {
        setError(result.error ?? "Something went wrong. Please try again.");
        setIsTyping(false);
        return;
      }

      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "assistant", content: result.reply, sources: result.sources },
      ]);
    } catch (err) {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col">
      <PageHeader
        title="AI Assistant"
        description="Ask anything about your energy usage — grounded in your real account data"
      />

      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card">
        <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto p-5">
          {loadingHistory ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Loading your conversation...
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isTyping && <TypingIndicator />}
              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        <div className="border-t border-border p-4">
          <SuggestedPrompts onSelect={handleSend} />
        </div>

        <ChatInput onSend={handleSend} disabled={isTyping || loadingHistory} />
      </div>
    </div>
  );
}
