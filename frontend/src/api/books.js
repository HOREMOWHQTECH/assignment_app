import { useCallback, useEffect, useState } from 'react'
import { BOOKS } from '../data/books.js'

const STORAGE_KEY = 'horemow-book-progress'

function load() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

// Shape: { [bookId]: { page: number, completed: boolean } }
export function useBookProgress() {
  const [progress, setProgress] = useState(load)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  }, [progress])

  const setPage = useCallback((bookId, page) => {
    setProgress((prev) => {
      const book = BOOKS.find((b) => b.id === bookId)
      const completed = book ? page >= book.pages.length - 1 : false
      return { ...prev, [bookId]: { page, completed } }
    })
    // TODO: POST /api/books/progress { bookId, page }
  }, [])

  return { progress, setPage }
}
