import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { mapDbBillToBill } from "@/lib/bills";
import { computeForecast, computeEnergyHealthScore, type ForecastResult, type ComputedHealthScore } from "@/lib/energy-model";
import type { Bill } from "@/types";
import { requireEnv } from "@/lib/env";
import { FREE_TIER_CHAT_LIMIT, startOfCurrentMonthISO } from "@/lib/usage-limits";

const anthropic = new Anthropic({ apiKey: requireEnv(process.env.ANTHROPIC_API_KEY, "ANTHROPIC_API_KEY") });

function buildSystemPrompt(
  profile: Record<string, any> | null,
  bills: Bill[],
  forecast: ForecastResult | null,
  healthScore: ComputedHealthScore | null
): string {
  const recentBills = [...bills]
    .sort((a, b) => b.billingPeriod.localeCompare(a.billingPeriod))
    .slice(0, 6);

  const billSummary =
    recentBills.length > 0
      ? recentBills
          .map(
            (b) =>
              `- ${b.billingPeriodLabel}: $${b.totalCost} total, ${b.totalKwh} kWh (peak: ${b.peakUsageKwh} kWh, off-peak: ${b.offPeakUsageKwh} kWh)`
          )
          .join("\n")
      : "No bills uploaded yet.";

  const forecastSummary = forecast
    ? `Predicted next bill: $${forecast.predictedCost}, ${forecast.predictedKwh} kWh, confidence ${Math.round(
        forecast.confidence * 100
      )}% (for ${forecast.periodLabel})`
    : "Not enough bill history yet to generate a forecast.";

  const healthSummary = healthScore
    ? `Energy Health Score: ${healthScore.score}/100, trend: ${healthScore.trend}. Contributing factors: ${
        healthScore.factors.map((f) => f.label).join("; ") || "none identified yet"
      }`
    : "Not enough bill history yet to compute a health score.";

  return `You are the VoltIQ AI Energy Assistant, embedded in a home energy auditing app. You have access to this specific user's real account data below. Always answer using this real data when the question is about their account — never invent numbers that aren't provided here.

USER PROFILE:
- Name: ${profile?.name || "Unknown"}
- Home size: ${profile?.home_size || "not set"} sq ft
- Occupants: ${profile?.occupants || "not set"}
- Solar panels: ${profile?.has_solar ? "yes" : "no"}
- Home battery: ${profile?.has_battery ? "yes" : "no"}
- Electric vehicle: ${profile?.has_ev ? "yes" : "no"}
- Preferred units: ${profile?.preferred_units || "imperial"}

RECENT BILL HISTORY (most recent first):
${billSummary}

FORECAST:
${forecastSummary}

ENERGY HEALTH SCORE:
${healthSummary}

IMPORTANT GUARDRAILS:
- This app does NOT currently have appliance-level usage breakdown (e.g., exactly how much an AC unit or fridge uses individually) — only total, peak, and off-peak kWh per bill. If asked for an appliance-level breakdown, say honestly that this isn't available yet rather than inventing plausible-sounding numbers.
- If there isn't enough bill history to answer confidently, say so rather than guessing.
- Keep responses concise, warm, and use markdown (bold, bullet lists) where it helps readability.
- Never discuss or imply access to any other user's data.`;
}

function contextSourcesUsed(bills: Bill[], forecast: ForecastResult | null, healthScore: ComputedHealthScore | null): string[] {
  const sources: string[] = [];
  if (bills.length > 0) sources.push(`${bills.length} bill${bills.length === 1 ? "" : "s"} on file`);
  if (forecast) sources.push("Forecast model");
  if (healthScore) sources.push("Energy Health Score model");
  return sources;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { message } = await request.json();
  if (!message || typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const [{ data: profile }, { data: billRows }, { data: chatRows }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("bills").select("*").order("upload_date", { ascending: false }),
    supabase.from("chats").select("role, content").order("timestamp", { ascending: true }).limit(20),
  ]);

  const plan = profile?.plan ?? "free";
  if (plan !== "pro") {
    const { count } = await supabase
      .from("chats")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("role", "user")
      .gte("timestamp", startOfCurrentMonthISO());

    if ((count ?? 0) >= FREE_TIER_CHAT_LIMIT) {
      return NextResponse.json(
        {
          error: `You've used all ${FREE_TIER_CHAT_LIMIT} free AI Assistant messages this month. Upgrade to Pro for unlimited access.`,
          limitReached: true,
        },
        { status: 403 }
      );
    }
  }

  const bills = (billRows ?? []).map(mapDbBillToBill).filter((b) => b.status === "processed");
  const forecast = bills.length > 0 ? computeForecast(bills) : null;
  const healthScore = bills.length > 0 ? computeEnergyHealthScore(bills) : null;

  const systemPrompt = buildSystemPrompt(profile, bills, forecast, healthScore);
  const conversationHistory = (chatRows ?? []).map((row: { role: string; content: string }) => ({
    role: row.role as "user" | "assistant",
    content: row.content as string,
  }));

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 700,
      system: systemPrompt,
      messages: [...conversationHistory, { role: "user", content: message }],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    const replyText = textBlock && "text" in textBlock ? textBlock.text : "I couldn't generate a response — please try again.";
    const sources = contextSourcesUsed(bills, forecast, healthScore);

    const nowIso = new Date().toISOString();
    await supabase.from("chats").insert([
      { user_id: user.id, role: "user", content: message, timestamp: nowIso },
      { user_id: user.id, role: "assistant", content: replyText, sources, timestamp: nowIso },
    ]);

    return NextResponse.json({ reply: replyText, sources });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: "The assistant is temporarily unavailable. Please try again in a moment." },
      { status: 500 }
    );
  }
}
