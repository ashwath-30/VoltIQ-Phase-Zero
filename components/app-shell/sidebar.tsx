"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronsLeft, ChevronsRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { primaryNavItems, secondaryNavItems, logoutNavItem } from "./nav-items";
import { signOutAndRedirect } from "@/lib/supabase/sign-out";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ collapsed, onToggle, className, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-card transition-[width] duration-200",
        collapsed ? "w-[72px]" : "w-64",
        className
      )}
    >
      <div className={cn("flex h-16 items-center border-b border-border px-4", collapsed && "justify-center px-0")}>
        <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
          <Zap className="h-5 w-5 shrink-0 text-primary" />
          {!collapsed && <span className="font-display text-lg font-bold">VoltIQ</span>}
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {primaryNavItems.map((item) => (
          <SidebarLink key={item.href} item={item} collapsed={collapsed} active={pathname === item.href} onNavigate={onNavigate} />
        ))}

        <div className="my-2 border-t border-border" />

        {secondaryNavItems.map((item) => (
          <SidebarLink key={item.href} item={item} collapsed={collapsed} active={pathname === item.href} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <button
          onClick={async () => {
            onNavigate?.();
            await signOutAndRedirect(router);
          }}
          title={collapsed ? logoutNavItem.label : undefined}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive",
            collapsed && "justify-center px-0"
          )}
        >
          <logoutNavItem.icon className="h-4 w-4 shrink-0" />
          {!collapsed && logoutNavItem.label}
        </button>
      </div>

      <button
        onClick={onToggle}
        className="hidden items-center justify-center gap-2 border-t border-border py-3 text-xs text-muted-foreground hover:bg-muted md:flex"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        {!collapsed && "Collapse"}
      </button>
    </aside>
  );
}

function SidebarLink({
  item,
  collapsed,
  active,
  destructive,
  onNavigate,
}: {
  item: { label: string; href: string; icon: React.ElementType };
  collapsed: boolean;
  active: boolean;
  destructive?: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        collapsed && "justify-center px-0",
        active
          ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
          : destructive
          ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && item.label}
    </Link>
  );
}
