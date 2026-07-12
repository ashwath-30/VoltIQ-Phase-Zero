"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/app-shell/page-header";
import { SaveButton } from "@/components/app-shell/save-button";
import { FormField } from "@/components/auth/form-field";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states";
import { Monitor, Smartphone, Plug2, LifeBuoy, ShieldCheck, Zap, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { FREE_TIER_UPLOAD_LIMIT, FREE_TIER_CHAT_LIMIT, startOfCurrentMonthISO } from "@/lib/usage-limits";

const notificationPrefs = [
  { label: "High usage alerts", description: "Notify me when usage spikes above normal" },
  { label: "Forecasted bill changes", description: "Notify me when next month's forecast changes significantly" },
  { label: "HVAC & appliance alerts", description: "Notify me about possible equipment issues" },
  { label: "New recommendations", description: "Notify me when a new savings tip is available" },
  { label: "Product updates", description: "Occasional emails about new VoltIQX features" },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [plan, setPlan] = useState<"free" | "pro">("free");
  const [uploadsUsed, setUploadsUsed] = useState(0);
  const [chatsUsed, setChatsUsed] = useState(0);
  const [billingLoading, setBillingLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function loadBilling() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: profile }, { count: uploadCount }, { count: chatCount }] = await Promise.all([
        supabase.from("profiles").select("plan").eq("id", user.id).single(),
        supabase
          .from("bills")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("upload_date", startOfCurrentMonthISO()),
        supabase
          .from("chats")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("role", "user")
          .gte("timestamp", startOfCurrentMonthISO()),
      ]);

      setPlan(profile?.plan === "pro" ? "pro" : "free");
      setUploadsUsed(uploadCount ?? 0);
      setChatsUsed(chatCount ?? 0);
      setBillingLoading(false);
    }
    loadBilling();
  }, []);

  async function handleUpgrade() {
    setActionLoading(true);
    const response = await fetch("/api/stripe/create-checkout-session", { method: "POST" });
    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setActionLoading(false);
    }
  }

  async function handleManageBilling() {
    setActionLoading(true);
    const response = await fetch("/api/stripe/create-portal-session", { method: "POST" });
    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setActionLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Settings" description="Manage your account, preferences, and integrations" />

      <Tabs defaultValue="appearance">
        <TabsList className="flex-wrap">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        {/* Appearance */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Choose how VoltIQX looks on your device</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row">
              <ThemeOption
                icon={Monitor}
                label="Light"
                active={theme === "light"}
                onClick={() => setTheme("light")}
              />
              <ThemeOption
                icon={Smartphone}
                label="Dark"
                active={theme === "dark"}
                onClick={() => setTheme("dark")}
              />
              <ThemeOption
                icon={Monitor}
                label="System"
                active={theme === "system"}
                onClick={() => setTheme("system")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification preferences</CardTitle>
              <CardDescription>Choose what you want to be notified about</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-border">
              {notificationPrefs.map((pref) => (
                <div key={pref.label} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{pref.label}</p>
                    <p className="text-xs text-muted-foreground">{pref.description}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="mt-4">
            <SaveButton />
          </div>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change password</CardTitle>
              <CardDescription>Choose a strong password you don't use elsewhere</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <FormField label="Current password" type="password" placeholder="••••••••" />
              <FormField label="New password" type="password" placeholder="••••••••" hint="At least 8 characters" />
              <FormField label="Confirm new password" type="password" placeholder="••••••••" />
              <div>
                <SaveButton label="Update password" />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base">Two-factor authentication</CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm">
                Enable 2FA
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Connected Devices */}
        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle>Connected devices</CardTitle>
              <CardDescription>Smart meters and home devices linked to VoltIQX</CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={Plug2}
                title="No devices connected yet"
                description="Connect a smart meter or compatible home device to get real-time usage data instead of relying on monthly bills."
                action={{ label: "Connect a device", onClick: () => {} }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Integrations */}
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>API integrations</CardTitle>
              <CardDescription>Connect third-party services to VoltIQX</CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={Plug2}
                title="No integrations set up"
                description="API integrations will appear here once available — this is reserved for future backend connections."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Billing</CardTitle>
                <CardDescription>Manage your VoltIQX subscription</CardDescription>
              </div>
              {!billingLoading && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                    plan === "pro"
                      ? "bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {plan === "pro" && <Zap className="h-3 w-3" />}
                  {plan === "pro" ? "Pro" : "Free"} plan
                </span>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {billingLoading ? (
                <p className="text-sm text-muted-foreground">Loading your plan...</p>
              ) : plan === "pro" ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    You're on the Pro plan — unlimited uploads and unlimited AI Assistant access, $5/month.
                  </p>
                  <div>
                    <Button variant="outline" size="sm" onClick={handleManageBilling} disabled={actionLoading}>
                      {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Manage subscription
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <UsageBar label="Bill uploads" used={uploadsUsed} limit={FREE_TIER_UPLOAD_LIMIT} />
                    <UsageBar label="AI Assistant messages" used={chatsUsed} limit={FREE_TIER_CHAT_LIMIT} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You're on the Free plan. Upgrade to Pro for unlimited uploads and unlimited AI Assistant
                    access — $5/month, cancel anytime.
                  </p>
                  <div>
                    <Button size="sm" onClick={handleUpgrade} disabled={actionLoading}>
                      {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                      Upgrade to Pro — $5/mo
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support */}
        <TabsContent value="support">
          <Card>
            <CardHeader>
              <CardTitle>Support</CardTitle>
              <CardDescription>Get help with your account or a bill</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-start gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <LifeBuoy className="h-4 w-4" />
                Email us anytime and we'll get back to you within 24 hours
              </div>
              <Button variant="outline" size="sm">
                Contact support
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy</CardTitle>
              <CardDescription>Control your data</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                You can request a copy of your data or permanently delete your VoltIQX account at any time.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button variant="outline" size="sm">
                  Download my data
                </Button>
                <Button variant="destructive" size="sm">
                  Delete account
                </Button>
              </div>
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Read our full Privacy Policy →
              </a>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const percent = Math.min(100, Math.round((used / limit) * 100));
  const isNearLimit = used >= limit;

  return (
    <div className="flex-1 rounded-lg border border-border p-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className={isNearLimit ? "text-destructive" : "text-muted-foreground"}>
          {used} / {limit}
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${isNearLimit ? "bg-destructive" : "bg-primary"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function ThemeOption({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 flex-col items-center gap-2 rounded-xl border p-4 transition-colors ${
        active ? "border-primary bg-primary-50 dark:bg-primary-900/20" : "border-border hover:bg-muted"
      }`}
    >
      <Icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
