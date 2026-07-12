"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ErrorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRetry: () => void;
  message?: string;
  limitReached?: boolean;
}

export function UploadErrorModal({ open, onOpenChange, onRetry, message, limitReached }: ErrorModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <DialogTitle className="text-center">
            {limitReached ? "Monthly upload limit reached" : "We couldn't process that bill"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {message ??
              "The file may be corrupted, password-protected, or in a format we couldn't read. Your other uploads and history are unaffected."}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {limitReached ? (
            <Button asChild>
              <Link href="/pricing">
                <Zap className="h-4 w-4" />
                Upgrade to Pro
              </Link>
            </Button>
          ) : (
            <Button
              onClick={() => {
                onRetry();
                onOpenChange(false);
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
