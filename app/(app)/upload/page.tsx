"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/app-shell/page-header";
import { BillDropzone } from "@/components/upload/dropzone";
import { PdfPreview } from "@/components/upload/pdf-preview";
import { UploadProgress } from "@/components/upload/upload-progress";
import { UploadSuccessModal } from "@/components/upload/success-modal";
import { UploadErrorModal } from "@/components/upload/error-modal";
import { UploadHistoryTable } from "@/components/upload/upload-history-table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { mapDbBillToBill } from "@/lib/bills";
import type { Bill } from "@/types";

type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const [bills, setBills] = useState<Bill[]>([]);
  const [billsLoading, setBillsLoading] = useState(true);

  const loadBills = useCallback(async () => {
    setBillsLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("bills")
      .select("*")
      .order("upload_date", { ascending: false });

    if (!error && data) {
      setBills(data.map(mapDbBillToBill));
    }
    setBillsLoading(false);
  }, []);

  useEffect(() => {
    loadBills();
  }, [loadBills]);

  function handleFileAccepted(newFile: File) {
    setFile(newFile);
    setStatus("idle");
    setProgress(0);
    setErrorMessage(undefined);
  }

  function handleRemove() {
    setFile(null);
    setStatus("idle");
    setProgress(0);
    setErrorMessage(undefined);
  }

  async function startUpload() {
    if (!file) return;
    setStatus("uploading");
    setProgress(0);

    // We can't get real byte-level progress from a simple fetch, so this
    // animates up to 90% while the request is in flight, then snaps to
    // 100% only once we actually get a real response back.
    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + Math.random() * 10 : prev));
    }, 400);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-bill", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        setErrorMessage(result.error ?? "Something went wrong processing this bill.");
        setStatus("error");
        return;
      }

      await loadBills();
      setStatus("success");
    } catch (err) {
      clearInterval(progressInterval);
      setProgress(100);
      setErrorMessage("Couldn't reach the server. Check your connection and try again.");
      setStatus("error");
    }
  }

  function handleRetry() {
    setStatus("idle");
    setProgress(0);
    setErrorMessage(undefined);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        title="Upload Bill"
        description="Add a new utility bill — each upload strengthens your forecast and recommendations"
      />

      {status === "uploading" && file ? (
        <UploadProgress fileName={file.name} progress={Math.min(progress, 100)} />
      ) : file ? (
        <div className="flex flex-col gap-4">
          <PdfPreview file={file} onRemove={handleRemove} />
          <div className="flex justify-end">
            <Button onClick={startUpload}>
              <Sparkles className="h-4 w-4" />
              Analyze Bill
            </Button>
          </div>
        </div>
      ) : (
        <BillDropzone onFileAccepted={handleFileAccepted} />
      )}

      <Card className="border-secondary-200 bg-secondary-50/50 dark:border-secondary-900 dark:bg-secondary-900/10">
        <CardHeader className="flex-row items-center gap-3 space-y-0">
          <Sparkles className="h-4 w-4 shrink-0 text-secondary-600 dark:text-secondary-400" />
          <div>
            <CardTitle className="text-sm">Why upload instead of just asking an AI chatbot?</CardTitle>
            <CardDescription>
              Every bill you upload here is tracked over time — powering your Energy Health Score,
              forecast confidence, and comparisons against similar homes. A single chat conversation
              starts over from zero every time; VoltIQ never does.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold">Upload History</h2>
        <UploadHistoryTable bills={bills} loading={billsLoading} />
      </div>

      {file && (
        <>
          <UploadSuccessModal
            open={status === "success"}
            onOpenChange={(open) => !open && handleRemove()}
            fileName={file.name}
            billNumber={bills.length}
          />
          <UploadErrorModal
            open={status === "error"}
            onOpenChange={(open) => !open && setStatus("idle")}
            onRetry={handleRetry}
            message={errorMessage}
          />
        </>
      )}
    </div>
  );
}
