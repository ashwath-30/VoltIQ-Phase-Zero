import { Construction } from "lucide-react";

export function ComingSoon({ phase }: { phase: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-24 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Construction className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="font-display text-base font-semibold">Coming in {phase}</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        This page is wired into navigation now — the real content lands when we build {phase}.
      </p>
    </div>
  );
}
