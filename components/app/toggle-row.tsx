"use client";

import { type LucideIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface ToggleRowProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  icon?: LucideIcon;
  className?: string;
}

/**
 * Label + description + switch row, shared by the Profile energy-assets
 * section and the Settings notification/privacy sections.
 */
export function ToggleRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  icon: Icon,
  className,
}: ToggleRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-lg border border-border bg-background p-4",
        className
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Icon className="h-4.5 w-4.5" />
          </span>
        )}
        <div className="min-w-0 space-y-0.5">
          <label htmlFor={id} className="block text-sm font-medium text-foreground">
            {label}
          </label>
          {description && (
            <p className="text-sm text-muted-foreground text-pretty">{description}</p>
          )}
        </div>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
