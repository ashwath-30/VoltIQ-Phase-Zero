"use client";

import { useCallback, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { UploadCloud, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

interface DropzoneProps {
  onFileAccepted: (file: File) => void;
}

export function BillDropzone({ onFileAccepted }: DropzoneProps) {
  const [rejectionError, setRejectionError] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], rejections: FileRejection[]) => {
      setRejectionError(null);
      if (rejections.length > 0) {
        const reason = rejections[0].errors[0];
        if (reason.code === "file-invalid-type") {
          setRejectionError("Only PDF files are supported. Please upload your bill as a PDF.");
        } else if (reason.code === "file-too-large") {
          setRejectionError("That file is too large — VoltIQ accepts PDFs up to 10MB.");
        } else {
          setRejectionError("That file couldn't be accepted. Please try a different PDF.");
        }
        return;
      }
      if (accepted[0]) onFileAccepted(accepted[0]);
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxSize: MAX_SIZE_BYTES,
    multiple: false,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-16 text-center transition-colors",
          isDragActive ? "border-primary bg-primary-50 dark:bg-primary-900/20" : "border-border hover:bg-muted/40",
          rejectionError && "border-destructive/40 bg-destructive/5"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/30">
          <UploadCloud className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="font-display text-base font-semibold">
            {isDragActive ? "Drop your bill here" : "Drag & drop your utility bill"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">or click to browse — PDF only, up to 10MB</p>
        </div>
      </div>

      {rejectionError && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {rejectionError}
        </div>
      )}
    </div>
  );
}
