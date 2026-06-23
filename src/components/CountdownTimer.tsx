"use client";

import { useEffect, useState } from "react";
import { Clock, ZapOff } from "lucide-react";

interface CountdownProps {
  events: { start: string; end: string; note: string }[];
}

function getTimeUntil(isoString: string) {
  const diff = new Date(isoString).getTime() - Date.now();
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { h, m, s, diff };
}

export default function CountdownTimer({ events }: CountdownProps) {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const id = setInterval(() => forceUpdate((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const upcoming = events
    .map((e) => ({ ...e, until: getTimeUntil(e.start) }))
    .filter((e) => e.until !== null)
    .sort((a, b) => a.until!.diff - b.until!.diff);

  const next = upcoming[0];

  if (!next) {
    return (
      <div className="mt-10 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 text-center">
        <p className="text-sm text-white/40">No upcoming outages in schedule</p>
      </div>
    );
  }

  const { h, m, s } = next.until!;
  const isUrgent = next.until!.diff < 30 * 60 * 1000;

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5 text-amber-400" />
        <div>
          <h2 className="text-xl font-bold tracking-tight">Next Outage Countdown</h2>
          <p className="text-sm text-white/50">Time remaining before load-shedding starts</p>
        </div>
      </div>
      <div className={`rounded-2xl border p-8 text-center transition-all ${
        isUrgent
          ? "border-red-500/30 bg-red-500/[0.05]"
          : "border-white/[0.06] bg-white/[0.03]"
      }`}>
        <div className="mb-3 flex items-center justify-center gap-2">
          <ZapOff className={`h-5 w-5 ${isUrgent ? "text-red-400" : "text-amber-400"}`} />
          <span className={`text-sm font-medium ${isUrgent ? "text-red-400" : "text-amber-400"}`}>
            {next.note} — outage starting soon
          </span>
        </div>
        <div className="flex items-center justify-center gap-4">
          {[{ val: h, label: "HRS" }, { val: m, label: "MIN" }, { val: s, label: "SEC" }].map(({ val, label }) => (
            <div key={label} className="flex flex-col items-center">
              <div className={`flex h-20 w-20 items-center justify-center rounded-2xl text-4xl font-bold font-mono tabular-nums ${
                isUrgent ? "bg-red-500/10 text-red-300" : "bg-white/[0.05] text-white"
              }`}>
                {String(val).padStart(2, "0")}
              </div>
              <span className="mt-2 text-xs text-white/30 tracking-widest">{label}</span>
            </div>
          ))}
        </div>
        {isUrgent && (
          <p className="mt-4 text-sm text-red-400 font-medium animate-pulse">
            ⚡ Less than 30 minutes — act now!
          </p>
        )}
      </div>
    </section>
  );
}
