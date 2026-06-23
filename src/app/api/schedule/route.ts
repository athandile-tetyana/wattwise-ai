import { NextRequest, NextResponse } from "next/server";
import { getSchedule, type AreaScheduleResponse } from "@/lib/eskomsepush";
import { createServerSupabaseClient } from "@/lib/supabase";

/** Cache TTL in milliseconds (1 hour) */
const CACHE_TTL_MS = 60 * 60 * 1000;

/**
 * GET /api/schedule?suburb=Cape+Town
 *
 * Returns the load-shedding schedule for the given suburb.
 * Checks Supabase `schedules_cache` first; if a fresh entry exists
 * (< 1 hour old), returns it directly. Otherwise fetches from
 * EskomSePush (currently mocked), caches the result, and returns it.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const suburb = searchParams.get("suburb");

  if (!suburb || suburb.trim().length === 0) {
    return NextResponse.json(
      { error: "Missing required query parameter: suburb" },
      { status: 400 }
    );
  }

  const normalizedSuburb = suburb.trim().toLowerCase();

  try {
    const supabase = createServerSupabaseClient();

    // ── Check cache ────────────────────────────────────────────────────────
    const { data: cached, error: cacheError } = await supabase
      .from("schedules_cache")
      .select("*")
      .eq("suburb_name", normalizedSuburb)
      .order("fetched_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cacheError) {
      console.warn("Cache lookup failed, proceeding without cache:", cacheError.message);
    }

    if (cached) {
      const fetchedAt = new Date(cached.fetched_at).getTime();
      const age = Date.now() - fetchedAt;

      if (age < CACHE_TTL_MS) {
        return NextResponse.json({
          data: cached.data as AreaScheduleResponse,
          cached: true,
          cached_at: cached.fetched_at,
        });
      }
    }

    // ── Fetch fresh data ───────────────────────────────────────────────────
    const schedule = await getSchedule(suburb);

    // ── Write to cache (delete old entry, then insert fresh) ─────────────
    // Using delete + insert instead of upsert because the table may not
    // have a UNIQUE constraint on suburb_name.
    await supabase
      .from("schedules_cache")
      .delete()
      .eq("suburb_name", normalizedSuburb);

    const { error: insertError } = await supabase
      .from("schedules_cache")
      .insert({
        suburb_name: normalizedSuburb,
        area_id: schedule.info.id,
        data: schedule,
        fetched_at: new Date().toISOString(),
      });

    if (insertError) {
      console.warn("Cache write failed:", insertError.message);
      // Non-fatal — still return the data
    }

    return NextResponse.json({
      data: schedule,
      cached: false,
    });
  } catch (err) {
    console.error("Schedule API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch schedule. Please try again." },
      { status: 500 }
    );
  }
}
