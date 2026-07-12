import Link from "next/link";
import { Bell, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states";
import { cn } from "@/lib/utils";
import type { NotificationItem } from "@/types";

const severityDot = {
  info: "bg-secondary-500",
  warning: "bg-amber-500",
  critical: "bg-destructive",
} as const;

export function NotificationsWidget({ notifications }: { notifications: NotificationItem[] }) {
  const unread = notifications.filter((n) => !n.read).slice(0, 3);
  const items = unread.length > 0 ? unread : notifications.slice(0, 3);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <div>
            <CardTitle className="text-base">Noticed without asking</CardTitle>
            <CardDescription>VoltIQX flagged these on its own</CardDescription>
          </div>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/notifications">
            All
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {items.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Nothing to flag yet"
            description="Upload a bill or two and VoltIQX will surface anything worth knowing about."
          />
        ) : (
          items.map((n) => (
            <div key={n.id} className="flex items-start gap-3">
              <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", severityDot[n.severity])} />
              <div>
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.description}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
