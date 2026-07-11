// One-off sweep: find recurring-task chains killed by the pre-fix iOS app
// (completed without spawning a successor). Report-only unless --revive.
// Usage: node scripts/sweep-dead-recurrence.mjs <env-file> [--revive]
import { createClient } from '@supabase/supabase-js'
import rrulePkg from 'rrule'
const { RRule } = rrulePkg
import { readFileSync } from 'fs'

const envFile = process.argv[2]
const revive = process.argv.includes('--revive')
// Chains the user already re-created under a new title
const skipTitles = new Set(
  process.argv.flatMap((a, i) => (a === '--skip' ? [process.argv[i + 1]] : []))
)

const env = {}
for (const line of readFileSync(envFile, 'utf8').split('\n')) {
  const m = line.match(/^"?([A-Z_]+)"?=(.*)$/)
  if (m) env[m[1]] = m[2].replace(/^"|"$/g, '').trim()
}

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY)
const userId = env.INTEND_USER_ID

const { data: tasks, error } = await supabase
  .from('tasks')
  .select('*')
  .eq('owner_id', userId)
  .not('recurrence_rule', 'is', null)
if (error) throw error

const { data: projects, error: pErr } = await supabase.from('projects').select('id, name')
if (pErr) throw pErr
const projName = Object.fromEntries(projects.map(p => [p.id, p.name]))

// Group instances into chains by (project, title); a chain is alive if any
// instance is still open.
const chains = new Map()
for (const t of tasks) {
  const key = `${t.project_id ?? 'inbox'}::${t.title}`
  if (!chains.has(key)) chains.set(key, [])
  chains.get(key).push(t)
}

function nextOccurrence(rruleString, afterDate) {
  const y = afterDate.getUTCFullYear()
  const m = String(afterDate.getUTCMonth() + 1).padStart(2, '0')
  const d = String(afterDate.getUTCDate()).padStart(2, '0')
  const rule = RRule.fromString(`DTSTART:${y}${m}${d}T000000Z\nRRULE:${rruleString}`)
  return rule.after(afterDate)
}

const dead = []
for (const list of chains.values()) {
  if (list.some(t => t.status === 'open' && !t.deleted_at)) continue
  const done = list
    .filter(t => t.status === 'done' && !t.deleted_at)
    .sort((a, b) => (a.completed_at ?? '').localeCompare(b.completed_at ?? ''))
  const last = done.at(-1)
  if (!last) continue // only cancelled instances — chain ended intentionally
  if (skipTitles.has(last.title)) continue
  // A soft-deleted successor (created after the last completion) means the
  // user deleted the spawned next occurrence — the chain was ended on
  // purpose, not eaten by the bug.
  if (list.some(t => t.deleted_at && t.created_at >= last.completed_at)) continue

  // Next due mirrors web semantics: first occurrence after max(due, today);
  // for long-dead chains that lands today/tomorrow rather than in the past.
  const todayNoon = new Date(new Date().toISOString().split('T')[0] + 'T12:00:00Z')
  const dueNoon = last.due_date ? new Date(last.due_date + 'T12:00:00Z') : todayNoon
  const after = dueNoon > todayNoon ? dueNoon : todayNoon
  let next
  try {
    next = nextOccurrence(last.recurrence_rule, after)
  } catch {
    next = null
  }
  dead.push({ last, nextDue: next ? next.toISOString().split('T')[0] : null, instances: list.length })
}
dead.sort((a, b) => (a.last.completed_at ?? '').localeCompare(b.last.completed_at ?? ''))

for (const { last, nextDue, instances } of dead) {
  console.log(JSON.stringify({
    title: last.title,
    project: projName[last.project_id] ?? 'Inbox',
    rule: last.recurrence_rule,
    last_due: last.due_date,
    died_at: last.completed_at,
    instances,
    would_revive_due: nextDue,
  }))
}
console.log(`\n${dead.length} dead chain(s) found.${revive ? '' : ' Run with --revive to recreate them.'}`)

if (revive) {
  for (const { last, nextDue } of dead) {
    if (!nextDue) {
      console.log(`SKIP (unparsable rule): ${last.title}`)
      continue
    }
    const { error: insErr } = await supabase.from('tasks').insert({
      owner_id: last.owner_id,
      title: last.title,
      description: last.description,
      project_id: last.project_id,
      section_id: last.section_id,
      parent_task_id: last.parent_task_id,
      priority: last.priority,
      due_date: nextDue,
      due_time: last.due_time,
      recurrence_rule: last.recurrence_rule,
      recurrence_base_date: last.recurrence_base_date,
      sort_order: last.sort_order,
    })
    console.log(insErr ? `FAILED: ${last.title}: ${insErr.message}` : `REVIVED: ${last.title} (due ${nextDue})`)
  }
}
