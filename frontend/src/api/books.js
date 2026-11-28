import { useCallback, useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, apiBlob } from './client.js'

export function bookStats(progress, books = []) {
  let completed = 0
  for (const book of books) {
    if (progress[book.id]?.completed) completed += 1
  }
  return { completed }
}

const BOOKS_KEY = ['books', 'all']
const PROGRESS_KEY = ['books', 'progress']

export function useAllBooks() {
  const query = useQuery({
    queryKey: BOOKS_KEY,
    queryFn: async () => (await api('/books')).books,
  })
  return query.data || []
}

// Covers are real images uploaded by an admin and served by the API. They need
// the auth header, so they are fetched as blobs instead of used as plain URLs.
export function useBookCovers(books) {
  const [covers, setCovers] = useState({})
  const urlsRef = useRef({})

  useEffect(() => {
    let active = true
    for (const book of books) {
      if (!book.coverUrl || urlsRef.current[book.id]) continue
      apiBlob(book.coverUrl)
        .then((blob) => {
          if (!active) return
          const url = URL.createObjectURL(blob)
          urlsRef.current[book.id] = url
          setCovers((current) => ({ ...current, [book.id]: url }))
        })
        .catch(() => {})
    }
    return () => { active = false }
  }, [books])

  useEffect(() => () => {
    Object.values(urlsRef.current).forEach((url) => URL.revokeObjectURL(url))
  }, [])

  return covers
}

export function useBookProgress() {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: PROGRESS_KEY,
    queryFn: async () => (await api('/books/progress')).progress,
  })

  const updateMutation = useMutation({
    mutationFn: ({ bookId, patch }) => api(`/books/${bookId}/progress`, {
      method: 'PATCH',
      body: patch,
    }),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(PROGRESS_KEY, (old) => ({ ...old, [variables.bookId]: data }))
      queryClient.invalidateQueries({ queryKey: ['reports', 'summary'] })
    },
  })
  const completeMutation = useMutation({
    mutationFn: ({ bookId, completed }) => api(`/books/${bookId}/complete`, {
      method: 'POST',
      body: { completed },
    }),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(PROGRESS_KEY, (old) => ({ ...old, [variables.bookId]: data }))
      queryClient.invalidateQueries({ queryKey: ['reports', 'summary'] })
    },
  })

  const update = useCallback((bookId, patch) => updateMutation.mutateAsync({ bookId, patch }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateMutation])
  const markCompleted = useCallback((bookId, completed = true) => completeMutation.mutateAsync({ bookId, completed }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [completeMutation])

  return {
    progress: query.data || {},
    loading: query.isLoading,
    update,
    markCompleted,
  }
}

export function useHighlights(bookId) {
  const queryClient = useQueryClient()
  const queryKey = ['books', bookId, 'highlights']
  const query = useQuery({
    queryKey,
    queryFn: async () => (await api(`/books/${bookId}/highlights`)).highlights,
    enabled: Boolean(bookId),
  })

  const addMutation = useMutation({
    mutationFn: (highlight) => api(`/books/${bookId}/highlights`, { method: 'POST', body: highlight }),
    onSuccess: (data) => queryClient.setQueryData(queryKey, data.highlights),
  })
  const removeMutation = useMutation({
    mutationFn: (index) => api(`/books/${bookId}/highlights/${index}`, { method: 'DELETE' }),
    onSuccess: (data) => queryClient.setQueryData(queryKey, data.highlights),
  })

  return {
    highlights: query.data || [],
    loading: query.isLoading,
    add: addMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
  }
}
