import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { UserSettings } from '@/types'

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      // If no settings exist yet, return defaults
      if (error?.code === 'PGRST116') {
        return {
          user_id: user.id,
          anthropic_api_key: null,
          maestro_enabled: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as UserSettings
      }

      if (error) throw error
      return data as UserSettings
    },
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: Partial<Pick<UserSettings, 'anthropic_api_key' | 'maestro_enabled'>>) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return data as UserSettings
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })
}

export function useHasApiKey() {
  const { data: settings } = useSettings()
  return !!settings?.anthropic_api_key
}
