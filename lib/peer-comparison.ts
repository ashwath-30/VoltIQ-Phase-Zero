import { createClient } from "@/lib/supabase/client";

export interface PeerComparisonResult {
  percentile: number | null; // null = not enough comparable homes yet
  comparableHomes: number;
}

export async function getPeerComparison(
  homeSize: number,
  currentKwh: number
): Promise<PeerComparisonResult | null> {
  if (!homeSize || homeSize <= 0) return null;

  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_peer_percentile", {
    p_home_size: homeSize,
    p_current_kwh: currentKwh,
  });

  if (error || !data || data.length === 0) return null;

  return {
    percentile: data[0].percentile,
    comparableHomes: data[0].comparable_homes,
  };
}
