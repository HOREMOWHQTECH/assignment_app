import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client.js'

const KEY = ['settings']

export function useAppSettings() {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: KEY,
    queryFn: () => api('/settings'),
  })

  const mutation = useMutation({
    mutationFn: ({ key, enabled }) => api('/admin/settings', {
      method: 'PUT',
      body: { modules: { [key]: enabled } },
    }),
    onSuccess: (response) => queryClient.setQueryData(KEY, response.value),
  })

  return {
    settings: query.data || { modules: {} },
    loading: query.isLoading,
    setModule: (key, enabled) => mutation.mutateAsync({ key, enabled }),
  }
}
