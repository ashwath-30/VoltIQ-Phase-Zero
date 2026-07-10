import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { mapDbBillToBill } from "@/lib/bills";
import { computeForecast, computeEnergyHealthScore } from "@/lib/energy-model";
import { generateNotifications } from "@/lib/notification-rules";
import { requireEnv } from "@/lib/env";

// Server-only — this key must NEVER have the NEXT_PUBLIC_ prefix, or it
// would be shipped to the browser and exposed to anyone who looks.
const anthropic = new Anthropic({ apiKey: requireEnv("ANTHROPIC_API_KEY") });

const EXTRACTION_PROMPT = `You are extracting structured data from a residential electricity utility bill PDF.

Return ONLY a JSON object (no markdown formatting, no explanation, no code fences) with exactly these fields:
{
  "billing_period": "YYYY-MM",
  "billing_period_label": "Month YYYY",
  "total_cost": number,
  "total_kwh": number,
  "peak_usage_kwh": number or null if the bill doesn't break out peak/off-peak,
  "off_peak_usage_kwh": number or null if the bill doesn't break out peak/off-peak
}

Use null for any field you genuinely cannot find. If this document does not
appear to be a utility bill at all, return {"error": "not_a_bill"} instead
of the fields above.`;

interface ExtractedBillData {
  billing_period?: string;
  billing_period_label?: string;
  total_cost?: number;
  total_kwh?: number;
  peak_usage_kwh?: number | null;
  off_peak_usage_kwh?: number | null;
  error?: string;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "File must be a PDF." }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File is too large (max 10MB)." }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  // 1. Store the original PDF in Supabase Storage, in a folder named after
  // the user's id — this is what the storage security policies check.
  const storagePath = `${user.id}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("bills")
    .upload(storagePath, arrayBuffer, { contentType: "application/pdf" });

  if (uploadError) {
    return NextResponse.json(
      { error: `Couldn't store the file: ${uploadError.message}` },
      { status: 500 }
    );
  }

  // 2. Ask Claude to read the PDF and extract structured fields from it.
  let extracted: ExtractedBillData;
  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          // Cast to `any` here: the installed SDK version's TypeScript
          // types haven't caught up to the "document" content block yet,
          // even though the actual API fully supports sending PDFs this
          // way. This is a types-only mismatch, not a real bug.
          content: [
            {
              type: "document",
              source: { type: "base64", media_type: "application/pdf", data: base64 },
            },
            { type: "text", text: EXTRACTION_PROMPT },
          ] as any,
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    const raw = textBlock && "text" in textBlock ? textBlock.text : "";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    extracted = JSON.parse(cleaned);
  } catch (err) {
    // Extraction failed — still record the attempt so it's visible in
    // history as an error, rather than silently vanishing.
    await supabase.from("bills").insert({
      user_id: user.id,
      billing_period: "unknown",
      billing_period_label: "Processing failed",
      total_cost: 0,
      total_kwh: 0,
      pdf_name: file.name,
      status: "error",
    });
    return NextResponse.json(
      { error: "We couldn't read this PDF. It may be scanned, encrypted, or in an unsupported format." },
      { status: 422 }
    );
  }

  if (extracted.error === "not_a_bill") {
    return NextResponse.json(
      { error: "This doesn't look like a utility bill — please double check the file." },
      { status: 422 }
    );
  }

  // 3. Save the extracted data as a real bill row.
  const { data: bill, error: insertError } = await supabase
    .from("bills")
    .insert({
      user_id: user.id,
      billing_period: extracted.billing_period ?? "unknown",
      billing_period_label: extracted.billing_period_label ?? "Unknown period",
      total_cost: extracted.total_cost ?? 0,
      total_kwh: extracted.total_kwh ?? 0,
      peak_usage_kwh: extracted.peak_usage_kwh ?? null,
      off_peak_usage_kwh: extracted.off_peak_usage_kwh ?? null,
      pdf_name: file.name,
      status: "processed",
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json(
      { error: `Couldn't save this bill: ${insertError.message}` },
      { status: 500 }
    );
  }

  // 4. Re-check the user's full history (including this new bill) against
  // a few defined rules, and create any real notifications that are
  // actually warranted. This is what makes notifications a genuine
  // background-style process rather than static sample data — every
  // upload can trigger new, real alerts based on what actually changed.
  try {
    const { data: allBillRows } = await supabase
      .from("bills")
      .select("*")
      .eq("status", "processed")
      .order("upload_date", { ascending: false });

    const allBills = (allBillRows ?? []).map(mapDbBillToBill);
    const forecast = computeForecast(allBills);
    const healthScore = computeEnergyHealthScore(allBills);
    const candidates = generateNotifications(allBills, forecast, healthScore);

    for (const candidate of candidates) {
      // Avoid spamming duplicate notifications if the same condition is
      // still true across multiple uploads in a short window.
      const { data: existing } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", user.id)
        .eq("title", candidate.title)
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(1);

      if (!existing || existing.length === 0) {
        await supabase.from("notifications").insert({
          user_id: user.id,
          type: candidate.type,
          title: candidate.title,
          description: candidate.description,
          severity: candidate.severity,
          timestamp: new Date().toISOString(),
          read: false,
        });
      }
    }
  } catch (notifErr) {
    // Notifications are a nice-to-have on top of a successful upload —
    // don't fail the whole request if this side-step has a problem.
    console.error("Notification generation error:", notifErr);
  }

  return NextResponse.json({ bill });
}
