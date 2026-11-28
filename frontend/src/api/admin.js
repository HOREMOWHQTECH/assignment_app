import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, apiForm } from './client.js'

function useConfig(key) {
  const queryClient = useQueryClient()
  const queryKey = ['admin', key]
  const query = useQuery({
    queryKey,
    queryFn: async () => (await api(`/admin/${key}`)).value,
  })
  const mutation = useMutation({
    mutationFn: (value) => api(`/admin/${key}`, { method: 'PUT', body: value }),
    onSuccess: (response) => queryClient.setQueryData(queryKey, response.value),
  })
  const set = (patch) => mutation.mutateAsync({
    ...(queryClient.getQueryData(queryKey) || {}),
    ...patch,
  })
  return { value: query.data || {}, set, loading: query.isLoading }
}

export function useAdminBooks() {
  const queryClient = useQueryClient()
  const queryKey = ['admin', 'books']
  const query = useQuery({
    queryKey,
    queryFn: async () => (await api('/admin/books')).books.filter((book) => book.custom),
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey })
    queryClient.invalidateQueries({ queryKey: ['books'] })
  }

  const addMutation = useMutation({
    mutationFn: ({ title, author, audiences = ['general'], file, cover }) => {
      const form = new FormData()
      form.append('title', title)
      form.append('author', author)
      audiences.forEach((audience) => form.append('audiences[]', audience))
      if (file) form.append('file', file)
      if (cover) form.append('cover', cover)
      return apiForm('/admin/books', form)
    },
    onSuccess: invalidate,
  })
  const removeMutation = useMutation({
    mutationFn: (id) => api(`/admin/books/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  })

  return {
    books: query.data || [],
    loading: query.isLoading,
    addBook: (data) => addMutation.mutateAsync(data).then((response) => response.book),
    removeBook: removeMutation.mutateAsync,
  }
}

export function useAdminBibleBooks() {
  const queryClient = useQueryClient()
  const queryKey = ['admin', 'bible-books']
  const query = useQuery({
    queryKey,
    queryFn: async () => (await api('/admin/bible-books')).books.filter((book) => book.custom),
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey })
    queryClient.invalidateQueries({ queryKey: ['bible', 'books'] })
  }

  const addMutation = useMutation({
    mutationFn: ({ name, chapters }) => api('/admin/bible-books', {
      method: 'POST',
      body: { name, chapters },
    }),
    onSuccess: invalidate,
  })
  const removeMutation = useMutation({
    mutationFn: (id) => api(`/admin/bible-books/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  })

  return {
    books: query.data || [],
    loading: query.isLoading,
    addBook: (name, chapters) => addMutation.mutateAsync({ name, chapters }).then((response) => response.book),
    removeBook: removeMutation.mutateAsync,
  }
}

export function useBenchmarks() {
  const { value, set, loading } = useConfig('benchmarks')
  return {
    benchmarks: value,
    loading,
    setBenchmark: (key, number) => set({ [key]: Math.max(0, parseInt(number, 10) || 0) }),
  }
}

export function useSoulTargets() {
  const { value, set, loading } = useConfig('soul-targets')
  return {
    targets: value,
    loading,
    setTarget: (key, number) => set({ [key]: Math.max(0, parseInt(number, 10) || 0) }),
  }
}

export function usePrayerTargets() {
  const { value, set, loading } = useConfig('prayer-targets')
  return {
    targets: value,
    loading,
    setTarget: (key, number) => set({ [key]: Math.max(0, parseInt(number, 10) || 0) }),
  }
}
