import { useCallback, useEffect, useState } from 'react'

const KEY = 'horemow-messages-listened'

function load() {
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// Shape: string[] of listened message ids
export function useMessages() {
  const [listened, setListened] = useState(load)

  useEffect(() => {
    window.localStorage.setItem(KEY, JSON.stringify(listened))
  }, [listened])

  const toggle = useCallback((id) => {
    setListened((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
    // TODO: POST /api/messages/:id/listened
  }, [])

  return { listened, toggle }
}
