"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ToastProvider } from "@/components/ui/toast";
import { AppTopbar } from "@/components/app/app-topbar";
import { AppSidebar } from "@/components/app/app-sidebar";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Lock body scroll while the mobile drawer is open.
  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <AppTopbar onMenuClick={() => setMobileOpen(true)} />

        <div className="flex flex-1">
          {/* Desktop sidebar */}
          <aside
            className={cn(
              "sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 border-r border-border bg-card transition-[width] duration-200 lg:block",
              collapsed ? "w-[4.5rem]" : "w-64"
            )}
          >
            <AppSidebar
              collapsed={collapsed}
              onToggleCollapse={() => setCollapsed((c) => !c)}
            />
          </aside>

          {/* Mobile drawer */}
          {mobileOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in"
                onClick={() => setMobileOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-border bg-card shadow-raised animate-in slide-in-from-left duration-200">
                <div className="flex h-16 items-center justify-between border-b border-border px-4">
                  <Logo />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close navigation menu"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <AppSidebar
                    collapsed={false}
                    showCollapseToggle={false}
                    onNavigate={() => setMobileOpen(false)}
                  />
                </div>
              </div>
            </div>
          )}

          <main className="min-w-0 flex-1">
            <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
