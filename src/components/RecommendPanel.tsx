"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecommendPanelProps {
  suburb: string;
  schedule: Record<string, unknown> | null;
  devices: Record<string, unknown>[];
}

export default function RecommendPanel({ suburb, schedule, devices }: RecommendPanelProps) {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);

  async function handleGetRecommendations() {
    setLoading(true);
    setError(null);
    setRecommendations([]);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suburb: suburb || "Cape Town", schedule, devices }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to get recommendations");
      setRecommendations(json.recommendations);
      setIsMock(json.mock ?? false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">AI Recommendations</h2>
          <p className="text-sm text-white/50">Smart advice based on your schedule and devices.</p>
        </div>
        <Button
          onClick={handleGetRecommendations}
          disabled={loading}
          className="h-10 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 font-semibold text-black shadow-lg disabled:opacity-40"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lightbulb className="h-4 w-4 mr-2" />}
          {loading ? "Thinking…" : "Get AI Recommendations"}
        </Button>
      </div>
      {isMock && recommendations.length > 0 && (
        <p className="mb-3 text-xs text-white/30">Demo recommendations</p>
      )}
      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.08] px-5 py-4 text-sm text-red-300">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
          <p>{error}</p>
        </div>
      )}
      {recommendations.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {recommendations.map((rec, i) => (
            <Card key={i} className="border-white/[0.06] bg-white/[0.03]">
              <CardContent className="flex items-start gap-3 pt-5">
                <Lightbulb className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
                <p className="text-sm text-white/80">{rec}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
