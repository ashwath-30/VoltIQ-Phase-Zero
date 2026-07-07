"use client";

import * as React from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

interface ToastData {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (t: { title: string; description?: string; variant?: ToastVariant }) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}

const variantConfig: Record<
  ToastVariant,
  { icon: typeof Info; iconClass: string }
> = {
  success: { icon: CheckCircle2, iconClass: "text-primary" },
  error: { icon: AlertTriangle, iconClass: "text-destructive" },
  info: { icon: Info, iconClass: "text-secondary" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  const remove = React.useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback<ToastContextValue["toast"]>(
    ({ title, description, variant = "success" }) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, title, description, variant }]);
      window.setTimeout(() => remove(id), 4000);
    },
    [remove]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2.5 px-4 sm:px-0"
      >
        {toasts.map((t) => {
          const { icon: Icon, iconClass } = variantConfig[t.variant];
          return (
            <div
              key={t.id}
              role="status"
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-raised",
                "animate-in slide-in-from-bottom-3 fade-in duration-300"
              )}
            >
              <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", iconClass)} />
              <div className="flex-1 space-y-0.5">
                <p className="text-sm font-semibold text-foreground">{t.title}</p>
                {t.description && (
                  <p className="text-sm text-muted-foreground">{t.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => remove(t.id)}
                aria-label="Dismiss notification"
                className="shrink-0 rounded-md text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
