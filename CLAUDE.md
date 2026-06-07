# Project: Job Application Tracker

Personal, single-user app to track job applications through their lifecycle.

## Structure

- `/src` - React + TypeScript app (Vite)
- `/src/lib` - Supabase client + data repositories
- `/src/context` - React Context state (no Redux)
- `/src/components` - UI components (tests mirror source)
- `/supabase` - database migrations and types

State management: React Context (no Redux).

## Commands

- `npm run dev` - start the dev server
- `npm run typecheck` - type-check without emitting
- `npm test` - run the test suite once
- `npm test -- StatusBadge` - run a single test file by name

## Rules - Always Follow These

- Never commit directly to main.
- Never hardcode credentials - always use environment variables (`import.meta.env.VITE_*`).
- Always handle errors explicitly - no silent failures.
- Prefer explicit over clever - readable code beats compact code.

## Verification

- After code changes: run `npm run typecheck && npm test`.
- After UI changes: take a screenshot and compare to requirements.
- After database changes: verify with a test query.
- When uncertain: ask rather than assume.

See `.claude/rules/` for testing and database conventions.
