import { useCallback, useEffect, useMemo, useState } from 'react'
import { BOOKS } from '../data/books.js'
import { useAdminBooks } from './admin.js'

const PROGRESS_KEY = 'horemow-book-progress'
const HIGHLIGHT_KEY = 'horemow-book-highlights'

function load(key) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

// Progress shape: { [bookId]: { chapter, page, completed, lastRead } }
export function useBookProgress() {
  const [progress, setProgress] = useState(() => load(PROGRESS_KEY))

  useEffect(() => {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
  }, [progress])

  const update = useCallback((bookId, patch) => {
    setProgress((prev) => ({
      ...prev,
      [bookId]: { ...(prev[bookId] || { chapter: 0, page: 0, completed: false }), ...patch, lastRead: Date.now() },
    }))
    // TODO: PATCH /api/books/:id/progress
  }, [])

  const markCompleted = useCallback((bookId, completed = true) => {
    update(bookId, { completed })
  }, [update])

  return { progress, update, markCompleted }
}

// Highlights shape: { [bookId]: [{ chapter, page, quote }] }
export function useHighlights(bookId) {
  const [all, setAll] = useState(() => load(HIGHLIGHT_KEY))

  useEffect(() => {
    window.localStorage.setItem(HIGHLIGHT_KEY, JSON.stringify(all))
  }, [all])

  const list = all[bookId] || []

  const add = useCallback((quote) => {
    setAll((prev) => ({
      ...prev,
      [bookId]: [...(prev[bookId] || []), quote],
    }))
    // TODO: POST /api/books/:id/highlights
  }, [bookId])

  const remove = useCallback((index) => {
    setAll((prev) => ({
      ...prev,
      [bookId]: (prev[bookId] || []).filter((_, i) => i !== index),
    }))
  }, [bookId])

  return { highlights: list, add, remove }
}

// All books: built-in + admin-added
export function useAllBooks() {
  const { books: custom } = useAdminBooks()
  return useMemo(() => [...BOOKS, ...custom], [custom])
}

export function bookStats(progress, books = BOOKS) {
  let pagesRead = 0
  let completed = 0
  for (const book of books) {
    const p = progress[book.id]
    if (p?.completed) completed += 1
    if (!p) continue
    for (let c = 0; c < p.chapter; c++) pagesRead += book.chapters[c].pages.length
    pagesRead += Math.min(p.page + 1, book.chapters[p.chapter]?.pages.length || 0)
  }
  return { pagesRead, completed }
}
