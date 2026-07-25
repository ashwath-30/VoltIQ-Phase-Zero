"use client";

import { ReactNode } from "react";
import { ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  description?: string;
  height?: number;
  className?: string;
  action?: ReactNode;
  onDownload?: () => void;
  children: React.ReactElement;
}

/**
 * Generic wrapper every chart in the app renders through.
 * Keeps header layout, sizing, and export affordances consistent
 * so charts don't get re-implemented per page.
 */
export function ChartCard({
  title,
  description,
  height = 280,
  className,
  action,
  onDownload,
  children,
}: ChartCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <div className="flex items-center gap-1">
          {action}
          {onDownload && (
            <Button variant="ghost" size="icon" onClick={onDownload} aria-label={`Download ${title}`}>
              <Download className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" aria-label="More options">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ width: "100%", height }}>
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Shared chart color tokens so every chart pulls from the same palette
export const chartColors = {
  primary: "#10B981",
  primaryLight: "#6EE7B7",
  secondary: "#3B82F6",
  secondaryLight: "#93C5FD",
  warning: "#F59E0B",
  muted: "#94A3B8",
  grid: "hsl(var(--border))",
};
