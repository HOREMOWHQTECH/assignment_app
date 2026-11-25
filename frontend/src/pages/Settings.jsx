import { useRef, useState } from 'react'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import { useTheme } from '../theme/ThemeContext.jsx'

const NAME_KEY = 'horemow-display-name'
const EXPORT_PREFIX = 'horemow-'

const THEMES = [
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
  { key: 'system', label: 'System' },
]

function Section({ title, sub, children }) {
  return (
    <section className="admin-section">
      <h2>{title}</h2>
      {sub && <p className="sub">{sub}</p>}
      {children}
    </section>
  )
}

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const [name, setName] = useState(() => window.localStorage.getItem(NAME_KEY) || '')
  const [saved, setSaved] = useState(false)
  const [msg, setMsg] = useState('')
  const fileRef = useRef(null)

  const saveName = () => {
    window.localStorage.setItem(NAME_KEY, name.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const exportData = () => {
    const data = {}
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)
      if (key?.startsWith(EXPORT_PREFIX)) {
        try { data[key] = JSON.parse(window.localStorage.getItem(key)) } catch { data[key] = window.localStorage.getItem(key) }
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `horemow-data-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMsg('Data exported successfully.')
  }

  const importData = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        let count = 0
        for (const [key, value] of Object.entries(data)) {
          if (key.startsWith(EXPORT_PREFIX)) {
            window.localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
            count += 1
          }
        }
        setMsg(`Imported ${count} data entries. Reload to see changes.`)
      } catch {
        setMsg('Invalid file — please choose a HOREMOW export.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const clearData = () => {
    if (!window.confirm('This will permanently delete ALL your progress, logs and settings on this device. Continue?')) return
    const keys = []
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)
      if (key?.startsWith(EXPORT_PREFIX) && key !== 'horemow-theme' && key !== 'horemow-app-settings') keys.push(key)
    }
    keys.forEach((k) => window.localStorage.removeItem(k))
    setMsg(`Cleared ${keys.length} data entries. Reload to refresh the app.`)
  }

  return (
    <AppShell>
      <main>
        <div className="bs-head">
          <div>
            <h1>Settings</h1>
            <p className="sub">Manage your profile, appearance and local data.</p>
          </div>
        </div>

        <Section title="Profile" sub="How your name appears in the app.">
          <div className="msg-form">
            <input
              type="text"
              placeholder="Display name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button className="btn pri" type="button" onClick={saveName}>
              <Icon name="check" /> {saved ? 'Saved' : 'Save'}
            </button>
          </div>
        </Section>

        <Section title="Appearance" sub="Choose how the app looks on this device.">
          <div className="role-toggle" style={{ maxWidth: 320 }}>
            {THEMES.map((t) => (
              <button key={t.key} type="button" className={theme === t.key ? 'on' : ''} onClick={() => setTheme(t.key)}>
                {t.label}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Data" sub="Your progress is stored locally on this device until the backend is connected.">
          <div className="msg-form">
            <button className="btn out" type="button" onClick={exportData}><Icon name="file" /> Export data</button>
            <button className="btn out" type="button" onClick={() => fileRef.current?.click()}><Icon name="plus" /> Import data</button>
            <button className="btn ghost" type="button" onClick={clearData} style={{ color: 'var(--amber)' }}><Icon name="trash" /> Clear all data</button>
            <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={importData} />
          </div>
          {msg && <p className="bench-hint" style={{ marginTop: 10 }}>{msg}</p>}
        </Section>
      </main>
    </AppShell>
  )
}
