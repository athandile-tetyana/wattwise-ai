# mission.md — WattWise AI

## Product Name
WattWise AI

## Tagline
Stop guessing. Start shifting. AI-powered load-shedding energy management for South African homes.

## Problem
South Africa experiences frequent, unpredictable load-shedding (Stages 1–8) that disrupts
daily life, damages appliances, and wastes energy. Households have no intelligent system
to tell them *when* to run high-draw appliances, *how* to prioritize backup power,
or *what* their simulated energy footprint looks like across an outage cycle.

## Solution
WattWise AI is a web dashboard that:
1. Pulls live load-shedding schedules via the EskomSePush API for any SA suburb
2. Simulates a household IoT device registry (smart plugs, solar inverter, battery backup, geyser, fridge)
3. Runs an AI recommendation engine (Claude API) that tells users exactly when to run each appliance,
   how to maximize battery/solar window, and flags risk appliances before an outage
4. Displays real-time simulated watt-hour consumption and savings estimates

## Target User
South African household — urban/suburban, likely has a small inverter or solar backup,
uses Eskom grid as primary power source.

## Hackathon Track
AI + Hardware Integration — VoltHacks 2026

## Success Metrics (for demo/judging)
- Live schedule fetch for a real SA suburb with correct stage display
- At least 5 simulated IoT devices with live sensor values
- AI generating actionable, time-specific recommendations before each outage
- Dashboard renders cleanly and is fully functional in a browser demo
- Submission assets complete: GitHub repo, demo video, architecture diagram, project description

## Out of Scope (for hackathon build)
- Real physical hardware integration
- Multi-user accounts / auth
- Payment / monetization
- Mobile app
