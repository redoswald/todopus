# Intend

Todoist-like task manager, MCP-first for AI (bring your own assistant via `../intend-mcp`; no embedded AI). Built with React 18, TypeScript (strict), Tailwind CSS, Supabase (Postgres + Auth + RLS), Vite, and TanStack React Query. Deployed on Vercel.

## Commands

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run lint` — lint check
- `vercel --prod` — deploy directly from local without pushing

## Project Structure

- `src/components/` — React components
- `src/hooks/` — custom hooks (TanStack Query wrappers)
- `src/lib/` — utilities, Supabase client, helpers
- `src/contexts/` — React context providers
- `supabase/migrations/` — SQL migrations
- `docs/` — project documentation

## Conventions

- `@/` path alias maps to `src/`
- Custom hooks wrap TanStack React Query for all data fetching
- RLS enabled on all public tables
- Tailwind accent palette: orange
- No test framework yet

## Environment Variables

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Shared Supabase Database

The database is shared with the "Friends" app. PascalCase tables (`Contact`, `Event`, etc.) belong to Friends — do not modify them.

## Design System

The aaronOS design system has moved to the suite-level docs folder: `../docs/design-system.md` (i.e. `aaronOS/docs/design-system.md`). It applies to every app in the suite. Per-app personality and the orange accent palette are documented there.

## Deployment

Vercel auto-deploys on push to `main`. Use `vercel --prod` for direct local deploys.

## Task tracking
- Specs in docs/ are DESIGN docs — the what/why/constraints. They do not track state.
- Work items live in GitHub Issues; the cross-suite portfolio view is https://github.com/users/redoswald/projects/1
- To pick up work: `gh issue view <n>` for full context. Reference issues in PRs with "Fixes #<n>" so state updates on merge.
- Do not add task checklists back into spec files. Session-scratch todo lists are fine but must not be committed.
