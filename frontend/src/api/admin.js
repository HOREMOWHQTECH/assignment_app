import { useCallback, useEffect, useState } from 'react'
import { createBook } from '../data/books.js'
import { createBibleBook } from '../data/bible.js'
import { BENCHMARKS } from '../data/messages.js'

const BOOKS_KEY = 'horemow-admin-books'
const BIBLE_KEY = 'horemow-admin-bible-books'
const BENCH_KEY = 'horemow-benchmarks'
const SOUL_KEY = 'horemow-soul-targets'
const PRAYER_KEY = 'horemow-prayer-targets'

function load(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function useStoredList(key) {
  const [items, setItems] = useState(() => load(key, []))
  useEffect(() => window.localStorage.setItem(key, JSON.stringify(items)), [key, items])
  const add = useCallback((item) => setItems((p) => [...p, item]), [])
  const remove = useCallback((id) => setItems((p) => p.filter((i) => i.id !== id)), [])
  return { items, add, remove }
}

// Admin-added library books
export function useAdminBooks() {
  const { items, add, remove } = useStoredList(BOOKS_KEY)
  const addBook = useCallback((data) => {
    const book = createBook(data)
    add(book)
    return book
  }, [add])
  return { books: items, addBook, removeBook: remove }
}

// Admin-added bible books
export function useAdminBibleBooks() {
  const { items, add, remove } = useStoredList(BIBLE_KEY)
  const addBook = useCallback((name, chapters) => add(createBibleBook(name, chapters)), [add])
  return { books: items, addBook, removeBook: remove }
}

// Benchmark overrides per audience
export function useBenchmarks() {
  const [benchmarks, setBenchmarks] = useState(() => ({ ...BENCHMARKS, ...load(BENCH_KEY, {}) }))
  useEffect(() => window.localStorage.setItem(BENCH_KEY, JSON.stringify(benchmarks)), [benchmarks])
  const setBenchmark = useCallback((key, value) => {
    setBenchmarks((p) => ({ ...p, [key]: Math.max(0, parseInt(value, 10) || 0) }))
  }, [])
  return { benchmarks, setBenchmark }
}

// Soul-winning targets per event (set by admin)
export function useSoulTargets() {
  const [targets, setTargets] = useState(() => ({ general: 50, women: 30, ministries: 20, youth: 60, ...load(SOUL_KEY, {}) }))
  useEffect(() => window.localStorage.setItem(SOUL_KEY, JSON.stringify(targets)), [targets])
  const setTarget = useCallback((key, value) => {
    setTargets((p) => ({ ...p, [key]: Math.max(0, parseInt(value, 10) || 0) }))
  }, [])
  return { targets, setTarget }
}

// Daily prayer minutes required per event (members 60, leaders 90 by default)
export function usePrayerTargets() {
  const [targets, setTargets] = useState(() => ({ general: 60, women: 60, ministries: 90, youth: 60, ...load(PRAYER_KEY, {}) }))
  useEffect(() => window.localStorage.setItem(PRAYER_KEY, JSON.stringify(targets)), [targets])
  const setTarget = useCallback((key, value) => {
    setTargets((p) => ({ ...p, [key]: Math.max(0, parseInt(value, 10) || 0) }))
  }, [])
  return { targets, setTarget }
}
