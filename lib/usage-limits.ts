// Free tier limits. Change these two numbers to adjust the plan without
// touching anything else — every place that enforces or displays limits
// reads from here.
export const FREE_TIER_UPLOAD_LIMIT = 3;
export const FREE_TIER_CHAT_LIMIT = 5;
export const PRO_PRICE_DISPLAY = "$5/month";

export function startOfCurrentMonthISO(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

export interface UsageStatus {
  plan: "free" | "pro";
  uploadsUsed: number;
  uploadsLimit: number | null; // null = unlimited
  chatsUsed: number;
  chatsLimit: number | null;
}

export function isOverUploadLimit(plan: string, uploadsThisMonth: number): boolean {
  if (plan === "pro") return false;
  return uploadsThisMonth >= FREE_TIER_UPLOAD_LIMIT;
}

export function isOverChatLimit(plan: string, chatsThisMonth: number): boolean {
  if (plan === "pro") return false;
  return chatsThisMonth >= FREE_TIER_CHAT_LIMIT;
}
