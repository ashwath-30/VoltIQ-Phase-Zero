"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { navItems } from "@/components/app/nav-config";
import { useToast } from "@/components/ui/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  collapsed: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
  /** Hide the desktop collapse control (used inside the mobile drawer). */
  showCollapseToggle?: boolean;
}

export function AppSidebar({
  collapsed,
  onToggleCollapse,
  onNavigate,
  showCollapseToggle = true,
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  function handleLogout() {
    toast({
      title: "Signed out",
      description: "You have been signed out of VoltIQ.",
      variant: "info",
    });
    onNavigate?.();
    router.push("/login");
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-full flex-col gap-1 py-4">
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {navItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const link = (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  collapsed && "justify-center px-0",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }
            return link;
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-1 border-t border-border px-3 pt-3">
          {showCollapseToggle && onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={cn(
                "hidden items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:flex",
                collapsed && "justify-center px-0"
              )}
            >
              {collapsed ? (
                <PanelLeftOpen className="h-5 w-5 shrink-0" />
              ) : (
                <>
                  <PanelLeftClose className="h-5 w-5 shrink-0" />
                  <span>Collapse</span>
                </>
              )}
            </button>
          )}

          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Log out"
                  className="flex items-center justify-center rounded-lg px-0 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                >
                  <LogOut className="h-5 w-5 shrink-0" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Log out</TooltipContent>
            </Tooltip>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              <span>Log out</span>
            </button>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
