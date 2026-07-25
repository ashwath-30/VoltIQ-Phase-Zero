"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SaveButton({ label = "Save changes" }: { label?: string }) {
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <Button
        type="submit"
        onClick={() => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        }}
      >
        {label}
      </Button>
      {saved && (
        <span className="flex items-center gap-1 text-sm text-primary">
          <Check className="h-4 w-4" />
          Saved
        </span>
      )}
    </div>
  );
}
