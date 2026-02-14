import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Task, Project, Section } from '@/types'
import type { MaestroContext } from '@/lib/maestro'

export function useMaestroContext() {
  return useQuery({
    queryKey: ['maestro-context'],
    queryFn: async (): Promise<MaestroContext> => {
      const today = new Date().toISOString().split('T')[0]

      // Fetch all data in parallel
      const [projectsRes, sectionsRes, tasksRes] = await Promise.all([
        supabase
          .from('projects')
          .select('*')
          .order('sort_order'),
        supabase
          .from('sections')
          .select('*')
          .order('sort_order'),
        supabase
          .from('tasks')
          .select('*, project:projects(id, name, color)')
          .eq('status', 'open')
          .order('sort_order'),
      ])

      if (projectsRes.error) throw projectsRes.error
      if (sectionsRes.error) throw sectionsRes.error
      if (tasksRes.error) throw tasksRes.error

      const projects = projectsRes.data as Project[]
      const sections = sectionsRes.data as Section[]
      const tasks = tasksRes.data as Task[]

      // Filter tasks into categories
      const inboxTasks = tasks.filter(t => t.project_id === null)
      const todayTasks = tasks.filter(t => t.due_date === today)
      const overdueTasks = tasks.filter(t => t.due_date && t.due_date < today)

      return {
        projects,
        sections,
        tasks,
        inboxTasks,
        todayTasks,
        overdueTasks,
      }
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
  })
}
