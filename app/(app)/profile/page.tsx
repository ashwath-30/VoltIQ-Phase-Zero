"use client";

import { PageHeader } from "@/components/app-shell/page-header";
import { SaveButton } from "@/components/app-shell/save-button";
import { FormField } from "@/components/auth/form-field";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { mockUser } from "@/lib/mock-data";

export default function ProfilePage() {
  const initials = mockUser.name
    .split(" ")
    .map((p) => p[0])
    .join("");

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Profile" description="Update your personal and home details" />

      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => e.preventDefault()}
      >
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
              <Button variant="outline" size="sm" type="button">
                Change photo
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Full name" defaultValue={mockUser.name} />
              <FormField label="Email" type="email" defaultValue={mockUser.email} />
            </div>
            <FormField label="Address" defaultValue={mockUser.address} />
            <FormField label="Utility company" defaultValue={mockUser.utilityProvider} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Home details</CardTitle>
            <CardDescription>Helps VoltIQ tailor forecasts and recommendations to your home</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Home size (sq ft)" type="number" defaultValue={mockUser.homeSize} />
              <FormField label="Occupants" type="number" defaultValue={mockUser.occupants} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Preferred units</Label>
              <Select defaultValue={mockUser.preferredUnits}>
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
              <ToggleRow label="Solar panels" defaultChecked={mockUser.hasSolar} />
              <ToggleRow label="Home battery" defaultChecked={mockUser.hasBattery} />
              <ToggleRow label="Electric vehicle" defaultChecked={mockUser.hasEv} />
            </div>
          </CardContent>
        </Card>

        <SaveButton />
      </form>
    </div>
  );
}

function ToggleRow({ label, defaultChecked }: { label: string; defaultChecked: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-3">
      <span className="text-sm font-medium">{label}</span>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
