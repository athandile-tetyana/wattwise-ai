/**
 * EskomSePush API Client
 *
 * Mock implementation for Phase 1 development.
 * Returns data shaped exactly like the real EskomSePush API v2 responses
 * so the swap to live data is a single function body change.
 *
 * Real API docs: https://developer.sepush.co.za/business/2.0/
 * Auth: Token header with ESKOMSEPUSH_API_KEY
 * Rate limit: 50 calls/day on free tier → cache aggressively in Supabase
 */

// ─── Types ───────────────────────────────────────────────────────────────────

/** A single load-shedding time slot */
export interface ScheduleSlot {
  /** ISO 8601 start time */
  start: string;
  /** ISO 8601 end time */
  end: string;
  /** Human-readable note, e.g. "Stage 2" */
  note: string;
}

/** One day's schedule */
export interface ScheduleDay {
  /** Date string, e.g. "2026-06-23" */
  date: string;
  /** Display name for the day, e.g. "Monday" */
  name: string;
  /** Outage slots for this day */
  stages: ScheduleSlot[];
}

/** Top-level API response shape (mirrors /area endpoint) */
export interface AreaScheduleResponse {
  /** Current load-shedding stage, e.g. "Stage 2" or "No Load Shedding" */
  status: string;
  /** Suburb / area display name */
  name: string;
  /** Region, e.g. "City of Cape Town" */
  region: string;
  /** Upcoming outage events (next 4 windows) */
  events: ScheduleSlot[];
  /** Full multi-day schedule */
  schedule: {
    days: ScheduleDay[];
  };
  /** Additional info */
  info: {
    /** EskomSePush area ID */
    id: string;
    /** Suburb name used in search */
    suburb: string;
  };
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

/**
 * Generates deterministic mock outage events relative to "now" so the UI
 * always shows upcoming windows regardless of when the dev runs the app.
 */
function generateMockEvents(): ScheduleSlot[] {
  const now = new Date();

  const offsets = [
    { startH: 2, durationH: 2.5 },
    { startH: 8, durationH: 2 },
    { startH: 14, durationH: 2.5 },
    { startH: 22, durationH: 2 },
  ];

  return offsets.map(({ startH, durationH }) => {
    const start = new Date(now.getTime() + startH * 60 * 60 * 1000);
    const end = new Date(start.getTime() + durationH * 60 * 60 * 1000);
    return {
      start: start.toISOString(),
      end: end.toISOString(),
      note: "Stage 2",
    };
  });
}

/**
 * Generates a 3-day mock schedule from today.
 */
function generateMockSchedule(): ScheduleDay[] {
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return Array.from({ length: 3 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);

    const dayStr = date.toISOString().split("T")[0];
    const dayName = dayNames[date.getDay()];

    // Two outage slots per day
    const slot1Start = new Date(date);
    slot1Start.setHours(6, 0, 0, 0);
    const slot1End = new Date(date);
    slot1End.setHours(8, 30, 0, 0);

    const slot2Start = new Date(date);
    slot2Start.setHours(18, 0, 0, 0);
    const slot2End = new Date(date);
    slot2End.setHours(20, 30, 0, 0);

    return {
      date: dayStr,
      name: dayName,
      stages: [
        { start: slot1Start.toISOString(), end: slot1End.toISOString(), note: "Stage 2" },
        { start: slot2Start.toISOString(), end: slot2End.toISOString(), note: "Stage 2" },
      ],
    };
  });
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Fetch the load-shedding schedule for a given suburb.
 *
 * Currently returns MOCK data. When the real EskomSePush API key is
 * available, replace the body of this function with a fetch call.
 *
 * @param suburb - Suburb name to search for (e.g. "Cape Town")
 * @returns AreaScheduleResponse shaped exactly like the real API
 */
export async function getSchedule(suburb: string): Promise<AreaScheduleResponse> {
  // ──────────────────────────────────────────────────────────────────────────
  // TODO: Replace mock data with real API call once ESKOMSEPUSH_API_KEY is set
  //
  //   const API_BASE = "https://developer.sepush.co.za/business/2.0";
  //   const apiKey = process.env.ESKOMSEPUSH_API_KEY;
  //
  //   // Step 1: Search for the area ID
  //   const searchRes = await fetch(`${API_BASE}/areas_search?text=${encodeURIComponent(suburb)}`, {
  //     headers: { Token: apiKey! },
  //   });
  //   const searchData = await searchRes.json();
  //   const areaId = searchData.areas[0]?.id;
  //
  //   // Step 2: Get the schedule for that area
  //   const scheduleRes = await fetch(`${API_BASE}/area?id=${areaId}`, {
  //     headers: { Token: apiKey! },
  //   });
  //   return await scheduleRes.json();
  //
  // ──────────────────────────────────────────────────────────────────────────

  // Simulate a small network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const normalizedSuburb = suburb.trim() || "Cape Town CBD";

  return {
    status: "Stage 2",
    name: `${normalizedSuburb} (Group 4)`,
    region: "City of Cape Town",
    events: generateMockEvents(),
    schedule: {
      days: generateMockSchedule(),
    },
    info: {
      id: "capetown-4-citycapetown",
      suburb: normalizedSuburb,
    },
  };
}
