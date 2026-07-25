"use client";

import { formatDistanceToNow } from "date-fns";
import { Zap, TrendingUp, Wind, Sun, Car, Bell, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { NotificationItem } from "@/types";

const typeIcon = {
  usage: Zap,
  forecast: TrendingUp,
  hvac: Wind,
  solar: Sun,
  ev: Car,
  system: Bell,
} as const;

const severityStyles = {
  info: "bg-secondary-50 text-secondary-600 dark:bg-secondary-900/30 dark:text-secondary-400",
  warning: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  critical: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400",
} as const;

interface NotificationRowProps {
  notification: NotificationItem;
  onMarkRead: (id: string) => void;
}

export function NotificationRow({ notification, onMarkRead }: NotificationRowProps) {
  const Icon = typeIcon[notification.type];

  return (
    <div
      className={cn(
        "flex items-start gap-4 border-b border-border p-4 last:border-0",
        !notification.read && "bg-primary-50/40 dark:bg-primary-900/10"
      )}
    >
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", severityStyles[notification.severity])}>
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{notification.title}</p>
          {!notification.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">{notification.description}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
        </p>
      </div>

      {!notification.read && (
        <Button variant="ghost" size="sm" onClick={() => onMarkRead(notification.id)} className="shrink-0">
          <Check className="h-3.5 w-3.5" />
          Mark read
        </Button>
      )}
    </div>
  );
}
