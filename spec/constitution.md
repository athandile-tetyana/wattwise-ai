# constitution.md — WattWise AI

## Governance (Solo Builder Edition)

### Library-First
Use shadcn/ui, Recharts, and Supabase client libraries as-is.
Do not build custom chart components or custom UI primitives.

### CLI Interface Mandate
All builds run in GitHub Codespaces via Gemini CLI.
Claude = architecture, debugging escalation, spec authoring only.
Gemini CLI = primary build agent.

### Simplicity Gate
If a feature takes more than 1 session to implement, it gets cut or deferred.
Hackathon scope is fixed after Phase 0.

### Anti-Abstraction Gate
No custom ORM. Use Supabase JS client directly.
No custom state management library. React state + SWR for fetching is enough.

### Integration-First Testing
Test against real EskomSePush API from Day 1 of Phase 1.
Do not mock the API during development — only cache it.

### Spec Freeze
After Phase 0 is complete, mission.md, techstack.md, and roadmap.md are frozen.
No scope additions without a deliberate spec update session.
