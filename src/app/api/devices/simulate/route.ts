import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

interface Device {
  id: string;
  name: string;
  wattage: number;
  priority: string;
  category: string;
  status: "on" | "off" | "standby";
}

interface SimulatedDevice extends Device {
  current_draw_w: number;
  last_seen: string;
}

const GENERATORS = new Set(["Solar Inverter", "Battery Backup"]);

function simulateDraw(device: Device): number {
  if (device.status === "off") return 0;

  const base = Math.abs(device.wattage);
  const fluctuation = base * 0.1;
  const jitter = (Math.random() * 2 - 1) * fluctuation;
  const draw = base + jitter;

  if (GENERATORS.has(device.name)) {
    return -Math.round(draw);
  }

  return Math.round(draw);
}

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    const { data: devices, error } = await supabase
      .from("devices")
      .select("*");

    if (error) {
      console.error("Failed to fetch devices:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch devices" },
        { status: 500 }
      );
    }

    const now = new Date().toISOString();

    const simulated: SimulatedDevice[] = (devices ?? []).map((d: Device) => ({
      ...d,
      current_draw_w: simulateDraw(d),
      last_seen: now,
    }));

    return NextResponse.json({ data: simulated });
  } catch (err) {
    console.error("Device simulation error:", err);
    return NextResponse.json(
      { error: "Failed to simulate devices" },
      { status: 500 }
    );
  }
}
