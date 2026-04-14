import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

/**
 * Subscribes to Supabase Realtime changes on collaborative tables
 * and invalidates the relevant React Query caches so the UI updates
 * live when other users make changes.
 */
export function useRealtimeSync() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel('realtime-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['tasks'] })
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['projects'] })
          queryClient.invalidateQueries({ queryKey: ['project'] })
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sections' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['sections'] })
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'project_shares' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['project-shares'] })
          queryClient.invalidateQueries({ queryKey: ['projects'] })
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'project_placements' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['placements'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])
}
