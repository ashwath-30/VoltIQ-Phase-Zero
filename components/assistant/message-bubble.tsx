import ReactMarkdown from "react-markdown";
import { Zap, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { mockUser } from "@/lib/mock-data";

export interface ChatMessageData {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

export function MessageBubble({ message }: { message: ChatMessageData }) {
  const isUser = message.role === "user";
  const initials = mockUser.name
    .split(" ")
    .map((p) => p[0])
    .join("");

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <Avatar className="h-8 w-8 shrink-0">
        {isUser ? (
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        ) : (
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Zap className="h-3.5 w-3.5" />
          </AvatarFallback>
        )}
      </Avatar>

      <div className={cn("flex max-w-[80%] flex-col gap-2", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm",
            isUser
              ? "rounded-tr-sm bg-primary text-primary-foreground"
              : "rounded-tl-sm border border-border bg-card"
          )}
        >
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <div className="prose-chat">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1 last:mb-0">{children}</ul>,
                  li: ({ children }) => <li>{children}</li>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.sources.map((source) => (
              <span
                key={source}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                <FileText className="h-2.5 w-2.5" />
                {source}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
