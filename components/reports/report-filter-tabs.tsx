"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const filterOptions = [
  { value: "all", label: "All" },
  { value: "monthly-audit", label: "Monthly Audits" },
  { value: "annual-summary", label: "Annual Summaries" },
  { value: "forecast", label: "Forecasts" },
  { value: "efficiency", label: "Efficiency" },
];

interface ReportFilterTabsProps {
  value: string;
  onChange: (value: string) => void;
}

export function ReportFilterTabs({ value, onChange }: ReportFilterTabsProps) {
  return (
    <Tabs value={value} onValueChange={onChange}>
      <TabsList className="flex-wrap">
        {filterOptions.map((opt) => (
          <TabsTrigger key={opt.value} value={opt.value}>
            {opt.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
