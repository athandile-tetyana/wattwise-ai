import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite:generateContent";

interface RecommendRequest {
  suburb: string;
  schedule: Record<string, unknown>;
  devices: {
    name: string;
    category: string;
    wattage: number;
    status: string;
    current_draw_w: number;
  }[];
}

function buildPrompt(suburb: string, schedule: Record<string, unknown>, devices: RecommendRequest["devices"]): string {
  const deviceList = devices
    .map(
      (d) =>
        `- ${d.name} (${d.category}): ${d.wattage}W, status: ${d.status}, current draw: ${d.current_draw_w}W`
    )
    .join("\n");

  return `You are WattWise AI, an energy advisor for South African households during load-shedding.

CONTEXT:
Suburb: ${suburb}
Load-shedding schedule: ${JSON.stringify(schedule, null, 2)}

Household devices:
${deviceList}

TASK:
Based on the schedule and device list, provide 3-5 specific, actionable energy recommendations.
Each recommendation should be one direct sentence. Focus on:
- Which high-draw appliances to run or delay before upcoming outages
- Which devices to turn off to reduce load
- How to maximize solar/battery usage during outages
- Time-specific advice tied to actual outage windows in the schedule

RULES:
- Be specific with times and wattages
- Prioritize high-draw devices (geyser, washing machine)
- Consider the current status of each device
- Return ONLY a JSON array of strings, no other text

Return format (must be valid JSON):
["recommendation 1", "recommendation 2", "recommendation 3"]`;
}

export async function POST(request: NextRequest) {
  try {
    const body: RecommendRequest = await request.json();
    const { suburb, schedule, devices } = body;

    if (!suburb || !schedule || !devices) {
      return NextResponse.json(
        { error: "Missing required fields: suburb, schedule, devices" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const prompt = buildPrompt(suburb, schedule, devices);

    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error:", geminiRes.status, errText);
      return NextResponse.json({
        recommendations: [
          "Turn off your Geyser now — it draws 3000W and an outage starts at 14:00.",
          "Run your Washing Machine before 13:30 to complete the cycle before load-shedding.",
          "Your Solar Inverter is generating power — use this window to charge all devices.",
          "Fridge will maintain temperature for 2-3 hours during the outage, no action needed.",
          "Charge all laptops and power banks before the 14:00 outage window."
        ],
        mock: true
      });
    }

    const geminiData = await geminiRes.json();
    const rawText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Extract JSON array from response (may be wrapped in markdown code block)
    const jsonMatch = rawText.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) {
      console.error("Could not parse Gemini response:", rawText);
      return NextResponse.json(
        { error: "AI returned an unexpected response format" },
        { status: 502 }
      );
    }

    const recommendations: string[] = JSON.parse(jsonMatch[0]);

    // Log to Supabase
    const supabase = createServerSupabaseClient();
    const { error: logError } = await supabase
      .from("recommendations_log")
      .insert({
        suburb,
        recommendations,
        devices_snapshot: devices,
        schedule_snapshot: schedule,
        created_at: new Date().toISOString(),
      });

    if (logError) {
      console.warn("Failed to log recommendations:", logError.message);
    }

    return NextResponse.json({ recommendations });
  } catch (err) {
    console.error("Recommend API error:", err);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
