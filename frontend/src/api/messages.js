import { useCallback, useEffect, useState } from 'react'

const KEY = 'horemow-messages-log'

function load() {
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// Shape: [{ id, title, speaker, audience, date }]
export function useMessages() {
  const [entries, setEntries] = useState(load)

  useEffect(() => {
    window.localStorage.setItem(KEY, JSON.stringify(entries))
  }, [entries])

  const add = useCallback((entry) => {
    setEntries((prev) => [{ id: crypto.randomUUID(), date: new Date().toISOString(), ...entry }, ...prev])
    // TODO: POST /api/messages
  }, [])

  const remove = useCallback((id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
    // TODO: DELETE /api/messages/:id
  }, [])

  return { entries, add, remove }
}
