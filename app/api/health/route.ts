import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Hit this at yourdomain.com/api/health once deployed to confirm the app
// is not just "running" but genuinely able to reach the database — the
// difference matters, since a server can be "up" while still broken.
// Free uptime monitors (UptimeRobot, Better Uptime, etc.) can ping this
// on a schedule and alert you if it ever stops returning "ok".
export async function GET() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("profiles").select("id").limit(1);

    if (error) {
      return NextResponse.json(
        { status: "error", database: "unreachable", detail: error.message },
        { status: 503 }
      );
    }

    return NextResponse.json({ status: "ok", database: "connected", timestamp: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json(
      { status: "error", database: "unreachable" },
      { status: 503 }
    );
  }
}
