import { type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";

interface PlaceholderPageProps {
  title: string;
  description: string;
  phase: number;
  icon: LucideIcon;
  summary: string;
  upcoming: string[];
}

/**
 * Shared shell for routes whose full experience arrives in a later phase.
 * Gives every sidebar link a real destination with a page title and a
 * clear "Coming in Phase X" note instead of a 404.
 */
export function PlaceholderPage({
  title,
  description,
  phase,
  icon: Icon,
  summary,
  upcoming,
}: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />

      <div className="flex flex-col items-center justify-center gap-5 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-glow">
          <Icon className="h-7 w-7" />
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          Coming in Phase {phase}
        </Badge>
        <div className="max-w-md space-y-2">
          <p className="font-display text-lg font-semibold text-foreground text-balance">
            {title} is on the way
          </p>
          <p className="text-sm text-muted-foreground text-pretty">{summary}</p>
        </div>

        <ul className="mx-auto grid w-full max-w-md gap-2 text-left">
          {upcoming.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2.5 rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-muted-foreground shadow-soft"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
