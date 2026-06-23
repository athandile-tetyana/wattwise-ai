# WattWise AI ⚡

> AI-powered load-shedding energy management dashboard for South African households.
> Built for VoltHacks 2026 — AI + Hardware Integration track.

## The Problem

South Africa is the only country in the world experiencing load-shedding at this scale. Millions of households lose power for 2-4 hours daily with no smart tools to help them manage their energy usage around outages.

## The Solution

WattWise AI combines real-time load-shedding schedules, simulated IoT device monitoring, and AI recommendations to tell South African households exactly what to do before, during, and after outages.

## Features

- **Schedule Search** — Search any SA suburb and see current stage, next 4 outage windows, and a 3-day schedule
- **Live Countdown Timer** — Ticking countdown to the next outage, turns red under 30 minutes
- **IoT Device Dashboard** — 7 simulated household devices with live wattage readings updating every 30 seconds
- **Power Analytics Chart** — Live line chart showing total draw vs solar generation vs net draw
- **AI Recommendations** — Gemini-powered advice like "Turn off your Geyser now — outage starts at 14:00"

## Tech Stack

- **Frontend** — Next.js 15, Tailwind CSS, shadcn/ui
- **Database** — Supabase (PostgreSQL)
- **AI Engine** — Google Gemini API
- **Schedule API** — EskomSePush API
- **Charts** — Recharts

## Getting Started

1. Clone the repo
2. Run `npm install`
3. Copy `.env.local.example` to `.env.local` and fill in your API keys
4. Run `npm run dev`

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ESKOMSEPUSH_API_KEY`
- `GEMINI_API_KEY`

## Built By

**Athandile Tetyana** — Solo developer, Cape Town, South Africa
Front-End AI Engineering Intern @ FlyRank AI 

---

*WattWise AI — Because every watt counts during load-shedding.*
