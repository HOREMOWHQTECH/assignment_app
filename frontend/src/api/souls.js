import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client.js'

const KEY = ['souls']

export function useSouls() {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: KEY,
    queryFn: async () => (await api('/souls')).souls,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: KEY })
    queryClient.invalidateQueries({ queryKey: ['reports', 'summary'] })
  }

  const addMutation = useMutation({
    mutationFn: (entry) => api('/souls', { method: 'POST', body: entry }),
    onSuccess: invalidate,
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, patch }) => api(`/souls/${id}`, { method: 'PUT', body: patch }),
    onSuccess: invalidate,
  })
  const removeMutation = useMutation({
    mutationFn: (id) => api(`/souls/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  })

  return {
    souls: query.data || [],
    loading: query.isLoading,
    error: query.error,
    add: addMutation.mutateAsync,
    update: (id, patch) => updateMutation.mutateAsync({ id, patch }),
    remove: removeMutation.mutateAsync,
  }
}
