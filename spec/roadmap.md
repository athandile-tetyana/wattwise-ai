# roadmap.md — WattWise AI

## Overview
Build window: June 2026 → September 5, 2026 (~10 weeks)
Effort: evenings + weekends around Grade 11 + FlyRank internship
Method: SDD — spec is source of truth, code is generated output via Gemini CLI

---

## Phase 0 — Project Setup (Week 1)
**Goal:** Repo, env, Supabase, API keys, Codespaces running

Tasks:
- [ ] Create GitHub repo `athandile-tetyana/WattWise-AI`
- [ ] Init Next.js 15 project with Tailwind + shadcn/ui
- [ ] Create Supabase project (standalone)
- [ ] Create `devices`, `schedules_cache`, `recommendations_log` tables
- [ ] Register for EskomSePush API key (developer.sepush.co.za)
- [ ] Set up all env vars in Codespaces + Vercel
- [ ] Deploy skeleton to Vercel (CI confirmed)
- [ ] Commit all spec files to `/spec` folder in repo

**Done when:** `npm run dev` works in Codespaces, Vercel deployment live, Supabase tables exist.

---

## Phase 1 — EskomSePush Integration (Week 2)
**Goal:** Real load-shedding data on screen

Tasks:
- [ ] Build `/api/schedule` route — fetches and caches suburb schedule from EskomSePush
- [ ] Build suburb search UI (text input → API call → display area name + stage)
- [ ] Build schedule timeline component (next 4 outage windows displayed)
- [ ] Cache results in `schedules_cache` table (TTL: 1 hour) to respect rate limits
- [ ] Handle API errors + fallback to cached data gracefully

**Done when:** Type "Cape Town" → see real current stage + next outage windows.

---

## Phase 2 — IoT Device Simulation Layer (Week 3–4)
**Goal:** Live simulated device dashboard

Tasks:
- [ ] Seed `devices` table with default 7-device registry
- [ ] Build `/api/devices/simulate` route — returns current sensor readings
- [ ] Build Device Panel UI — card per device showing live wattage, status, category
- [ ] Build total household draw meter (sum of active device draws)
- [ ] Build solar/battery state indicator (simulated generation vs consumption)
- [ ] Auto-refresh device readings every 30 seconds client-side

**Done when:** Dashboard shows 7 devices with live-updating watt readings and a total draw meter.

---

## Phase 3 — AI Recommendation Engine (Week 5–6)
**Goal:** Claude gives actionable energy advice tied to real outage schedule

Tasks:
- [ ] Build `/api/recommend` route — sends schedule + device state to Claude API
- [ ] Prompt engineering: Claude returns structured JSON recommendations per device
  - `action`: "run now" | "delay until" | "turn off" | "no change"
  - `reason`: one-sentence explanation
  - `urgency`: "high" | "medium" | "low"
- [ ] Build Recommendations Panel UI — card per recommendation with urgency badge
- [ ] Log recommendations to `recommendations_log` table
- [ ] Add "Refresh Advice" button (manual trigger)
- [ ] Test with multiple suburb scenarios + outage stages

**Done when:** With a real schedule loaded, Claude returns specific timed advice per device
(e.g. "Run geyser NOW — 2hr outage starts in 45 mins").

---

## Phase 4 — Dashboard UI Polish (Week 7–8)
**Goal:** Demo-ready, visually strong, judges-worthy

Tasks:
- [ ] Energy timeline chart (Recharts) — shows outage windows vs device usage over 24hrs
- [ ] Estimated kWh savings widget (how much battery/solar the AI saved you)
- [ ] Stage alert banner (prominent current load-shedding stage display)
- [ ] Responsive layout — works on desktop and mobile
- [ ] Dark mode (optional but strong for demo video aesthetics)
- [ ] Loading states, error states, empty states — all handled

**Done when:** Full demo flow works start to finish: enter suburb → see schedule → see devices
→ get AI recommendations → see energy chart. No broken states.

---

## Phase 5 — Submission Assets (Week 9–10, before Sep 5)
**Goal:** Complete VoltHacks submission package

Tasks:
- [ ] Record ~3 min demo video (OBS or Loom) — full flow, narrated
- [ ] Build architecture diagram (Excalidraw or similar)
- [ ] Write Devpost project description (problem, solution, tech, impact)
- [ ] Take screenshots / prototype images for submission gallery
- [ ] Ensure GitHub repo is public with clean README
- [ ] Submit on Devpost before Sep 5 @ 11:00pm GMT+2

**Done when:** Devpost submission is live and complete.

---

## Risk Register
| Risk | Mitigation |
|------|------------|
| EskomSePush free tier rate limit (50 calls/day) | Aggressive caching in Supabase |
| Claude API cost | Cap recommendations to manual triggers only, not auto |
| Grade 11 exam clashes | Phase 4+5 buffer weeks absorb delays |
| Scope creep | spec is frozen after Phase 0 — no new features mid-build |
