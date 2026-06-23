"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Zap, ZapOff, Clock, AlertTriangle, Loader2, MapPin } from "lucide-react";
import type { AreaScheduleResponse } from "@/lib/eskomsepush";
import DevicePanel from "@/components/DevicePanel";
import RecommendPanel from "@/components/RecommendPanel";

export default function Home() {
  const [suburb, setSuburb] = useState("");
  const [schedule, setSchedule] = useState<AreaScheduleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wasCached, setWasCached] = useState(false);

  async function handleSearch() {
    const trimmed = suburb.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setSchedule(null);

    try {
      const res = await fetch(`/api/schedule?suburb=${encodeURIComponent(trimmed)}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to fetch schedule");
      }

      setSchedule(json.data);
      setWasCached(json.cached ?? false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSearch();
    }
  }

  /**
   * Format an ISO date string into a human-readable time like "14:00"
   */
  function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString("en-ZA", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  /**
   * Format an ISO date string into a human-readable date like "Mon 23 Jun"
   */
  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-ZA", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  }

  /**
   * Calculate duration between two ISO dates in a readable format
   */
  function formatDuration(startIso: string, endIso: string): string {
    const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.round((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1729] to-[#0a0a1a] text-white">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20">
            <Zap className="h-5 w-5 text-black" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">WattWise AI</h1>
            <p className="text-xs text-white/40">Smart load-shedding intelligence</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* ── Search Section ────────────────────────────────────────────── */}
        <section className="mb-10">
          <div className="mb-6 text-center">
            <h2 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Check Your Area&apos;s Schedule
            </h2>
            <p className="text-sm text-white/50">
              Enter your suburb to see the current load-shedding stage and upcoming outage windows.
            </p>
          </div>

          <div className="mx-auto flex max-w-xl gap-3">
            <div className="relative flex-1">
              <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                id="suburb-search-input"
                type="text"
                value={suburb}
                onChange={(e) => setSuburb(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Cape Town, Sandton, Durbanville..."
                className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.05] pl-10 pr-4 text-sm text-white placeholder:text-white/25 outline-none transition-all focus:border-amber-400/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-amber-400/20"
                disabled={loading}
              />
            </div>
            <Button
              id="suburb-search-button"
              onClick={handleSearch}
              disabled={loading || suburb.trim().length === 0}
              size="lg"
              className="h-11 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 font-semibold text-black shadow-lg shadow-amber-500/20 transition-all hover:from-amber-300 hover:to-orange-400 hover:shadow-amber-500/30 disabled:opacity-40 disabled:shadow-none"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span className="ml-1.5">{loading ? "Searching…" : "Search"}</span>
            </Button>
          </div>
        </section>

        {/* ── Error State ───────────────────────────────────────────────── */}
        {error && (
          <div
            id="schedule-error"
            className="mx-auto mb-8 flex max-w-xl items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.08] px-5 py-4 text-sm text-red-300"
          >
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
            <p>{error}</p>
          </div>
        )}

        {/* ── Results ───────────────────────────────────────────────────── */}
        {schedule && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stage + Area Header */}
            <div
              id="schedule-header"
              className="mb-6 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-widest text-white/40">
                    Area
                  </p>
                  <h3 className="text-xl font-bold">{schedule.name}</h3>
                  <p className="mt-0.5 text-sm text-white/50">{schedule.region}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    id="current-stage-badge"
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold shadow-lg ${
                      schedule.status === "No Load Shedding"
                        ? "bg-emerald-500/15 text-emerald-400 shadow-emerald-500/10"
                        : "bg-amber-500/15 text-amber-400 shadow-amber-500/10"
                    }`}
                  >
                    {schedule.status === "No Load Shedding" ? (
                      <Zap className="h-4 w-4" />
                    ) : (
                      <ZapOff className="h-4 w-4" />
                    )}
                    {schedule.status}
                  </div>
                </div>
              </div>

              {wasCached && (
                <p className="mt-3 text-xs text-white/30">
                  ⚡ Served from cache — data refreshes every hour
                </p>
              )}
            </div>

            {/* Outage Windows */}
            <div className="mb-8">
              <div className="mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-400" />
                <h4 className="text-sm font-semibold uppercase tracking-widest text-white/60">
                  Next Outage Windows
                </h4>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {schedule.events.map((event, i) => (
                  <div
                    key={i}
                    id={`outage-window-${i}`}
                    className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 transition-all hover:border-amber-400/20 hover:bg-white/[0.05]"
                  >
                    {/* Subtle gradient accent */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                    <div className="mb-3 flex items-center justify-between">
                      <span className="rounded-lg bg-amber-400/10 px-2.5 py-1 text-xs font-bold text-amber-400">
                        {event.note}
                      </span>
                      <span className="text-xs text-white/30">{formatDate(event.start)}</span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-2xl font-bold tracking-tight text-white">
                        {formatTime(event.start)}
                      </span>
                      <span className="text-white/30">→</span>
                      <span className="font-mono text-2xl font-bold tracking-tight text-white/70">
                        {formatTime(event.end)}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-white/40">
                      Duration: {formatDuration(event.start, event.end)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 3-Day Schedule Preview */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-white/40" />
                <h4 className="text-sm font-semibold uppercase tracking-widest text-white/60">
                  3-Day Schedule
                </h4>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {schedule.schedule.days.map((day) => (
                  <div
                    key={day.date}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4"
                  >
                    <p className="mb-3 text-sm font-bold">
                      {day.name}{" "}
                      <span className="font-normal text-white/40">{day.date}</span>
                    </p>
                    <div className="space-y-2">
                      {day.stages.map((slot, j) => (
                        <div
                          key={j}
                          className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2 text-xs"
                        >
                          <span className="font-mono font-medium">
                            {formatTime(slot.start)} – {formatTime(slot.end)}
                          </span>
                          <span className="text-amber-400/70">{slot.note}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Empty State ───────────────────────────────────────────────── */}
        {!schedule && !loading && !error && (
          <div className="mt-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.04]">
              <Zap className="h-7 w-7 text-white/20" />
            </div>
            <p className="text-sm text-white/30">
              Search for a suburb to view its load-shedding schedule
            </p>
          </div>
        )}

        {/* ── Device Panel ──────────────────────────────────────────────── */}
        <section className="mt-16">
          <div className="mb-6">
            <h2 className="mb-1 text-xl font-bold tracking-tight">
              IoT Device Dashboard
            </h2>
            <p className="text-sm text-white/50">
              Live simulated readings from your household devices.
            </p>
          </div>
          <DevicePanel />
          <RecommendPanel suburb={suburb || "Cape Town"} schedule={schedule as Record<string, unknown> | null} devices={[
            {name:"Geyser",wattage:3000,status:"on"},
            {name:"Washing Machine",wattage:2200,status:"off"},
            {name:"Fridge",wattage:150,status:"on"},
            {name:"Laptop Charger",wattage:65,status:"on"},
            {name:"Solar Inverter",wattage:800,status:"on"},
            {name:"Battery Backup",wattage:500,status:"on"},
            {name:"TV",wattage:120,status:"off"}
          ]} />
        </section>
      </main>
    </div>
  );
}
