"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./globals.css";

// Next.js requires this file to render its own <html>/<body> tags, since
// it replaces the root layout entirely when something crashes badly
// enough that even the normal layout can't render.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production this is where you'd forward to an error-tracking
    // service (Sentry, etc.) — logged here for now so it's at least
    // visible in your deployment logs.
    console.error("Global error boundary caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <h1 className="font-display text-2xl font-bold">Something went wrong</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            This wasn't your fault — an unexpected error occurred. Your data is safe; try reloading the
            page.
          </p>
          <Button onClick={() => reset()}>
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        </div>
      </body>
    </html>
  );
}
