# Intend — Structured QoL Audit

## What We're Working With

**Current state (from screenshots + past conversations):**
- Sidebar with Zone 1 (Intend logo), Zone 2 (nav + project tree), Zone 3 (avatar + settings gear)
- Navigation: Inbox, Today (with count badge), Upcoming, Completed, Maestro
- Project hierarchy with sections, sub-projects, and emoji support (🎨 Making)
- Task creation inline from Inbox — title, description (markdown), project assignment, scheduled date, deadline, priority (color dots)
- Project pages with wiki-like purpose/description at top, sections, and task list below
- Maestro AI panel slides in from right — portfolio review, daily planning, overdue check
- Settings is a modal with just the Anthropic API key
- Shared Supabase auth with Tend
- "Add task" in sidebar navigates to Inbox with inline creation form

---

> Roadmap and task tracking for this app lives in [GitHub Issues](https://github.com/redoswald/intend-web/issues) and the [Done Intentionally board](https://github.com/users/redoswald/projects/1).

---

## Intend-Specific Design Notes

**The "Add task" flow needs rethinking.** Currently it navigates to Inbox to show the creation form. This means if you're looking at your "Making" project and think "oh, I should add a task here," you have to leave, go to Inbox, create the task, assign it to Making, then navigate back. Every view should have a "+ Add task" affordance that pre-fills the current context (current project, today's date if on Today view, etc.).

**Maestro's position is good but the panel should be smarter.** The right-side slide-in is the right pattern (VS Code, Notion AI, Copilot all do this). But Maestro should be context-aware — if you open it from a project page, it should scope to that project. If you open it from Today, it should focus on today's plan.

**The API key situation needs a longer-term plan.** Storing the user's Anthropic key in Supabase and calling the API from the browser works, but it means the key is exposed in network requests. A lightweight server-side proxy (Supabase Edge Function or Vercel serverless function) that holds the key server-side and proxies requests would be more secure. Not urgent, but worth noting for when other people start using this.

**The project tree will get unwieldy.** You already have 3 top-level groups (Personal Projects, Projects, Areas) with nested sub-items. Consider collapsible sections (which you may already have) and potentially a "starred" or "favorites" concept so your most-used projects are always visible without scrolling.
