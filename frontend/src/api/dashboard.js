import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client.js'

export function useDashboard({ event, audience } = {}) {
  const params = new URLSearchParams()
  if (event) params.set('event', event)
  if (audience) params.set('audience', audience)
  const query = params.toString()

  return useQuery({
    queryKey: ['dashboard', event || '', audience || ''],
    queryFn: () => api(`/dashboard${query ? `?${query}` : ''}`),
  })
}

export function useQuickLog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (action) => api('/logs', { method: 'POST', body: { action } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['logs'] })
    },
  })
}
