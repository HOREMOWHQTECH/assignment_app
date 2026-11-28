import { useCallback, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client.js'

export function bibleStats(progress, books) {
  let done = 0
  let inProgress = 0
  let booksComplete = 0
  for (const book of books) {
    const chapters = progress[book.name] || {}
    const doneCount = Object.values(chapters).filter((status) => status === 'done').length
    done += doneCount
    inProgress += Object.values(chapters).filter((status) => status === 'progress').length
    if (doneCount === book.chapters) booksComplete += 1
  }
  return { done, inProgress, booksComplete }
}

const BOOKS_KEY = ['bible', 'books']
const PROGRESS_KEY = ['bible', 'progress']

export function useBibleBooks() {
  const query = useQuery({
    queryKey: BOOKS_KEY,
    queryFn: async () => (await api('/bible/books')).books,
  })
  return query.data || []
}

export function useBibleProgress() {
  const queryClient = useQueryClient()
  const books = useBibleBooks()
  const query = useQuery({
    queryKey: PROGRESS_KEY,
    queryFn: async () => (await api('/bible/progress')).progress,
  })

  const mutation = useMutation({
    mutationFn: ({ book, chapter, status }) => api('/bible/progress', {
      method: 'POST',
      body: { book, chapter, status },
    }),
    onSuccess: (data) => queryClient.setQueryData(PROGRESS_KEY, data.progress),
  })

  const cycleChapter = useCallback((bookName, chapter) => {
    const current = queryClient.getQueryData(PROGRESS_KEY)?.[bookName]?.[chapter]
    const status = !current ? 'done' : current === 'done' ? 'progress' : ''
    return mutation.mutateAsync({ book: bookName, chapter, status })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient])

  const progress = query.data || {}
  return {
    progress,
    loading: query.isLoading,
    cycleChapter,
    stats: useMemo(() => bibleStats(progress, books), [progress, books]),
  }
}
