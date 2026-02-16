# Changelog

All notable changes to Todopus will be documented in this file.

## [Unreleased]

### Added
- README, consolidated SPEC, and this changelog

### Changed
- Renamed package from "opus" to "todopus"

### Infrastructure
- Created GitHub repository (github.com/redoswald/todopus)
- Connected Vercel to GitHub for automatic CI/CD deployments
- Configured environment variables for Production and Preview environments
- Added `.vercel/` to `.gitignore`

## [0.1.0] - 2026-02-14

### Added
- Initial project scaffolding (React + TypeScript + Vite + Tailwind)
- Supabase integration (auth, database)
- Landing page
- Auth flow (signup, login, sessions via Supabase Auth)
- Sidebar with project tree and smart views (Inbox, Today, Upcoming)
- Inbox view for uncategorized tasks
- Today and Upcoming views
- Completed tasks view
- Project CRUD with hierarchy
- Section CRUD within projects
- Task CRUD with subtasks
- Task editor with due dates, priority, recurrence
- Command palette
- Maestro AI assistant drawer
- Settings modal
- Initial Vercel deployment (CLI-based)
