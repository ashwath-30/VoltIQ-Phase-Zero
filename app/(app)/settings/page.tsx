"use client";

import { useTheme } from "next-themes";
import { PageHeader } from "@/components/app-shell/page-header";
import { SaveButton } from "@/components/app-shell/save-button";
import { FormField } from "@/components/auth/form-field";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states";
import { Monitor, Smartphone, Plug2, CreditCard, LifeBuoy, ShieldCheck } from "lucide-react";

const notificationPrefs = [
  { label: "High usage alerts", description: "Notify me when usage spikes above normal" },
  { label: "Forecasted bill changes", description: "Notify me when next month's forecast changes significantly" },
  { label: "HVAC & appliance alerts", description: "Notify me about possible equipment issues" },
  { label: "New recommendations", description: "Notify me when a new savings tip is available" },
  { label: "Product updates", description: "Occasional emails about new VoltIQ features" },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

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
              <CardDescription>Choose how VoltIQ looks on your device</CardDescription>
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
              <CardDescription>Smart meters and home devices linked to VoltIQ</CardDescription>
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
              <CardDescription>Connect third-party services to VoltIQ</CardDescription>
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
            <CardHeader>
              <CardTitle>Billing</CardTitle>
              <CardDescription>Manage your VoltIQ subscription</CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={CreditCard}
                title="You're on the Free plan"
                description="Billing and plan management will be available once VoltIQ's pricing is finalized."
              />
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
                You can request a copy of your data or permanently delete your VoltIQ account at any time.
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
