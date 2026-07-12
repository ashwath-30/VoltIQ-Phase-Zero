"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { AlertCircle, Zap } from "lucide-react";
import { PageHeader } from "@/components/app-shell/page-header";
import { MessageBubble, ChatMessageData } from "@/components/assistant/message-bubble";
import { TypingIndicator } from "@/components/assistant/typing-indicator";
import { SuggestedPrompts } from "@/components/assistant/suggested-prompts";
import { ChatInput } from "@/components/assistant/chat-input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { FREE_TIER_CHAT_LIMIT, startOfCurrentMonthISO } from "@/lib/usage-limits";

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
  const [limitReached, setLimitReached] = useState(false);
  const [userInitials, setUserInitials] = useState("?");
  const [plan, setPlan] = useState<"free" | "pro">("free");
  const [chatsThisMonth, setChatsThisMonth] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadHistory() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const [{ data: profile }, { count }] = await Promise.all([
          supabase.from("profiles").select("name, plan").eq("id", user.id).single(),
          supabase
            .from("chats")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("role", "user")
            .gte("timestamp", startOfCurrentMonthISO()),
        ]);

        const name = profile?.name || user.email || "?";
        setUserInitials(
          name
            .split(" ")
            .map((p: string) => p[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()
        );
        setPlan(profile?.plan === "pro" ? "pro" : "free");
        setChatsThisMonth(count ?? 0);
      }

      const { data } = await supabase
        .from("chats")
        .select("*")
        .order("timestamp", { ascending: true });

      if (data && data.length > 0) {
        setMessages(
          data.map((row: { id: string; role: string; content: string; sources?: string[] }) => ({
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
    setLimitReached(false);

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
        setLimitReached(!!result.limitReached);
        setIsTyping(false);
        return;
      }

      setChatsThisMonth((prev) => prev + 1);
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

  const atLimit = plan === "free" && chatsThisMonth >= FREE_TIER_CHAT_LIMIT;

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col">
      <PageHeader
        title="AI Assistant"
        description="Ask anything about your energy usage — grounded in your real account data"
      />

      {plan === "free" && !loadingHistory && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm">
          <span className={atLimit ? "font-medium text-destructive" : "text-muted-foreground"}>
            {chatsThisMonth} / {FREE_TIER_CHAT_LIMIT} messages used this month
          </span>
          <Button size="sm" variant="ghost" asChild>
            <Link href="/pricing">
              <Zap className="h-3.5 w-3.5" />
              Upgrade
            </Link>
          </Button>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card">
        <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto p-5">
          {loadingHistory ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Loading your conversation...
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} userInitials={userInitials} />
              ))}
              {isTyping && <TypingIndicator />}
              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div className="flex-1">
                    {error}
                    {limitReached && (
                      <Link href="/pricing" className="ml-1 font-medium underline">
                        Upgrade to Pro
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="border-t border-border p-4">
          <SuggestedPrompts onSelect={handleSend} />
        </div>

        <ChatInput onSend={handleSend} disabled={isTyping || loadingHistory || atLimit} />
      </div>
    </div>
  );
}
