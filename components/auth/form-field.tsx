"use client";

import { Label } from "@/components/ui/label";
import { Input, InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FormFieldProps extends InputProps {
  label: string;
  errorMessage?: string;
  hint?: string;
}

export function FormField({ label, errorMessage, hint, id, className, ...props }: FormFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={fieldId}>{label}</Label>
      <Input id={fieldId} error={!!errorMessage} className={cn(className)} {...props} />
      {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}
      {!errorMessage && hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
