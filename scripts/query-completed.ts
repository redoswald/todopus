#!/usr/bin/env npx tsx
/**
 * Quick script to query completed tasks
 * Usage: npx tsx scripts/query-completed.ts <EMAIL> <PASSWORD>
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function loadEnv() {
  const envPath = resolve(__dirname, '../.env')
  const envContent = readFileSync(envPath, 'utf-8')
  const lines = envContent.split('\n')

  let supabaseUrl = ''
  let supabaseKey = ''

  for (const line of lines) {
    if (line.startsWith('VITE_SUPABASE_URL=')) {
      supabaseUrl = line.slice('VITE_SUPABASE_URL='.length).trim()
    }
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.slice('VITE_SUPABASE_ANON_KEY='.length).trim()
    }
  }

  return { supabaseUrl, supabaseKey }
}

async function main() {
  const email = process.argv[2]
  const password = process.argv[3]

  if (!email || !password) {
    console.error('Usage: npx tsx scripts/query-completed.ts <EMAIL> <PASSWORD>')
    process.exit(1)
  }

  const { supabaseUrl, supabaseKey } = loadEnv()
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Login
  const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
  if (authError) {
    console.error('Login failed:', authError.message)
    process.exit(1)
  }

  // Count total completed tasks
  const { count } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'done')

  console.log(`\nTotal completed tasks: ${count}\n`)

  // Query recent completed tasks
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('title, completed_at, status')
    .eq('status', 'done')
    .order('completed_at', { ascending: false })
    .limit(30)

  if (error) {
    console.error('Query failed:', error.message)
    process.exit(1)
  }

  console.log(`Recent 30:\n`)

  for (const task of tasks) {
    const date = task.completed_at
      ? new Date(task.completed_at).toLocaleDateString('en-US', {
          weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
        })
      : 'No date'
    console.log(`  [${date}] ${task.title}`)
  }
}

main()
