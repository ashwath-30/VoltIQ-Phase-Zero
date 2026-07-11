"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/app-shell/page-header";
import { FormField } from "@/components/auth/form-field";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/states";
import { Check, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ProfileFormState {
  name: string;
  email: string;
  address: string;
  utilityProvider: string;
  homeSize: string;
  occupants: string;
  hasSolar: boolean;
  hasBattery: boolean;
  hasEv: boolean;
  preferredUnits: "imperial" | "metric";
}

const emptyForm: ProfileFormState = {
  name: "",
  email: "",
  address: "",
  utilityProvider: "",
  homeSize: "",
  occupants: "",
  hasSolar: false,
  hasBattery: false,
  hasEv: false,
  preferredUnits: "imperial",
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<ProfileFormState>(emptyForm);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

      if (profile) {
        setForm({
          name: profile.name ?? "",
          email: profile.email ?? user.email ?? "",
          address: profile.address ?? "",
          utilityProvider: profile.utility_provider ?? "",
          homeSize: profile.home_size ? String(profile.home_size) : "",
          occupants: profile.occupants ? String(profile.occupants) : "",
          hasSolar: !!profile.has_solar,
          hasBattery: !!profile.has_battery,
          hasEv: !!profile.has_ev,
          preferredUnits: profile.preferred_units === "metric" ? "metric" : "imperial",
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    await supabase
      .from("profiles")
      .update({
        name: form.name,
        address: form.address,
        utility_provider: form.utilityProvider,
        home_size: form.homeSize ? parseInt(form.homeSize, 10) : 0,
        occupants: form.occupants ? parseInt(form.occupants, 10) : 1,
        has_solar: form.hasSolar,
        has_battery: form.hasBattery,
        has_ev: form.hasEv,
        preferred_units: form.preferredUnits,
      })
      .eq("id", user.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const initials = (form.name || form.email || "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (loading) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <PageHeader title="Profile" description="Update your personal and home details" />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Profile" description="Update your personal and home details" />

      <form className="flex flex-col gap-6" onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <CardTitle>Personal information</CardTitle>
            <CardDescription>This is used across your dashboard and reports</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" type="button" disabled title="Not wired up yet">
                Change photo
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                label="Full name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              <FormField label="Email" type="email" value={form.email} disabled hint="Contact support to change your email" />
            </div>
            <FormField
              label="Address"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="123 Main St, City, State"
            />
            <FormField
              label="Utility company"
              value={form.utilityProvider}
              onChange={(e) => setForm((f) => ({ ...f, utilityProvider: e.target.value }))}
              placeholder="e.g. Austin Energy"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Home details</CardTitle>
            <CardDescription>
              Helps VoltIQ tailor forecasts and recommendations to your home — and unlocks comparisons
              against similar-sized homes
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                label="Home size (sq ft)"
                type="number"
                value={form.homeSize}
                onChange={(e) => setForm((f) => ({ ...f, homeSize: e.target.value }))}
                placeholder="2100"
              />
              <FormField
                label="Occupants"
                type="number"
                value={form.occupants}
                onChange={(e) => setForm((f) => ({ ...f, occupants: e.target.value }))}
                placeholder="3"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Preferred units</Label>
              <Select
                value={form.preferredUnits}
                onValueChange={(v) => setForm((f) => ({ ...f, preferredUnits: v as "imperial" | "metric" }))}
              >
                <SelectTrigger className="sm:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="imperial">Imperial (°F, kWh)</SelectItem>
                  <SelectItem value="metric">Metric (°C, kWh)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ToggleRow
                label="Solar panels"
                checked={form.hasSolar}
                onChange={(v) => setForm((f) => ({ ...f, hasSolar: v }))}
              />
              <ToggleRow
                label="Home battery"
                checked={form.hasBattery}
                onChange={(v) => setForm((f) => ({ ...f, hasBattery: v }))}
              />
              <ToggleRow
                label="Electric vehicle"
                checked={form.hasEv}
                onChange={(v) => setForm((f) => ({ ...f, hasEv: v }))}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
          {saved && (
            <span className="flex items-center gap-1 text-sm text-primary">
              <Check className="h-4 w-4" />
              Saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-3">
      <span className="text-sm font-medium">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
