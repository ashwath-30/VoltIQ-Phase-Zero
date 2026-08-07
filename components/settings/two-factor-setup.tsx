"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Loader2, Check, AlertCircle, KeyRound, Copy } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type Step = "loading" | "disabled" | "enrolling" | "enabled";

export function TwoFactorSetup() {
  const [step, setStep] = useState<Step>("loading");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [backupCodesLoading, setBackupCodesLoading] = useState(false);

  useEffect(() => {
    async function checkExisting() {
      const supabase = createClient();
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) {
        setError(error.message);
        setStep("disabled");
        return;
      }
      const verifiedTotp = data.totp.find((f) => f.status === "verified");
      if (verifiedTotp) {
        setFactorId(verifiedTotp.id);
        setStep("enabled");
      } else {
        setStep("disabled");
      }
    }
    checkExisting();
  }, []);

  async function handleStartEnroll() {
    setError(null);
    setBusy(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", issuer: "VoltIQX" });
    setBusy(false);

    if (error) {
      setError(error.message);
      return;
    }

    setFactorId(data.id);
    setQrCode(data.totp.qr_code);
    setSecret(data.totp.secret);
    setStep("enrolling");
  }

  async function handleVerify() {
    if (!factorId) return;
    setError(null);
    setBusy(true);
    const supabase = createClient();

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) {
      setBusy(false);
      setError(challengeError.message);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: verifyCode.trim(),
    });
    setBusy(false);

    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    setQrCode(null);
    setSecret(null);
    setVerifyCode("");
    setStep("enabled");
  }

  async function handleDisable() {
    if (!factorId) return;
    setError(null);
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    setBusy(false);

    if (error) {
      setError(error.message);
      return;
    }

    setFactorId(null);
    setBackupCodes(null);
    setStep("disabled");
  }

  function handleCancelEnroll() {
    setQrCode(null);
    setSecret(null);
    setVerifyCode("");
    setError(null);
    setStep("disabled");
  }

  async function handleGenerateBackupCodes() {
    setError(null);
    setBackupCodesLoading(true);
    const response = await fetch("/api/backup-codes/generate", { method: "POST" });
    const data = await response.json();
    setBackupCodesLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Couldn't generate backup codes.");
      return;
    }

    setBackupCodes(data.codes);
  }

  function handleCopyBackupCodes() {
    if (!backupCodes) return;
    navigator.clipboard.writeText(backupCodes.join("\n"));
  }

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <div>
          <CardTitle className="text-base">Two-factor authentication</CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {step === "loading" && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking your current setup...
          </p>
        )}

        {step === "disabled" && (
          <>
            <p className="text-sm text-muted-foreground">
              Not currently enabled. Enabling it requires a code from your authenticator app every time you
              log in.
            </p>
            <div>
              <Button onClick={handleStartEnroll} disabled={busy}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Enable 2FA
              </Button>
            </div>
          </>
        )}

        {step === "enrolling" && qrCode && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Scan this with an authenticator app (Google Authenticator, Authy, 1Password, etc.):
            </p>
            <img
              src={qrCode}
              alt="Two-factor authentication QR code"
              className="h-48 w-48 self-center rounded-lg border border-border bg-white p-2"
            />
            {secret && (
              <p className="text-center text-xs text-muted-foreground">
                Can't scan it? Enter this code manually: <span className="font-mono">{secret}</span>
              </p>
            )}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mfa-code">Enter the 6-digit code from your app</Label>
              <Input
                id="mfa-code"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
                inputMode="numeric"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleVerify} disabled={busy || verifyCode.trim().length !== 6}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Verify and enable
              </Button>
              <Button variant="outline" onClick={handleCancelEnroll} disabled={busy}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {step === "enabled" && (
          <>
            <p className="flex items-center gap-2 text-sm text-primary">
              <Check className="h-4 w-4" />
              Two-factor authentication is enabled.
            </p>

            {!backupCodes ? (
              <div className="rounded-lg border border-border p-3">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <KeyRound className="h-4 w-4 text-muted-foreground" />
                  Backup codes
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Generate one-time codes in case you lose access to your authenticator app. Generating a new
                  set replaces any previous one.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={handleGenerateBackupCodes}
                  disabled={backupCodesLoading}
                >
                  {backupCodesLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Generate backup codes
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border border-primary/30 bg-primary-50 p-3 dark:bg-primary-900/20">
                <p className="text-sm font-medium text-foreground">
                  Save these now — you won't be able to see them again.
                </p>
                <div className="mt-2 grid grid-cols-2 gap-1.5 font-mono text-xs">
                  {backupCodes.map((code) => (
                    <span key={code} className="rounded bg-background px-2 py-1">
                      {code}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleCopyBackupCodes}>
                    <Copy className="h-3.5 w-3.5" />
                    Copy all
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setBackupCodes(null)}>
                    Done
                  </Button>
                </div>
              </div>
            )}

            <div>
              <Button variant="outline" onClick={handleDisable} disabled={busy}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Disable 2FA
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
