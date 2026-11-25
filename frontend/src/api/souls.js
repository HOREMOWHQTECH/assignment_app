import { useCallback, useEffect, useState } from 'react'

const KEY = 'horemow-souls'

function load() {
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// Shape: [{ id, name, phone, address, note, tag, events: [], date }]
export function useSouls() {
  const [souls, setSouls] = useState(load)

  useEffect(() => {
    window.localStorage.setItem(KEY, JSON.stringify(souls))
  }, [souls])

  const add = useCallback((entry) => {
    setSouls((prev) => [{ id: crypto.randomUUID(), date: new Date().toISOString(), ...entry }, ...prev])
    // TODO: POST /api/souls
  }, [])

  const remove = useCallback((id) => {
    setSouls((prev) => prev.filter((s) => s.id !== id))
    // TODO: DELETE /api/souls/:id
  }, [])

  const update = useCallback((id, patch) => {
    setSouls((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
    // TODO: PUT /api/souls/:id
  }, [])

  return { souls, add, remove, update }
}
