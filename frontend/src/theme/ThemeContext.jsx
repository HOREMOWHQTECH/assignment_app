import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)
const MEDIA = '(prefers-color-scheme: dark)'

function systemTheme() {
  return window.matchMedia(MEDIA).matches ? 'dark' : 'light'
}

function getInitialTheme() {
  if (typeof window === 'undefined') return 'system'
  const stored = window.localStorage.getItem('horemow-theme')
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    const apply = () => {
      const effective = theme === 'system' ? systemTheme() : theme
      document.documentElement.dataset.theme = effective
    }
    apply()
    window.localStorage.setItem('horemow-theme', theme)

    if (theme !== 'system') return undefined
    const mq = window.matchMedia(MEDIA)
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [theme])

  const toggleTheme = () => setTheme((t) => {
    const effective = t === 'system' ? systemTheme() : t
    return effective === 'dark' ? 'light' : 'dark'
  })

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
