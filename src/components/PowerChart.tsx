"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Zap } from "lucide-react";

interface DataPoint {
  time: string;
  draw: number;
  generation: number;
  net: number;
}

function generateDataPoint(): DataPoint {
  const now = new Date();
  const time = now.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const draw = Math.round(2800 + Math.random() * 800);
  const generation = Math.round(1100 + Math.random() * 400);
  const net = draw - generation;
  return { time, draw, generation, net };
}

export default function PowerChart() {
  const [data, setData] = useState<DataPoint[]>(() =>
    Array.from({ length: 10 }, () => generateDataPoint())
  );

  useEffect(() => {
    const id = setInterval(() => {
      setData((prev) => {
        const next = [...prev, generateDataPoint()];
        return next.length > 20 ? next.slice(-20) : next;
      });
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center gap-2">
        <Zap className="h-5 w-5 text-amber-400" />
        <div>
          <h2 className="text-xl font-bold tracking-tight">Power Analytics</h2>
          <p className="text-sm text-white/50">Live household draw vs solar generation (updates every 5s)</p>
        </div>
      </div>
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="time" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} unit="W" />
            <Tooltip
              contentStyle={{ backgroundColor: "#0f1729", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }}
              labelStyle={{ color: "rgba(255,255,255,0.5)" }}
            />
            <Legend wrapperStyle={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }} />
            <Line type="monotone" dataKey="draw" stroke="#f59e0b" strokeWidth={2} dot={false} name="Total Draw (W)" />
            <Line type="monotone" dataKey="generation" stroke="#10b981" strokeWidth={2} dot={false} name="Generation (W)" />
            <Line type="monotone" dataKey="net" stroke="#6366f1" strokeWidth={2} dot={false} name="Net Draw (W)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
