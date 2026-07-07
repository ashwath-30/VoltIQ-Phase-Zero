export type UnitPreference = "imperial" | "metric";

export interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  utilityProvider: string;
  homeSize: number; // sq ft
  occupants: number;
  hasSolar: boolean;
  hasBattery: boolean;
  hasEv: boolean;
  preferredUnits: UnitPreference;
  avatarUrl?: string;
}

export interface Bill {
  id: string;
  userId: string;
  uploadDate: string; // ISO date
  billingPeriod: string; // e.g. "2026-06"
  billingPeriodLabel: string; // e.g. "June 2026"
  totalCost: number;
  totalKwh: number;
  peakUsageKwh: number;
  offPeakUsageKwh: number;
  pdfName: string;
  status: "processed" | "processing" | "error";
}

export interface Forecast {
  id: string;
  billId: string;
  predictedCost: number;
  predictedKwh: number;
  confidence: number; // 0-1
  period: string; // e.g. "2026-07"
}

export type RecommendationPriority = "high" | "medium" | "low";

export interface Recommendation {
  id: string;
  billId: string;
  title: string;
  description: string;
  estimatedSavings: number; // USD / month
  priority: RecommendationPriority;
  category: "hvac" | "solar" | "battery" | "ev" | "appliance" | "behavior";
}

export interface ChatMessage {
  id: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string; // ISO
  sources?: string[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: "usage" | "forecast" | "hvac" | "solar" | "ev" | "system";
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  severity: "info" | "warning" | "critical";
}

export interface ApplianceUsage {
  name: string;
  kwh: number;
  percent: number;
}

export interface MonthlyUsagePoint {
  month: string; // "Jan", "Feb", ...
  cost: number;
  kwh: number;
  peak: number;
  offPeak: number;
  carbonKg: number;
}

export type ReportType = "monthly-audit" | "annual-summary" | "forecast" | "efficiency";

export interface ReportItem {
  id: string;
  type: ReportType;
  title: string;
  status: "ready" | "generating" | "failed";
  date: string;
  sizeKb: number;
}

export interface UploadState {
  fileName: string;
  progress: number; // 0-100
  status: "idle" | "uploading" | "success" | "error";
  errorMessage?: string;
}
