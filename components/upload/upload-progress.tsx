"use client";

import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

interface UploadProgressProps {
  fileName: string;
  progress: number;
}

export function UploadProgress({ fileName, progress }: UploadProgressProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-6">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Analyzing {fileName}...
        </div>
        <Progress value={progress} />
        <p className="text-xs text-muted-foreground">
          {progress < 40
            ? "Extracting usage and cost data..."
            : progress < 75
            ? "Comparing against your usage history..."
            : "Updating your forecast and recommendations..."}
        </p>
      </CardContent>
    </Card>
  );
}
