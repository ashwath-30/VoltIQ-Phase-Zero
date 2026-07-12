"use client";

import { useState } from "react";
import { Mail, MessageSquare, CheckCircle2 } from "lucide-react";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/auth/form-field";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <>
      <MarketingNavbar />
      <main className="px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mx-auto max-w-xl text-center">
            <h1 className="font-display text-4xl font-bold tracking-tight">Get in touch</h1>
            <p className="mt-4 text-muted-foreground">
              Questions about your bill, a bug to report, or just curious about VoltIQX — we read every
              message.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-5">
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
                <CardDescription>We typically reply within 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                {sent ? (
                  <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/30">
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    </div>
                    <p className="font-display text-base font-semibold">Message sent</p>
                    <p className="max-w-xs text-sm text-muted-foreground">
                      Thanks for reaching out — we'll get back to you soon.
                    </p>
                  </div>
                ) : (
                  <form
                    className="flex flex-col gap-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      setSent(true);
                    }}
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField label="Name" placeholder="Jordan Reyes" required />
                      <FormField label="Email" type="email" placeholder="you@example.com" required />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="message">Message</Label>
                      <textarea
                        id="message"
                        required
                        rows={5}
                        placeholder="How can we help?"
                        className="resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                    <Button type="submit" className="sm:w-auto">
                      Send message
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col gap-4 md:col-span-2">
              <Card>
                <CardContent className="flex items-start gap-3 pt-6">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/30">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">support@voltiqx.app</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-start gap-3 pt-6">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/30">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">In-app support</p>
                    <p className="text-sm text-muted-foreground">
                      Already a user? Reach us faster from Settings → Support.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
