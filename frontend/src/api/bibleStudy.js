import { useCallback, useEffect, useMemo, useState } from 'react'
import { BIBLE_BOOKS } from '../data/bible.js'
import { useAdminBibleBooks } from './admin.js'

const STORAGE_KEY = 'horemow-bible-progress'

function loadProgress() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

// Shape: { [bookName]: { [chapterNumber]: 'done' | 'progress' } }
export function useBibleProgress() {
  const [progress, setProgress] = useState(loadProgress)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  }, [progress])

  const cycleChapter = useCallback((bookName, chapter) => {
    setProgress((prev) => {
      const book = { ...(prev[bookName] || {}) }
      const current = book[chapter]
      if (!current) book[chapter] = 'done'
      else if (current === 'done') book[chapter] = 'progress'
      else delete book[chapter]
      return { ...prev, [bookName]: book }
    })
    // TODO: POST /api/bible-study/log { book, chapter, status }
  }, [])

  const stats = useMemo(() => bibleStats(progress, BIBLE_BOOKS), [progress])

  return { progress, cycleChapter, stats }
}

// All bible books: canonical + admin-added
export function useBibleBooks() {
  const { books: custom } = useAdminBibleBooks()
  return useMemo(() => [...BIBLE_BOOKS, ...custom], [custom])
}

export function bibleStats(progress, books) {
  let done = 0
  let inProgress = 0
  let booksComplete = 0
  for (const book of books) {
    const chapters = progress[book.name] || {}
    const doneCount = Object.values(chapters).filter((s) => s === 'done').length
    const progCount = Object.values(chapters).filter((s) => s === 'progress').length
    done += doneCount
    inProgress += progCount
    if (doneCount === book.chapters) booksComplete += 1
  }
  return { done, inProgress, booksComplete }
}
