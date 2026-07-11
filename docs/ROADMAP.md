# Intend Roadmap

## Completed

- [x] Project scaffolding (Vite + React + TypeScript + Tailwind)
- [x] Supabase setup with RLS policies
- [x] Authentication (signup, login, logout)
- [x] Projects CRUD with hierarchy (subprojects)
- [x] Sections within projects (table of contents style)
- [x] Tasks CRUD (create, complete, edit)
- [x] Project descriptions with Markdown rendering
- [x] Editable project names
- [x] Smart views: Inbox, Today, Upcoming
- [x] Sidebar with project tree navigation
- [x] Task descriptions with Markdown rendering and preview
- [x] Drag-and-drop tasks to projects/inbox in sidebar
- [x] Completed tasks view with history grouped by date
- [x] Editable completion dates (backdate completions)
- [x] Deadlines (hard deadline separate from scheduled due date)
- [x] Import from Todoist (projects, sections, tasks, completed tasks, deadlines)
- [x] Recurrence rule converter (Todoist natural language → RRULE)
- [x] Independent scrolling for sidebar and main content
- [x] Supabase CLI linked for migrations
- [x] Deploy to Vercel (tasks.doneintentionally.com)
- [x] Maestro AI panel — slide-in drawer with suggested prompts, free-form input, markdown responses
- [x] ⌘K command palette — search projects and views
- [x] aaronOS design system foundation (CSS vars, fonts, shadcn scaffold)
- [x] Sidebar three-zone layout with drag-to-resize and localStorage persistence
- [x] App switcher (Zone 1) and account menu dropdown (Zone 3)
- [x] Lucide icon migration (sidebar, AppShell, CommandPalette)
- [x] Toast notifications with undo for task and project actions
- [x] ⌘K enhanced — task search, project search, actions (Maestro, settings, new project)
- [x] Google avatar in sidebar + display name editing
- [x] Project drag-to-reorder with visual drop indicators
- [x] Project color picker via context menu
- [x] Project archive/unarchive + Archive view
- [x] Route-based settings page (`/settings`) — Profile, Maestro AI, Security, Apps, Data

---

## Next Up

### Tier 1 — Daily-Use Friction

- [x] ~~**Toast/undo system**~~ — Done. Global toast provider with undo on destructive actions
- [x] ~~**Quick-add from any view**~~ — Done. "+ Add task" on Today, Upcoming, and project pages. Context-aware: pre-fills current project and today's date. Sidebar "Add task" button is project-aware
- [x] ~~**Real settings page**~~ — Done. Route-based `/settings` with Profile, Maestro AI, Security, Apps, Data cards

### Tier 2 — Polish & Trust

- [x] ~~**Empty states**~~ — Done. Friendly zero-states for Inbox, Today, Upcoming, Completed, empty projects, and Maestro without API key
- [x] ~~**Loading skeletons**~~ — Done. Skeleton placeholders for task lists, project view, archive, and sidebar project tree
- [x] ~~**Save indicators**~~ — Done. Project descriptions auto-save (debounced) with Saving/Saved indicator; task editor saves on click-outside instead of discarding
- [x] ~~**Task delete undo**~~ — Done. Soft delete (`deleted_at`, migration 013) with cascade trigger; undo restores the original task with subtasks/dependencies/history
- [x] ~~**Task completion animation**~~ — Done. Checkbox fill + pop, strikethrough, brief delay before the task leaves the list

### Tier 3 — Power User

- [ ] Keyboard shortcuts beyond ⌘K — `j`/`k` navigation, `q` for quick-add, `c` to complete, `e` to edit, `?` for help overlay
- [ ] Filter tasks within a view — by priority, project, date range
- [ ] Sort tasks — by due date, priority, creation date
- [ ] Search across all tasks (extend ⌘K or dedicated search view)
- [ ] Labels/tags (schema exists, needs UI)
- [ ] Bulk task operations — multi-select + bulk complete, delete, reschedule, move

### Tier 4 — Task Enhancements

- [ ] Due time display (time can now be *set* in TaskEditor — shipped Jul 2026 alongside Attend; list views still don't show it)
- [ ] Task photo/image attachments
- [ ] `blocked_by` dependencies — visual indicator, prevent completing blocked tasks
- [x] ~~Subtasks rendering (data imported, needs UI)~~ — Done. TaskItem renders expandable nested subtask trees with open/total counts
- [x] ~~Recurring tasks completion logic (creates next instance)~~ — Done. RecurrenceBuilder UI, auto-spawns next occurrence on completion, recurrence indicator on tasks
- [ ] Due date quick-set buttons — "Today," "Tomorrow," "Next week" instead of raw date picker
- [ ] Natural language date parsing ("tomorrow", "next monday") — i.e. adopt Todoist-style smart date/time recognition in quick-add

### Tier 5 — Project Features

- [ ] Portfolio board — compare/look across multiple projects at once, kanban-style: columns per project (or per section), cards are tasks, with cross-project filters. Origin: wanting a "spec across the entire suite" view (Jul 2026)

- [x] ~~Archive/unarchive projects~~ — Done. Context menu + Archive view + undo toast
- [ ] Project progress indicator — "12 of 30 tasks complete" or progress bar
- [x] ~~Drag-and-drop reordering (projects)~~ — Done. Sidebar project reorder with drop indicators. Sections/tasks still TODO
- [ ] Project sharing (already in DB schema, needs UI)
- [ ] Project templates for recurring workflows

### Tier 6 — Cross-App & Infrastructure

- [x] ~~Unified account settings shared with Tend~~ — Done. /settings page with shared Supabase profile
- [x] ~~App switcher dropdown~~ — Done. Wired up in sidebar Zone 1 + Apps card on settings
- [ ] ~~Supabase Edge Functions for secure AI proxy (key never in browser)~~ — Dropped. Superseded by the Maestro teardown (see `../../docs/future-phases.md` Phase 1); no embedded AI means no key to proxy
- [x] ~~Maestro teardown — remove chat drawer, BYOK settings, `anthropic_api_key` column, browser-side Anthropic SDK (`dangerouslyAllowBrowser`)~~ — Done (Jul 2026). Code deleted, SDK uninstalled; migration 014 applied to prod (chat tables dropped)
- [x] ~~"Connect Intend to your AI" onboarding page~~ — Done (Jul 2026). Public `/connect` route with connector URL + per-client steps; linked from Settings AI card and the landing feature card. Backed by intend-mcp's multi-user OAuth (Supabase JWT + RLS) and MCP prompts, shipped same day
- [ ] AI handoff buttons — contextual "Plan this in Claude"-style deep links with prompts that reference the Intend MCP connector (web `claude.ai/new?q=` was removed Oct 2025 → use copy-prompt-to-clipboard + open, with `claude://` desktop deep link as enhancement). Remaining piece of `../../docs/future-phases.md` Phase 1
- [ ] Vite → Next.js migration — backlogged; sequenced *after* Tiers 3–4, or immediately if a feature needs server code. See `../../docs/future-phases.md` (Phase 2 + Sequencing) for rationale and the trigger rule
- [ ] Real-time sync (Supabase subscriptions)
- [ ] Data export (JSON/CSV)
- [ ] Dark mode

---

## Known Issues

- Task editor sometimes doesn't dismiss after saving — the task "sticks around" until refresh
- Task reminder popups/toasts aren't clickable — should open the task for editing
- MainPanel header doesn't update when project name is edited inline (need refresh)
- No error boundaries for graceful failure handling
- ~~Maestro context awareness — should scope to current project/view when opened~~ — Moot: Maestro is being torn down (see `../../docs/future-phases.md` Phase 1); context-scoping moves to the handoff prompt templates instead

---

## Tech Debt

- Add proper loading states to all data fetches (see: loading skeletons in Tier 2)
- Optimistic updates for task create/complete/delete
- Proper form validation
- Touch target audit — all interactive elements need ≥44px on mobile

---

## Scripts

Located in `/scripts/`:

- `import-todoist.ts` - Import projects, sections, and open tasks from Todoist
- `import-todoist-completed.ts` - Import completed task history from Todoist
- `update-deadlines.ts` - Sync deadlines from Todoist to existing tasks
- `query-completed.ts` - Query completed tasks (for debugging)
