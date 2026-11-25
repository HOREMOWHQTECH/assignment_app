import { useCallback, useEffect, useState } from 'react'

const KEY = 'horemow-prayer-sessions'

function load() {
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// Shape: [{ id, minutes, events: [], date }]
export function usePrayerSessions() {
  const [sessions, setSessions] = useState(load)

  useEffect(() => {
    window.localStorage.setItem(KEY, JSON.stringify(sessions))
  }, [sessions])

  const add = useCallback((entry) => {
    setSessions((prev) => [{ id: crypto.randomUUID(), date: new Date().toISOString(), ...entry }, ...prev])
    // TODO: POST /api/prayer/sessions
  }, [])

  const remove = useCallback((id) => {
    setSessions((prev) => prev.filter((s) => s.id !== id))
    // TODO: DELETE /api/prayer/sessions/:id
  }, [])

  return { sessions, add, remove }
}
