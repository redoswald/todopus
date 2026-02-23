# Opus Roadmap

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
- [x] Deploy to Vercel (opus.aaronos.ai)
- [x] Maestro AI panel — slide-in drawer with suggested prompts, free-form input, markdown responses
- [x] ⌘K command palette — search projects and views
- [x] aaronOS design system foundation (CSS vars, fonts, shadcn scaffold)
- [x] Sidebar three-zone layout with drag-to-resize and localStorage persistence
- [x] App switcher (Zone 1) and account menu dropdown (Zone 3)
- [x] Lucide icon migration (sidebar, AppShell, CommandPalette)

---

## Next Up

### Tier 1 — Daily-Use Friction

- [ ] **Toast/undo system** — Global toast provider. Show feedback on task create, complete, delete. Undo button on destructive actions (5-second window). Foundation for many other features
- [ ] **Quick-add from any view** — Inline "+ Add task" on Today, project pages, and sections. Pre-fill context (current project, today's date on Today view). Stop navigating to Inbox to create tasks
- [ ] **Real settings page** — Replace API key modal with a proper `/settings` route. Sections: Account (name, email, password), AI/Integrations (API key), and eventually Appearance

### Tier 2 — Polish & Trust

- [ ] **Empty states** — Friendly zero-states for Inbox, Today, Upcoming, Completed, empty projects, and Maestro without API key
- [ ] **Loading skeletons** — Skeleton placeholders for task lists, project tree, Today view while data fetches
- [ ] **Save indicators** — Auto-save with "Saved"/"Saving..." feedback for project descriptions and task notes. Silent loss of edits is unacceptable
- [ ] **Task delete undo** — Trash icon exists but needs undo toast. Soft delete (`deleted_at` column) so nothing is truly gone
- [ ] **Task completion animation** — Satisfying check animation, brief delay before task disappears from active lists

### Tier 3 — Power User

- [ ] Keyboard shortcuts beyond ⌘K — `j`/`k` navigation, `q` for quick-add, `c` to complete, `e` to edit, `?` for help overlay
- [ ] Filter tasks within a view — by priority, project, date range
- [ ] Sort tasks — by due date, priority, creation date
- [ ] Search across all tasks (extend ⌘K or dedicated search view)
- [ ] Labels/tags (schema exists, needs UI)
- [ ] Bulk task operations — multi-select + bulk complete, delete, reschedule, move

### Tier 4 — Task Enhancements

- [ ] Due time display (data imported, needs UI)
- [ ] `blocked_by` dependencies — visual indicator, prevent completing blocked tasks
- [ ] Subtasks rendering (data imported, needs UI)
- [ ] Recurring tasks completion logic (creates next instance)
- [ ] Due date quick-set buttons — "Today," "Tomorrow," "Next week" instead of raw date picker
- [ ] Natural language date parsing ("tomorrow", "next monday")

### Tier 5 — Project Features

- [ ] Archive/unarchive projects — "Finished" ≠ "erased"
- [ ] Project progress indicator — "12 of 30 tasks complete" or progress bar
- [ ] Drag-and-drop reordering (projects, sections, tasks within a view)
- [ ] Project sharing (already in DB schema, needs UI)
- [ ] Project templates for recurring workflows

### Tier 6 — Cross-App & Infrastructure

- [ ] Unified account settings shared with All Friends
- [ ] App switcher dropdown (currently single-app, wire up when All Friends is ready)
- [ ] Supabase Edge Functions for secure AI proxy (key never in browser)
- [ ] Real-time sync (Supabase subscriptions)
- [ ] Data export (JSON/CSV)
- [ ] Dark mode

---

## Known Issues

- MainPanel header doesn't update when project name is edited inline (need refresh)
- No error boundaries for graceful failure handling
- Maestro context awareness — should scope to current project/view when opened

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
