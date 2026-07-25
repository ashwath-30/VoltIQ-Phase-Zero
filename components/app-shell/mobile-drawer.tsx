"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { primaryNavItems, secondaryNavItems, logoutNavItem } from "./nav-items";
import { signOutAndRedirect } from "@/lib/supabase/sign-out";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const pathname = usePathname();
  const router = useRouter();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-card shadow-raised">
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-display text-lg font-bold">VoltIQX</span>
          </Link>
          <button onClick={onClose} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {[...primaryNavItems, ...secondaryNavItems].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                pathname === item.href
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          <div className="my-2 border-t border-border" />
          <button
            onClick={async () => {
              onClose();
              await signOutAndRedirect(router);
            }}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <logoutNavItem.icon className="h-4 w-4" />
            {logoutNavItem.label}
          </button>
        </nav>
      </div>
    </div>
  );
}
