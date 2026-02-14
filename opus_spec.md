# Opus — A Personal Task & Project Operating System

## Vision

A Todoist-like task manager with first-class support for AI-assisted planning. Built for personal use but designed for multiple users and project sharing from day one. The core insight: tasks need *context* (not just titles) so an AI can meaningfully review, prioritize, and schedule them.

**Name rationale:** "Opus" — a great work, composed of many smaller movements. Also: it's what you're building it with.

### Design Principles

1. **Multi-user from the start.** Every entity has an owner. Auth is baked into the data model, not bolted on later.
2. **Sharing is project-level.** You can share a project (and its tasks) with other users. You can't share individual tasks outside a project — that's what Inbox-to-project promotion is for.
3. **AI is personal.** AI features (daily plan, portfolio review) only see *your* tasks and projects, including shared ones. It never leaks another user's unshared data into your context.

---

## Architecture

### Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | React + TypeScript | Component-based, Claude Code friendly |
| Styling | Tailwind CSS | Utility-first, fast iteration |
| Backend | Node.js + Express | Simple REST API, same language as frontend |
| Database | SQLite via `better-sqlite3` | Zero-config, local-first, portable |
| Auth | Better-auth or Lucia | Lightweight session-based auth, supports OAuth later |
| Build | Vite | Fast dev server, simple config |
| AI (post-MVP) | Anthropic API | Claude for all AI features |

### Project Structure

```
opus/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── MainPanel.tsx
│   │   │   │   └── AppShell.tsx
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   ├── SignupPage.tsx
│   │   │   │   └── AuthGuard.tsx
│   │   │   ├── tasks/
│   │   │   │   ├── TaskItem.tsx
│   │   │   │   ├── TaskList.tsx
│   │   │   │   ├── TaskDetail.tsx
│   │   │   │   └── TaskEditor.tsx
│   │   │   ├── projects/
│   │   │   │   ├── ProjectView.tsx
│   │   │   │   ├── ProjectDescription.tsx
│   │   │   │   ├── ProjectTree.tsx
│   │   │   │   └── ShareProjectDialog.tsx
│   │   │   └── views/
│   │   │       ├── InboxView.tsx
│   │   │       ├── TodayView.tsx
│   │   │       └── UpcomingView.tsx
│   │   ├── hooks/
│   │   │   ├── useTasks.ts
│   │   │   ├── useProjects.ts
│   │   │   └── useViews.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── api/
│   │   │   └── client.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── index.html
├── server/
│   ├── index.ts             # Express app entry
│   ├── db/
│   │   ├── schema.sql       # SQLite schema
│   │   ├── seed.sql          # Optional sample data
│   │   └── connection.ts     # DB singleton
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── tasks.ts
│   │   ├── projects.ts
│   │   ├── sharing.ts
│   │   └── ai.ts            # Post-MVP
│   └── services/
│       ├── taskService.ts
│       ├── projectService.ts
│       ├── authService.ts
│       ├── sharingService.ts
│       └── aiService.ts     # Post-MVP
├── package.json
├── tsconfig.json
├── vite.config.ts
└── SPEC.md                  # This file
```

---

## Data Model

### Core Entities

#### Users

```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    email TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,     -- bcrypt
    avatar_url TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);
```

#### Projects

```sql
CREATE TABLE projects (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,              -- Markdown. The "Wikipedia-like" blurb.
    color TEXT DEFAULT '#808080',
    sort_order INTEGER DEFAULT 0,
    is_archived INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
```

#### Project Sharing

```sql
CREATE TABLE project_shares (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    shared_with_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission TEXT DEFAULT 'view' CHECK(permission IN ('view', 'edit', 'admin')),
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(project_id, shared_with_user_id)
);
```

**Sharing model:**
- `view` — can see the project, its tasks, and descriptions. Cannot modify anything.
- `edit` — can add/complete/modify tasks and sections. Cannot delete the project or change sharing.
- `admin` — full control, including sharing with others. Useful if you want Zoe to be able to invite a friend to a trip project.

**Sharing rules:**
- Sharing a parent project does NOT automatically share subprojects. Each is shared independently. This prevents accidental exposure (e.g., sharing a "Trips" parent shouldn't share your "Career Strategy" sibling).
- Tasks inherit visibility from their project. If you can see the project, you can see all its tasks.
- Inbox tasks (no project) are never visible to other users.
- Sharing is by email invite: you type an email, if the account exists they get access immediately. If not, the share is pending until they sign up.

Projects are hierarchical. A project with `parent_id = NULL` is a top-level project. Subprojects reference their parent. This mirrors Todoist's `# Projects > # Subproject` pattern from the screenshot.

**From the screenshot, Aaron's structure looks like:**
- My Projects
  - 🧱 Making (parent)
    - Coding (section-like, but could be subproject)
    - CRM (subproject with 8 tasks)
    - Personal Website (subproject)
  - Work Projects
  - 2025H1 Career Strategy
  - Trip projects (Cosy Cabin, NYC, California, Dolomites)
- Areas
  - Work, Spirituality, Date List, Altruism, Fitness/Hiking, etc.

#### Sections

```sql
CREATE TABLE sections (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);
```

Sections are visual dividers within a project (like "Coding" and "CRM" headers in the screenshot).

#### Tasks

```sql
CREATE TABLE tasks (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
    section_id TEXT REFERENCES sections(id) ON DELETE SET NULL,
    parent_task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,             -- Markdown. Rich context for AI review.
    status TEXT DEFAULT 'open' CHECK(status IN ('open', 'done', 'cancelled')),
    priority INTEGER DEFAULT 0 CHECK(priority BETWEEN 0 AND 3),
                                  -- 0=none, 1=low, 2=medium, 3=high
    due_date TEXT,                -- ISO date: '2026-03-15'
    due_time TEXT,                -- Optional time: '14:00'
    
    -- Recurrence
    recurrence_rule TEXT,         -- RRULE string, e.g. 'FREQ=WEEKLY;BYDAY=MO,TH'
    recurrence_base_date TEXT,    -- The anchor date for recurrence calculation
    
    -- Threading/dependencies (key differentiator from Todoist)
    blocked_by TEXT REFERENCES tasks(id) ON DELETE SET NULL,
    
    sort_order INTEGER DEFAULT 0,
    completed_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
```

**Key design decisions:**

1. **`description` is Markdown.** This is the critical difference from Todoist. Every task *can* have rich context: what it is, why it matters, what "done" looks like. This is what makes AI review possible.

2. **`blocked_by` creates threading.** A task can declare "I can't start until task X is done." This is simpler than a full DAG dependency graph but covers the primary use case: linear chains of work. If you need A → B → C, then C.blocked_by = B, B.blocked_by = A.

3. **`recurrence_rule` uses RRULE format** (from iCalendar RFC 5545). This is a well-specified standard that handles "every Monday and Thursday", "first of every month", "every 2 weeks", etc. Libraries exist to parse it.

4. **Tasks without a `project_id` live in the Inbox.**

#### Task Dependencies (many-to-many, for future use)

The `blocked_by` single-reference is MVP. If we need many-to-many later:

```sql
-- POST-MVP: Replace blocked_by column with this
CREATE TABLE task_dependencies (
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, depends_on)
);
```

#### Labels (optional, post-MVP)

```sql
CREATE TABLE labels (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    name TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#808080'
);

CREATE TABLE task_labels (
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    label_id TEXT NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, label_id)
);
```

---

## Views & UI

### Layout

```
┌──────────────────────────────────────────────────────────┐
│  Sidebar (280px)  │  Main Panel                          │
│                   │                                      │
│  + Add task       │  [View Title]                        │
│                   │                                      │
│  Inbox       (3)  │  ┌─ Project Description ──────────┐  │
│  Today      (12)  │  │ Short markdown blurb about     │  │
│  Upcoming         │  │ what this project is/produces.  │  │
│                   │  └────────────────────────────────┘  │
│  ─────────────    │                                      │
│  My Projects      │  Section: Coding                     │
│    ▸ Making       │  ○ Copy terminal setup               │
│      CRM     (8)  │  ○ Secret Hitler Harness             │
│      Website (3)  │                                      │
│    Work Proj (3)  │  Section: CRM                        │
│    Career   (61)  │  ○ Create dev backlog                │
│    Trips...       │    ○ Subtask here                    │
│                   │    ○ Another subtask                 │
│  Areas            │  ○ Add streaming/suspense            │
│    Work      (1)  │    ⊳ blocked by: "Create dev..."    │
│    Fitness   (3)  │                                      │
│    ...            │                                      │
└──────────────────────────────────────────────────────────┘
```

### Sidebar

- **Fixed-width left panel** (~280px), collapsible
- **Quick-add button** at top — opens inline task creator
- **Smart views:** Inbox, Today, Upcoming (with task counts as badges)
- **Project tree:** Expandable/collapsible. Shows project name + open task count. Drag to reorder (post-MVP).
- Active view/project is highlighted

### Smart Views

**Inbox:** Tasks where `project_id IS NULL`. These are uncategorized captures. The goal is to process these into projects regularly (or complete them).

**Today:** Tasks where `due_date = today` OR `due_date < today` (overdue). Sorted by priority desc, then due_time, then sort_order. Overdue tasks are visually distinct (red date badge).

**Upcoming:** Tasks where `due_date > today`, grouped by date. Shows next 14 days by default with a "load more" option.

### Project View

When a project is selected from the sidebar:

1. **Project description** at top — rendered Markdown, click-to-edit. This is the "Wikipedia blurb" that gives AI context.
2. **Sections** as collapsible headers
3. **Tasks** within sections, with:
   - Checkbox (circle) on the left
   - Task title (click to expand/edit)
   - Subtasks indented below parent
   - Dependency indicator: if `blocked_by` is set, show a small "⊳ blocked by: [task title]" in muted text
   - Due date badge on the right (color-coded: red=overdue, orange=today, gray=future)
4. **"+ Add task"** at the bottom of each section

### Task Detail / Editor

Clicking a task title opens an inline expanded view (not a modal — keep context visible):

- Title (editable, large text)
- Description (Markdown editor, medium text area)
- Project selector (dropdown)
- Section selector (dropdown, filtered to selected project)
- Due date picker
- Recurrence rule builder (simple UI: "Every [n] [day/week/month] on [days]")
- Priority selector (none / low / medium / high, with color dots)
- "Blocked by" selector (searchable dropdown of other open tasks)
- Subtask list (inline, can add subtasks here)

---

## API Design

### REST Endpoints

All endpoints except auth require a valid session cookie. All task/project endpoints are scoped to the authenticated user (owned + shared).

#### Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | Create account (email, password, display name) |
| POST | `/api/auth/login` | Login, returns session cookie |
| POST | `/api/auth/logout` | Destroy session |
| GET | `/api/auth/me` | Get current user info |

#### Tasks

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tasks` | List tasks. Query params: `project_id`, `section_id`, `status`, `due_before`, `due_after`, `inbox` (no project) |
| GET | `/api/tasks/:id` | Get single task with subtasks |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks/:id` | Update task fields |
| DELETE | `/api/tasks/:id` | Delete task (cascades to subtasks) |
| POST | `/api/tasks/:id/complete` | Mark complete (handles recurrence: if recurring, create next instance) |

#### Projects

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/projects` | List all projects (returns tree structure) |
| GET | `/api/projects/:id` | Get project with sections and tasks |
| POST | `/api/projects` | Create project |
| PATCH | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project (cascades) |

#### Sections

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/projects/:id/sections` | List sections for a project |
| POST | `/api/projects/:id/sections` | Create section |
| PATCH | `/api/sections/:id` | Update section |
| DELETE | `/api/sections/:id` | Delete section |

#### Views (computed)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/views/inbox` | Tasks with no project |
| GET | `/api/views/today` | Tasks due today + overdue |
| GET | `/api/views/upcoming?days=14` | Tasks due in next N days |

#### Sharing

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/projects/:id/shares` | List who a project is shared with |
| POST | `/api/projects/:id/shares` | Share project (body: `{ email, permission }`) |
| PATCH | `/api/projects/:id/shares/:shareId` | Update permission level |
| DELETE | `/api/projects/:id/shares/:shareId` | Revoke access |

**Authorization logic:** Every API call checks:
1. Is the user the `owner_id`? → full access
2. Is the user in `project_shares` for this project? → access per `permission` level
3. Neither? → 404 (not 403, to avoid leaking existence)

#### AI (post-MVP)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/ai/portfolio-review` | Cross-project review and prioritization |
| POST | `/api/ai/project-review/:id` | Within-project task analysis |
| POST | `/api/ai/daily-plan` | Generate today's recommended task order |

---

## Recurrence Logic

When a recurring task is completed:

1. Mark current instance as `status = 'done'`, `completed_at = now()`
2. Calculate next occurrence from `recurrence_rule` + `recurrence_base_date`
3. Create a new task with identical properties but:
   - New `id`
   - `due_date` = next occurrence
   - `status = 'open'`
   - `completed_at = NULL`

**Example RRULE values:**

| Human description | RRULE |
|-------------------|-------|
| Every Monday and Thursday | `FREQ=WEEKLY;BYDAY=MO,TH` |
| Every week on Saturday | `FREQ=WEEKLY;BYDAY=SA` |
| First of every month | `FREQ=MONTHLY;BYMONTHDAY=1` |
| Every 2 weeks | `FREQ=WEEKLY;INTERVAL=2` |
| Every day | `FREQ=DAILY` |

Use the `rrule` npm package for parsing and next-occurrence calculation.

---

## Dependency / Threading Behavior

When a task has `blocked_by` set:

- **Visual:** Show a dependency indicator on the blocked task (muted link to the blocking task)
- **Today view:** Blocked tasks still appear if due today, but are visually dimmed with a "blocked" badge
- **AI scheduling:** The AI daily planner should respect dependency order — never suggest a blocked task before its blocker
- **Completion cascade:** When a blocking task is completed, any tasks it was blocking become "unblocked" — no auto-notification in MVP, but the visual indicator updates

---

## AI Features (Post-MVP)

All AI features use the Anthropic API. The key insight: because tasks have descriptions (not just titles), the AI has enough context to reason about them.

### Level 1: Daily Planner

**Trigger:** User clicks "Plan my day" or it auto-generates on first open each day.

**Input to AI:**
- All tasks due today or overdue
- Tasks due this week (for context)
- Dependency graph for those tasks
- Current day/time
- Any recurring tasks for today

**AI prompt pattern:**
```
Here are the user's tasks for today. Consider:
- Dependencies (blocked tasks can't start until blockers are done)
- Priority levels
- Time sensitivity (deadlines)
- Task size (inferred from description complexity)
- Balance of task types (don't cluster all hard tasks together)

Produce an ordered list with brief reasoning.
```

**Output:** An ordered task list with optional time blocks and a one-line rationale per task.

### Level 2: Within-Project Review

**Trigger:** User clicks "Review this project" from project view.

**Input to AI:**
- Project name and description
- All tasks in the project (with descriptions, statuses, dates)
- Dependency graph within the project

**AI does:**
- Flags tasks missing descriptions or dates
- Suggests missing tasks (gaps in the plan)
- Identifies dependency chains that seem wrong
- Recommends priority adjustments
- Estimates if the project timeline is realistic

### Level 3: Portfolio Review

**Trigger:** User clicks "Review all projects" (weekly ritual).

**Input to AI:**
- All active (non-archived) projects with descriptions
- Task counts and upcoming deadlines per project
- Recently completed tasks (last 7 days)
- Stale projects (no task completions in 14+ days)

**AI does:**
- Identifies overcommitment (too many active projects)
- Flags stale projects and asks "still relevant?"
- Suggests which projects to prioritize this week
- Looks for cross-project conflicts (two deadlines same week)
- Recommends "park" or "archive" for zombie projects

---

## MVP Scope

### Phase 1: Core Task Management
- [ ] SQLite schema + Express API
- [ ] User auth (signup, login, sessions)
- [ ] Project CRUD with hierarchy (scoped to user)
- [ ] Section CRUD
- [ ] Task CRUD with subtasks
- [ ] Inbox / Today / Upcoming views
- [ ] Sidebar with project tree
- [ ] Task completion (non-recurring)

### Phase 2: Rich Features
- [ ] Task descriptions (Markdown)
- [ ] Project descriptions (Markdown)
- [ ] Recurrence rules + completion-creates-next
- [ ] Task dependencies (`blocked_by`)
- [ ] Due date picker + priority selector
- [ ] Dependency visualization
- [ ] Project sharing (invite by email, permission levels)
- [ ] Shared project indicators in sidebar

### Phase 3: AI Integration
- [ ] Daily planner
- [ ] Within-project review
- [ ] Portfolio review
- [ ] AI-suggested tasks

### Phase 4: Polish
- [ ] Keyboard shortcuts (q=quick add, etc.)
- [ ] Drag-and-drop reordering
- [ ] Search across all tasks
- [ ] Import from Todoist (API or CSV)
- [ ] Pending share invites (for emails not yet signed up)
- [ ] Dark mode

---

## Design Notes

### Visual Style

- Clean, minimal, warm — similar to Todoist's aesthetic
- White/light background, subtle borders
- Left sidebar: light gray background
- Task checkboxes: circles (not squares), color = priority
- Typography: System font stack, 14px base
- Accent color: Warm orange (like Todoist) or pick your own

### Interaction Patterns

- **Inline editing:** Click a task title to edit in place. No modals for basic edits.
- **Quick add:** Global shortcut (Cmd+K or similar) to add a task from anywhere
- **Completion animation:** Satisfying check animation, brief delay before task disappears (so you can undo)
- **Keyboard-first:** Arrow keys to navigate tasks, Enter to edit, Escape to close

---

## Running Locally

```bash
# Setup (from project root)
npm install

# Development
npm run dev          # Starts both Vite dev server + Express API

# Database
npm run db:init      # Creates SQLite DB + runs schema
npm run db:seed      # Optional: loads sample data
```

Environment variables (`.env`):
```
PORT=3001
DATABASE_PATH=./opus.db
SESSION_SECRET=<random-string>   # For signing session cookies
ANTHROPIC_API_KEY=sk-...         # Only needed for AI features
```
