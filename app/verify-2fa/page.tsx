"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { signOutAndRedirect } from "@/lib/supabase/sign-out";

/**
 * Shown after a correct password when the account has 2FA enabled but
 * the session hasn't completed the second factor yet (assurance level
 * aal1, needs aal2). Completing this upgrades the session to aal2,
 * which is what middleware checks before allowing access to any
 * protected page — this page itself doesn't grant access, the
 * middleware check does, based on the session Supabase issues here.
 */
export default function Verify2faPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkIfNeeded() {
      const supabase = createClient();
      const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (error) {
        setError(error.message);
        setChecking(false);
        return;
      }

      // Already fully verified, or this account doesn't have 2FA at
      // all — nothing to do here, send them where they were headed.
      if (!data.nextLevel || data.currentLevel === data.nextLevel) {
        router.push("/dashboard");
        return;
      }

      setChecking(false);
    }
    checkIfNeeded();
  }, [router]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const supabase = createClient();
    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
    if (factorsError) {
      setSubmitting(false);
      setError(factorsError.message);
      return;
    }

    const factor = factors.totp.find((f) => f.status === "verified");
    if (!factor) {
      setSubmitting(false);
      setError("No verified authenticator found on this account.");
      return;
    }

    // A fresh challenge each attempt — simpler and more robust than
    // trying to reuse one that may have expired between page load and
    // the user actually typing their code.
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: factor.id,
    });
    if (challengeError) {
      setSubmitting(false);
      setError(challengeError.message);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: factor.id,
      challengeId: challenge.id,
      code: code.trim(),
    });
    setSubmitting(false);

    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (checking) {
    return (
      <AuthCard title="Verifying..." description="One moment">
        <div className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Two-factor verification" description="Enter the code from your authenticator app">
      <form onSubmit={handleVerify} className="flex flex-col gap-4">
        <div className="flex justify-center py-2">
          <ShieldCheck className="h-10 w-10 text-primary" />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="verify-code">6-digit code</Label>
          <Input
            id="verify-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            maxLength={6}
            inputMode="numeric"
            autoFocus
          />
        </div>

        <Button type="submit" disabled={submitting || code.trim().length !== 6}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify"
          )}
        </Button>

        <button
          type="button"
          onClick={() => signOutAndRedirect(router)}
          className="text-center text-sm text-muted-foreground hover:underline"
        >
          Not you? Sign out
        </button>
      </form>
    </AuthCard>
  );
}
