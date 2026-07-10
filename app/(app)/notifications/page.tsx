"use client";

import { useState, useMemo, useEffect } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { PageHeader } from "@/components/app-shell/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { NotificationRow } from "@/components/notifications/notification-row";
import { EmptyState, TableSkeleton } from "@/components/states";
import { createClient } from "@/lib/supabase/client";
import type { NotificationItem } from "@/types";

function mapRow(row: Record<string, any>): NotificationItem {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    description: row.description,
    timestamp: row.timestamp,
    read: row.read,
    severity: row.severity,
  };
}

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .order("timestamp", { ascending: false });
      setItems((data ?? []).map(mapRow));
      setLoading(false);
    }
    load();
  }, []);

  const unreadCount = items.filter((n) => !n.read).length;

  const filtered = useMemo(
    () => (filter === "unread" ? items.filter((n) => !n.read) : items),
    [items, filter]
  );

  async function markRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    const supabase = createClient();
    await supabase.from("notifications").update({ read: true }).eq("id", id);
  }

  async function markAllRead() {
    const unreadIds = items.filter((n) => !n.read).map((n) => n.id);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    const supabase = createClient();
    await supabase.from("notifications").update({ read: true }).in("id", unreadIds);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        title="Notifications"
        description="Flagged automatically from your usage — you didn't have to ask"
        action={
          unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )
        }
      />

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All ({items.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4">
              <TableSkeleton rows={3} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Bell}
                title={filter === "unread" ? "You're all caught up" : "No notifications yet"}
                description={
                  filter === "unread"
                    ? "No unread notifications right now — check back after your next bill upload."
                    : "VoltIQ checks every bill you upload against your history and flags anything worth knowing about — nothing to show yet."
                }
              />
            </div>
          ) : (
            <div className="flex flex-col">
              {filtered.map((notification) => (
                <NotificationRow key={notification.id} notification={notification} onMarkRead={markRead} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
