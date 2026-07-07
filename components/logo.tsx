import Link from "next/link";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 text-foreground", className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-glow">
        <Zap className="h-5 w-5" fill="currentColor" />
      </span>
      <span className="font-display text-xl font-bold tracking-tight">VoltIQ</span>
    </Link>
  );
}
