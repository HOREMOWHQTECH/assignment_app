import { useCallback, useEffect, useState } from 'react'

const KEY = 'horemow-app-settings'

const DEFAULTS = {
  modules: {
    bibleStudy: true,
    books: true,
    messages: true,
    soulWinning: true,
    prayer: true,
    reports: true,
  },
}

function load() {
  try {
    const raw = window.localStorage.getItem(KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return { modules: { ...DEFAULTS.modules, ...(parsed.modules || {}) } }
  } catch {
    return DEFAULTS
  }
}

// Global app settings controlled by admin (module visibility, etc.)
export function useAppSettings() {
  const [settings, setSettings] = useState(load)

  useEffect(() => {
    window.localStorage.setItem(KEY, JSON.stringify(settings))
  }, [settings])

  const setModule = useCallback((key, enabled) => {
    setSettings((p) => ({ ...p, modules: { ...p.modules, [key]: !!enabled } }))
    // TODO: PUT /api/admin/settings
  }, [])

  return { settings, setModule }
}
