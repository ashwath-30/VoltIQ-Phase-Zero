import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { requireEnv } from "@/lib/env";

const anthropic = new Anthropic({ apiKey: requireEnv(process.env.ANTHROPIC_API_KEY, "ANTHROPIC_API_KEY") });

const PROMPT_TEMPLATE = (profile: Record<string, any> | null, bill: Record<string, any>) => `Estimate a
plausible breakdown of home electricity usage by category, based ONLY on the aggregate data below. No
real per-appliance metering exists for this home — this is a rough, illustrative estimate, not a
measurement.

Home profile:
- Home size: ${profile?.home_size || "unknown"} sq ft
- Occupants: ${profile?.occupants || "unknown"}
- Has solar: ${profile?.has_solar ? "yes" : "no"}
- Has battery: ${profile?.has_battery ? "yes" : "no"}
- Has electric vehicle: ${profile?.has_ev ? "yes" : "no"}

Latest bill:
- Total usage: ${bill.total_kwh} kWh
- Peak usage: ${bill.peak_usage_kwh} kWh
- Off-peak usage: ${bill.off_peak_usage_kwh} kWh

Return ONLY a JSON array (no markdown, no explanation) like:
[{"name": "HVAC", "kwh": number}, {"name": "Water Heating", "kwh": number}, ...]

Only include "EV Charging" as a category if the profile has an EV. Reasonable categories: HVAC, EV
Charging, Water Heating, Refrigeration, Lighting, Electronics, Other. The kwh values should sum to
approximately the total usage given above.`;

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const [{ data: profile }, { data: billRows }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("bills")
      .select("*")
      .eq("status", "processed")
      .order("upload_date", { ascending: false })
      .limit(1),
  ]);

  if (!billRows || billRows.length === 0) {
    return NextResponse.json({ error: "No processed bills yet." }, { status: 404 });
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{ role: "user", content: PROMPT_TEMPLATE(profile, billRows[0]) }],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    const raw = textBlock && "text" in textBlock ? textBlock.text : "[]";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const breakdown: { name: string; kwh: number }[] = JSON.parse(cleaned);

    return NextResponse.json({ breakdown });
  } catch (err) {
    console.error("Appliance estimate error:", err);
    return NextResponse.json({ error: "Couldn't generate an estimate right now." }, { status: 500 });
  }
}
