"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Sun, AlertTriangle } from "lucide-react";

interface SimulatedDevice {
  id: string;
  name: string;
  wattage: number;
  priority: string;
  category: string;
  status: "on" | "off" | "standby";
  current_draw_w: number;
  last_seen: string;
}

const POLL_INTERVAL_MS = 30_000;

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    on: "bg-emerald-500/15 text-emerald-400",
    off: "bg-white/10 text-white/40",
    standby: "bg-amber-500/15 text-amber-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] ?? colors.off}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "on"
            ? "bg-emerald-400"
            : status === "standby"
              ? "bg-amber-400"
              : "bg-white/30"
        }`}
      />
      {status}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="h-4 w-24 rounded bg-white/10" />
        <div className="h-5 w-14 rounded-full bg-white/10" />
      </div>
      <div className="h-3 w-16 rounded bg-white/10" />
      <div className="mt-3 h-7 w-20 rounded bg-white/10" />
    </div>
  );
}

export default function DevicePanel() {
  const [devices, setDevices] = useState<SimulatedDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    try {
      const res = await fetch("/api/devices/simulate");
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to fetch devices");
      }

      setDevices(json.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
    const id = setInterval(fetchDevices, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchDevices]);

  const totalDraw = devices
    .filter((d) => d.current_draw_w > 0)
    .reduce((sum, d) => sum + d.current_draw_w, 0);

  const totalGeneration = Math.abs(
    devices
      .filter((d) => d.current_draw_w < 0)
      .reduce((sum, d) => sum + d.current_draw_w, 0)
  );

  return (
    <section>
      {/* ── Summary Bar ──────────────────────────────────────────────── */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
            <Zap className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-white/40">Total Household Draw</p>
            <p className="text-xl font-bold tracking-tight">
              {loading ? "—" : `${totalDraw.toLocaleString()}W`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
            <Sun className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-white/40">Solar + Battery Generation</p>
            <p className="text-xl font-bold tracking-tight text-emerald-400">
              {loading ? "—" : `${totalGeneration.toLocaleString()}W generating`}
            </p>
          </div>
        </div>
      </div>

      {/* ── Error ──────────────────────────────────────────────────────── */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.08] px-5 py-4 text-sm text-red-300">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
          <p>{error}</p>
        </div>
      )}

      {/* ── Loading Skeletons ──────────────────────────────────────────── */}
      {loading && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* ── Device Cards ────────────────────────────────────────────────── */}
      {!loading && !error && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {devices.map((device) => (
            <Card
              key={device.id}
              className="border-white/[0.06] bg-white/[0.03] transition-all hover:border-amber-400/20 hover:bg-white/[0.05]"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">
                    {device.name}
                  </CardTitle>
                  <StatusBadge status={device.status} />
                </div>
                <p className="text-xs text-white/40">{device.category}</p>
              </CardHeader>
              <CardContent>
                <p
                  className={`text-2xl font-bold tracking-tight ${
                    device.current_draw_w < 0
                      ? "text-emerald-400"
                      : device.current_draw_w === 0
                        ? "text-white/30"
                        : "text-white"
                  }`}
                >
                  {device.current_draw_w < 0 ? "+" : ""}
                  {Math.abs(device.current_draw_w).toLocaleString()}W
                </p>
                <p className="mt-1 text-xs text-white/30">
                  {device.current_draw_w < 0
                    ? "generating"
                    : device.current_draw_w === 0
                      ? "idle"
                      : "consuming"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
