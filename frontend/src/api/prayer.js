import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client.js'

const KEY = ['prayer', 'sessions']

export function usePrayerSessions() {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: KEY,
    queryFn: async () => (await api('/prayer/sessions')).sessions,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: KEY })
    queryClient.invalidateQueries({ queryKey: ['reports', 'summary'] })
  }

  const addMutation = useMutation({
    mutationFn: (entry) => api('/prayer/sessions', { method: 'POST', body: entry }),
    onSuccess: invalidate,
  })
  const removeMutation = useMutation({
    mutationFn: (id) => api(`/prayer/sessions/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  })

  return {
    sessions: query.data || [],
    loading: query.isLoading,
    error: query.error,
    add: addMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
  }
}
