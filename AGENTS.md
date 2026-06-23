# AGENTS.md — WattWise AI

## Quick Commands

- `npm run dev` — dev server with Turbopack (port 3000)
- `npm run build` — production build with Turbopack
- `npm run lint` — ESLint (next/core-web-vitals + next/typescript)
- No test suite yet. Do not assume one exists.

## Architecture

Next.js 15 App Router, single package (no monorepo). All source in `src/`.

```
src/
  app/
    page.tsx              — Client component: suburb search + schedule display
    layout.tsx            — Root layout (Geist fonts, metadata)
    api/schedule/route.ts — GET /api/schedule?suburb=... (Supabase cache + EskomSePush)
  lib/
    eskomsepush.ts        — Mock EskomSePush client (swap for real API later)
    supabase.ts           — createServerSupabaseClient() / createBrowserSupabaseClient()
    utils.ts              — cn() helper (clsx + tailwind-merge)
  components/
    ui/button.tsx         — shadcn/ui Button
spec/
  mission.md, techstack.md, roadmap.md, constitution.md — project spec (frozen after Phase 0)
```

## Key Patterns

- **Path alias:** `@/*` maps to `src/*` (configured in tsconfig.json)
- **Supabase client:** Use `createServerSupabaseClient()` in API routes (service role key), `createBrowserSupabaseClient()` in client components (anon key). Both in `src/lib/supabase.ts`.
- **Supabase tables:** `devices`, `schedules_cache`, `recommendations_log`
- **Styling:** Tailwind CSS v4 + shadcn/ui (base-nova style, lucide icons). Use `cn()` from `@/lib/utils` for class merging.
- **shadcn components:** Run `npx shadcn@latest add <component>` to add. Config at `components.json`.

## Env Vars

Required in `.env.local` (and Vercel):
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — client-side Supabase
- `SUPABASE_SERVICE_ROLE_KEY` — server-side Supabase (API routes only, never expose to client)
- `ESKOMSEPUSH_API_KEY` — EskomSePush API (currently empty, using mock data)
- `ANTHROPIC_API_KEY` — Claude API (Phase 3)
- `GEMINI_API_KEY` — unused in app, may be in env for build tooling

## Conventions

- `"use client"` at top of any component using React state or browser APIs
- API routes in `src/app/api/<path>/route.ts` (Next.js App Router convention)
- No custom ORM — use Supabase JS client directly per constitution
- No custom state management — React state + fetch is sufficient
- Dark theme by default (dark gradients in page.tsx)
- Mock data in `src/lib/eskomsepush.ts` — marked with TODO for real API swap

## EskomSePush Integration Notes

- Real API: `https://developer.sepush.co.za/business/2.0/`
- Free tier: 50 calls/day — cache aggressively (1hr TTL in `schedules_cache` table)
- Auth: `Token` header with `ESKOMSEPUSH_API_KEY`
- Two-step flow: search area ID → fetch schedule by area ID

## Phase Progress

Currently on **Phase 1** (EskomSePush mock integration). See `spec/roadmap.md` for full phases.
