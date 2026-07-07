import type {
  User,
  Bill,
  Forecast,
  Recommendation,
  ChatMessage,
  NotificationItem,
  ApplianceUsage,
  MonthlyUsagePoint,
  ReportItem,
} from "@/types";

export const mockUser: User = {
  id: "usr_001",
  name: "Jordan Reyes",
  email: "jordan.reyes@example.com",
  address: "482 Maple Grove Ln, Austin, TX 78704",
  utilityProvider: "Austin Energy",
  homeSize: 2100,
  occupants: 3,
  hasSolar: false,
  hasBattery: false,
  hasEv: true,
  preferredUnits: "imperial",
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Deterministic pseudo-random so the UI is stable across renders/SSR
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export const monthlyUsageHistory: MonthlyUsagePoint[] = months.map((month, i) => {
  const seasonalFactor = 1 + 0.5 * Math.sin(((i - 6) / 12) * Math.PI * 2); // peaks in summer
  const base = 780 * seasonalFactor + seededRandom(i + 1) * 60;
  const kwh = Math.round(base);
  const peak = Math.round(kwh * 0.42);
  return {
    month,
    kwh,
    peak,
    offPeak: kwh - peak,
    cost: Math.round(kwh * 0.152 * 100) / 100,
    carbonKg: Math.round(kwh * 0.42),
  };
});

export const bills: Bill[] = monthlyUsageHistory.slice(-6).map((point, i) => ({
  id: `bill_${i + 1}`,
  userId: mockUser.id,
  uploadDate: new Date(2026, 5 - i, 3).toISOString(),
  billingPeriod: `2026-${String(6 - i).padStart(2, "0")}`,
  billingPeriodLabel: `${point.month} 2026`,
  totalCost: point.cost,
  totalKwh: point.kwh,
  peakUsageKwh: point.peak,
  offPeakUsageKwh: point.offPeak,
  pdfName: `austin-energy-bill-2026-${String(6 - i).padStart(2, "0")}.pdf`,
  status: "processed",
}));

export const latestForecast: Forecast = {
  id: "fc_001",
  billId: bills[0].id,
  predictedCost: 214,
  predictedKwh: 1340,
  confidence: 0.86,
  period: "2026-07",
};

export const recommendations: Recommendation[] = [
  {
    id: "rec_001",
    billId: bills[0].id,
    title: "Shift EV charging to off-peak hours",
    description:
      "Charging between 11pm–6am instead of evening hours could reduce your peak demand charges significantly.",
    estimatedSavings: 28,
    priority: "high",
    category: "ev",
  },
  {
    id: "rec_002",
    billId: bills[0].id,
    title: "Schedule an HVAC tune-up",
    description:
      "Usage patterns suggest your HVAC system is running longer cycles than expected for this home size.",
    estimatedSavings: 34,
    priority: "high",
    category: "hvac",
  },
  {
    id: "rec_003",
    billId: bills[0].id,
    title: "Consider a rooftop solar assessment",
    description:
      "Homes with your usage profile and roof exposure typically offset 60-80% of grid consumption with solar.",
    estimatedSavings: 96,
    priority: "medium",
    category: "solar",
  },
  {
    id: "rec_004",
    billId: bills[0].id,
    title: "Replace older refrigerator unit",
    description:
      "Appliance-level breakdown shows refrigeration drawing more than typical for an ENERGY STAR-rated unit.",
    estimatedSavings: 12,
    priority: "low",
    category: "appliance",
  },
];

export const applianceBreakdown: ApplianceUsage[] = [
  { name: "HVAC", kwh: 512, percent: 38 },
  { name: "EV Charging", kwh: 298, percent: 22 },
  { name: "Water Heating", kwh: 189, percent: 14 },
  { name: "Refrigeration", kwh: 121, percent: 9 },
  { name: "Lighting", kwh: 94, percent: 7 },
  { name: "Electronics", kwh: 81, percent: 6 },
  { name: "Other", kwh: 54, percent: 4 },
];

export const notifications: NotificationItem[] = [
  {
    id: "ntf_001",
    userId: mockUser.id,
    type: "usage",
    title: "High electricity usage detected",
    description: "Your usage this week is 18% above your seasonal average.",
    timestamp: new Date(2026, 5, 28).toISOString(),
    read: false,
    severity: "warning",
  },
  {
    id: "ntf_002",
    userId: mockUser.id,
    type: "forecast",
    title: "Forecasted bill increase",
    description: "Next month's bill is projected to be $22 higher than June.",
    timestamp: new Date(2026, 5, 26).toISOString(),
    read: false,
    severity: "info",
  },
  {
    id: "ntf_003",
    userId: mockUser.id,
    type: "hvac",
    title: "Possible HVAC inefficiency",
    description: "Runtime patterns suggest your system may need servicing.",
    timestamp: new Date(2026, 5, 20).toISOString(),
    read: true,
    severity: "warning",
  },
  {
    id: "ntf_004",
    userId: mockUser.id,
    type: "solar",
    title: "Solar recommendation available",
    description: "A new personalized solar savings estimate is ready to view.",
    timestamp: new Date(2026, 5, 14).toISOString(),
    read: true,
    severity: "info",
  },
  {
    id: "ntf_005",
    userId: mockUser.id,
    type: "ev",
    title: "EV charging optimization tip",
    description: "Shifting your charge window could save you $28 this month.",
    timestamp: new Date(2026, 5, 10).toISOString(),
    read: true,
    severity: "info",
  },
];

export const reports: ReportItem[] = [
  { id: "rpt_001", type: "monthly-audit", title: "June 2026 Monthly Audit", status: "ready", date: "2026-07-01", sizeKb: 842 },
  { id: "rpt_002", type: "forecast", title: "July 2026 Forecast Report", status: "ready", date: "2026-06-29", sizeKb: 356 },
  { id: "rpt_003", type: "efficiency", title: "Q2 2026 Efficiency Report", status: "ready", date: "2026-06-15", sizeKb: 1204 },
  { id: "rpt_004", type: "annual-summary", title: "2025 Annual Summary", status: "ready", date: "2026-01-08", sizeKb: 2310 },
  { id: "rpt_005", type: "monthly-audit", title: "July 2026 Monthly Audit", status: "generating", date: "2026-07-06", sizeKb: 0 },
];

export const suggestedPrompts: string[] = [
  "Why was my bill higher this month?",
  "Should I install solar panels?",
  "Would a battery save me money?",
  "How much does my EV cost to charge?",
  "How can I reduce my bill?",
];

export const chatHistory: ChatMessage[] = [
  {
    id: "chat_001",
    userId: mockUser.id,
    role: "user",
    content: "Why was my bill higher this month?",
    timestamp: new Date(2026, 5, 29, 9, 12).toISOString(),
  },
  {
    id: "chat_002",
    userId: mockUser.id,
    role: "assistant",
    content:
      "Your June bill was **$18 higher** than May, mainly driven by increased HVAC runtime during the heatwave and 3 additional EV charging sessions. HVAC accounted for roughly 62% of the increase.",
    timestamp: new Date(2026, 5, 29, 9, 12).toISOString(),
    sources: ["June 2026 bill", "Appliance usage model"],
  },
];

// Energy efficiency score is a derived output metric — left as a placeholder
// for the real scoring model rather than computed here.
export const energyHealthScorePlaceholder = null;
