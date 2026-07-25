"use client";

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { DownloadReportButton } from "./download-report-button";

const rangeOptions = [
  { value: "3", label: "Last 3 months" },
  { value: "6", label: "Last 6 months" },
  { value: "12", label: "Last 12 months" },
];

interface FilterBarProps {
  range: string;
  onRangeChange: (value: string) => void;
}

export function AnalyticsFilterBar({ range, onRangeChange }: FilterBarProps) {
  return (
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <Select value={range} onValueChange={onRangeChange}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {rangeOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <DownloadReportButton />
    </div>
  );
}
