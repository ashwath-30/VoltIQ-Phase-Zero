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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/states";
import { Sparkles, Zap, UserCog } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { mapDbBillToBill } from "@/lib/bills";
import { FREE_TIER_UPLOAD_LIMIT, startOfCurrentMonthISO } from "@/lib/usage-limits";
import Link from "next/link";
import type { Bill } from "@/types";

type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [limitReached, setLimitReached] = useState(false);

  const [bills, setBills] = useState<Bill[]>([]);
  const [billsLoading, setBillsLoading] = useState(true);
  const [plan, setPlan] = useState<"free" | "pro">("free");
  const [uploadsThisMonth, setUploadsThisMonth] = useState(0);
  const [profileComplete, setProfileComplete] = useState(true);

  const loadBills = useCallback(async () => {
    setBillsLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const [{ data, error }, { data: profile }, { count }] = await Promise.all([
      supabase.from("bills").select("*").order("upload_date", { ascending: false }),
      supabase.from("profiles").select("plan, home_size, occupants").eq("id", user.id).single(),
      supabase
        .from("bills")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("upload_date", startOfCurrentMonthISO()),
    ]);

    if (!error && data) {
      setBills(data.map(mapDbBillToBill));
    }
    setPlan(profile?.plan === "pro" ? "pro" : "free");
    setUploadsThisMonth(count ?? 0);
    setProfileComplete(!!profile?.home_size && !!profile?.occupants);
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
    setLimitReached(false);
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
        setLimitReached(!!result.limitReached);
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
    setLimitReached(false);
  }

  const atLimit = plan === "free" && uploadsThisMonth >= FREE_TIER_UPLOAD_LIMIT;
  const isFirstUpload = bills.length === 0;
  const blockedByIncompleteProfile = !billsLoading && isFirstUpload && !profileComplete;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        title="Upload Bill"
        description="Add a new utility bill — each upload strengthens your forecast and recommendations"
      />

      {plan === "free" && !billsLoading && (
        <Card className={atLimit ? "border-destructive/30 bg-destructive/5" : undefined}>
          <CardContent className="flex flex-col items-start justify-between gap-3 pt-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium">
                {uploadsThisMonth} / {FREE_TIER_UPLOAD_LIMIT} uploads used this month
              </p>
              <p className="text-xs text-muted-foreground">
                {atLimit ? "You've reached your free monthly limit." : "Free plan resets on the 1st of each month."}
              </p>
            </div>
            <Button size="sm" variant={atLimit ? "default" : "outline"} asChild>
              <Link href="/upgrade">
                <Zap className="h-3.5 w-3.5" />
                Upgrade to Pro
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {blockedByIncompleteProfile ? (
        <Card className="border-primary-200 dark:border-primary-900">
          <CardContent className="pt-6">
            <EmptyState
              icon={UserCog}
              title="Complete your profile before your first upload"
              description="Your home size and occupant count help VoltIQX calculate an accurate forecast, Energy Health Score, and comparison to similar homes right from your very first bill — instead of guessing and correcting later."
              action={{
                label: "Complete your profile",
                onClick: () => {
                  window.location.href = "/profile";
                },
              }}
            />
          </CardContent>
        </Card>
      ) : atLimit ? (
        <EmptyState
          icon={Zap}
          title="Monthly upload limit reached"
          description={`You've used all ${FREE_TIER_UPLOAD_LIMIT} free uploads this month. Upgrade to Pro for unlimited uploads, or wait until next month for your limit to reset.`}
        />
      ) : status === "uploading" && file ? (
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
              starts over from zero every time; VoltIQX never does.
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
            limitReached={limitReached}
          />
        </>
      )}
    </div>
  );
}
