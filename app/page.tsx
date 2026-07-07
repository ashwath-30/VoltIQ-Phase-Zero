import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

// Temporary placeholder — Phase 1 replaces this with the real landing page.
// Kept here so `npm run dev` renders something and you can sanity-check
// the design system (colors, type, dark mode) before building further.
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="flex items-center gap-2 text-primary">
        <Zap className="h-6 w-6" />
        <span className="font-display text-xl font-bold">VoltIQ</span>
      </div>
      <p className="text-sm text-muted-foreground">
        Phase 0 foundation is live. Design tokens, primitives, and mock data are wired up.
      </p>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Design system check</CardTitle>
          <CardDescription>Buttons, cards, and badges pulling from tokens</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Badge variant="success">Processed</Badge>
          <Badge variant="warning">Pending</Badge>
        </CardContent>
      </Card>
    </main>
  );
}
