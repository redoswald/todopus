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

---

## Next Steps

### Task Enhancements
- [ ] Due time display (data imported, needs UI)
- [ ] `blocked_by` dependencies - show visual indicator, prevent completing blocked tasks
- [ ] Subtasks rendering (data imported, needs UI)
- [ ] Recurring tasks completion logic (creates next instance)

### UI Polish
- [ ] Fix sidebar profile display (shows "Loading..." sometimes)
- [ ] Sync MainPanel title when project name is edited
- [ ] Better task completion animation
- [ ] Keyboard shortcuts (q = quick add, etc.)
- [ ] Dark mode
- [ ] Mobile responsive improvements

### Quick Add
- [ ] Global quick-add modal (Cmd+K or similar)
- [ ] Natural language date parsing ("tomorrow", "next monday")
- [ ] Quick project/section assignment

### Project Features
- [ ] Project colors visible in more places
- [ ] Archive/unarchive projects
- [ ] Drag-and-drop reordering (projects, sections, tasks within a view)
- [ ] Project sharing (already in DB schema, needs UI)

### Views & Filters
- [ ] Search across all tasks
- [ ] Filter by priority, project, date range
- [ ] Labels/tags (schema exists, needs UI)

### AI Features (Post-MVP)
- [ ] Daily planner - AI suggests task order for today
- [ ] Within-project review - AI flags gaps, suggests tasks
- [ ] Portfolio review - AI identifies overcommitment, stale projects

### Infrastructure
- [ ] Deploy to Vercel
- [ ] Set up Supabase Edge Functions for AI features
- [ ] Real-time sync (Supabase subscriptions)

---

## Known Issues

- Sidebar profile sometimes shows "Loading..." until profile fetch completes
- MainPanel header doesn't update when project name is edited inline (need refresh)
- No error boundaries for graceful failure handling

---

## Tech Debt

- Remove unused imports flagged by TypeScript
- Add proper loading states to all data fetches
- Consider optimistic updates for better UX
- Add proper form validation

---

## Scripts

Located in `/scripts/`:

- `import-todoist.ts` - Import projects, sections, and open tasks from Todoist
- `import-todoist-completed.ts` - Import completed task history from Todoist
- `update-deadlines.ts` - Sync deadlines from Todoist to existing tasks
- `query-completed.ts` - Query completed tasks (for debugging)
