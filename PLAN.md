# Plan: Job Application Tracker (Personal, Single-User)

A personal tool to track job applications through their lifecycle. Single user,
so we optimize for simplicity: no multi-tenancy, minimal auth, flat schema.

Stack (per `CLAUDE.first.md`): **Vite + React + TypeScript**, **Supabase**
(Postgres), **React Context** for state, **Vitest + React Testing Library**.

---

## Guiding principles

- **MVP first.** Ship the add → track → filter spine before any extras.
- **Vertical slices.** Each milestone is a full, demoable feature, not a layer.
- **Schema is the architecture.** Get the data model right before building UI.
- **Single-user means simple.** No RLS gymnastics, no sharing, no roles.
  (If you ever deploy publicly, revisit — see "Deferred decisions".)

---

## Data model (v1)

One core table. Status is an enum so the board columns are well-defined.

```sql
-- status lifecycle
create type application_status as enum (
  'saved',        -- found it, not applied yet
  'applied',
  'screen',       -- recruiter / phone screen
  'interview',
  'offer',
  'rejected',
  'archived'
);

create table applications (
  id            uuid primary key default gen_random_uuid(),
  company       text not null,
  role          text not null,
  status        application_status not null default 'saved',
  url           text,                          -- job posting link
  location      text,
  salary_note   text,                          -- free text, e.g. "₹X-Y"
  notes         text,
  applied_at    date,                          -- null until status >= applied
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index applications_status_idx on applications (status);
```

Optional v2 tables (don't build yet): `contacts`, `interview_events`,
`documents` (resume versions).

---

## Milestones

Build top to bottom. Each is independently testable.

### M0 — Scaffold (foundation)
- [ ] `npm create vite@latest` (React + TS template)
- [ ] Add Tailwind **or** CSS Modules — pick one, don't mix
- [ ] Install + configure Vitest + React Testing Library
- [ ] Install `@supabase/supabase-js`; create Supabase project
- [ ] `.env` with `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
      (never hardcode — per CLAUDE.first.md rule)
- [ ] `src/lib/supabase.ts` client singleton
- [ ] First migration: the `applications` table above
- [ ] Verify with a test query (insert one row, read it back)
- **Done when:** app runs, connects to Supabase, one test passes.

### M1 — Create + List (the spine)
- [ ] `ApplicationsContext` (fetch, list, loading/error state)
- [ ] List view: table or cards showing company / role / status
- [ ] "Add application" form (company, role, url, notes)
- [ ] Empty state when no applications
- [ ] Tests: render list, add adds a row, error path shows a message
- **Done when:** you can add an application and see it in the list.

### M2 — Edit / Update status / Delete
- [ ] Edit form (reuse the add form)
- [ ] Status change control (dropdown or quick-buttons)
- [ ] Auto-set `applied_at` when moving to "applied"
- [ ] Delete with confirm
- [ ] Tests for each mutation + the `applied_at` side effect
- **Done when:** full CRUD works against Supabase.

### M3 — Board / Filter view
- [ ] Filter list by status
- [ ] Optional: kanban board grouped by status column
- [ ] Sort by `applied_at` / `created_at`
- **Done when:** you can see "everything in interview stage" at a glance.

### M4 — Polish
- [ ] Loading skeletons / spinners
- [ ] Explicit error handling everywhere (no silent failures)
- [ ] Basic responsive layout
- [ ] Optional: simple counts (e.g. "12 applied, 3 interviewing")

---

## Conventions (from CLAUDE.first.md, made concrete)

- **Tests mirror source:** `Button.tsx` → `Button.test.tsx`. Run after changes.
- **Verification gate:** `npm run typecheck && npm test` before considering
  any change done. (Add both scripts to `package.json` in M0.)
- **Errors are explicit:** every Supabase call checks `error` and surfaces it.
- **No hardcoded secrets:** all keys via `import.meta.env.VITE_*`.
- **Branching:** never commit to `main` directly — feature branch + merge.

---

## Deferred decisions (v2+, write down so they don't haunt you)

| Topic | When it matters | Note |
|---|---|---|
| Auth | If you deploy publicly | Use Supabase Auth magic-link; add RLS scoped to `user_id` |
| Reminders / follow-up dates | After core works | Needs a date field + a "due soon" view |
| Resume/file attachments | v2 | Supabase Storage bucket |
| Analytics | v2 | Response rate, time-in-stage |
| Contacts / recruiter tracking | v2 | Separate `contacts` table |

---

## Suggested first session

1. M0 scaffold end-to-end (running app + DB connection + one green test).
2. Stop and confirm the skeleton before building features.

That keeps each step verifiable and avoids a half-built foundation.
