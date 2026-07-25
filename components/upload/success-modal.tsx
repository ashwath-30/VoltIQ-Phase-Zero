"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  billNumber: number;
}

export function UploadSuccessModal({ open, onOpenChange, fileName, billNumber }: SuccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/30">
            <CheckCircle2 className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Bill analyzed successfully</DialogTitle>
          <DialogDescription className="text-center">
            <span className="font-medium text-foreground">{fileName}</span> has been processed.
          </DialogDescription>
        </DialogHeader>

        {/* Differentiation moment: this is where a one-off chatbot upload ends —
            here, it's the start of tracked history and peer benchmarking. */}
        <div className="rounded-lg border border-primary-200 bg-primary-50 p-4 text-sm dark:border-primary-900 dark:bg-primary-900/20">
          <p className="font-medium text-primary-800 dark:text-primary-300">
            This is bill #{billNumber} in your tracked history.
          </p>
          <p className="mt-1 text-primary-700/80 dark:text-primary-400/80">
            Your Energy Health Score, forecast, and peer comparison have all been updated using this
            data — something a single upload to a general AI chat can't do on its own.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Upload another
          </Button>
          <Button asChild>
            <Link href="/dashboard">
              View updated dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
