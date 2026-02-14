import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface Section {
  id: string
  project_id: string
  name: string
  sort_order: number
  created_at: string
}

export function useSections(projectId: string | undefined) {
  return useQuery({
    queryKey: ['sections', projectId],
    queryFn: async () => {
      if (!projectId) return []

      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .eq('project_id', projectId)
        .order('sort_order')

      if (error) throw error
      return data as Section[]
    },
    enabled: !!projectId,
  })
}

export function useCreateSection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ projectId, name }: { projectId: string; name: string }) => {
      // Get max sort_order for this project
      const { data: existing } = await supabase
        .from('sections')
        .select('sort_order')
        .eq('project_id', projectId)
        .order('sort_order', { ascending: false })
        .limit(1)

      const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0

      const { data, error } = await supabase
        .from('sections')
        .insert({
          project_id: projectId,
          name,
          sort_order: nextOrder,
        })
        .select()
        .single()

      if (error) throw error
      return data as Section
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sections', data.project_id] })
    },
  })
}

export function useUpdateSection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from('sections')
        .update({ name })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Section
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sections', data.project_id] })
    },
  })
}

export function useDeleteSection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      // First, move all tasks in this section to no section
      await supabase
        .from('tasks')
        .update({ section_id: null })
        .eq('section_id', id)

      const { error } = await supabase
        .from('sections')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { id, projectId }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sections', data.projectId] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
