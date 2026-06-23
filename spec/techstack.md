# techstack.md — WattWise AI

## Frontend
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui components
- **Charts:** Recharts (energy usage graphs, schedule timeline)
- **Icons:** Lucide React

## Backend
- **API Routes:** Next.js API routes (no separate server)
- **AI Engine:** Anthropic Claude API (`claude-sonnet-4-6`) via `/api/recommend`
- **Schedule Fetching:** EskomSePush API v2 (free tier — 50 calls/day)
  - Endpoint: `https://developer.sepush.co.za/business/2.0/`
  - Auth: `Token` header with API key

## Database
- **Provider:** Supabase (standalone project, separate from PopiaGo)
- **Tables:**
  - `devices` — simulated IoT device registry (name, wattage, priority, category)
  - `schedules_cache` — cached EskomSePush responses (avoid rate limits)
  - `recommendations_log` — AI recommendation history per suburb/timestamp

## IoT Simulation Layer
- Device sensor values generated server-side on a 30-second interval via Next.js
  API route (`/api/devices/simulate`)
- Each device has: `current_draw_w`, `status` (on/off/standby), `last_seen`
- Simulation logic: devices fluctuate realistically within their wattage range
- No real hardware — all values are deterministic + randomized within bounds

## Simulated Device Registry (defaults)
| Device         | Category      | Wattage | Priority |
|----------------|---------------|---------|----------|
| Fridge         | Essential     | 150W    | High     |
| Geyser         | High-draw     | 3000W   | Low      |
| Laptop charger | Work          | 65W     | High     |
| TV             | Entertainment | 120W    | Medium   |
| Solar Inverter | Generation    | -800W   | Critical |
| Battery Backup | Storage       | -500W   | Critical |
| Washing Machine| High-draw     | 2200W   | Low      |

## Deployment
- **Platform:** Vercel (free tier)
- **Environment Variables:** `ANTHROPIC_API_KEY`, `ESKOMSEPUSH_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

## Dev Environment
- GitHub Codespaces (primary)
- Node.js 20+
- Package manager: npm
