import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client.js'

const KEY = ['messages']

export function useMessages() {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: KEY,
    queryFn: async () => (await api('/messages')).entries,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: KEY })
    queryClient.invalidateQueries({ queryKey: ['reports', 'summary'] })
  }

  const addMutation = useMutation({
    mutationFn: (entry) => api('/messages', { method: 'POST', body: entry }),
    onSuccess: invalidate,
  })
  const removeMutation = useMutation({
    mutationFn: (id) => api(`/messages/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  })

  return {
    entries: query.data || [],
    loading: query.isLoading,
    error: query.error,
    add: addMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
  }
}
