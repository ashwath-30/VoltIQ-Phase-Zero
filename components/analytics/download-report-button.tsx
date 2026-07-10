"use client";

import { useState } from "react";
import { Download, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DownloadReportButton() {
  const [state, setState] = useState<"idle" | "generating" | "done">("idle");

  function handleClick() {
    setState("generating");
    setTimeout(() => {
      setState("done");
      setTimeout(() => setState("idle"), 2000);
    }, 1400);
  }

  return (
    <Button variant="outline" onClick={handleClick} disabled={state === "generating"}>
      {state === "generating" ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating report...
        </>
      ) : state === "done" ? (
        <>
          <Check className="h-4 w-4 text-primary" />
          Report ready
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Download report
        </>
      )}
    </Button>
  );
}
