import { useEffect, useState } from 'react'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import { useTheme } from '../theme/ThemeContext.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { api, errorMessage } from '../api/client.js'
import { COUNTRIES, STATES } from '../data/locations.js'
import { AUDIENCES } from '../data/messages.js'

const THEMES = [
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
  { key: 'system', label: 'System' },
]

const EMPTY_PROFILE = { name: '', email: '', country: '', state: '', chapter: '', zone: '', event: '' }

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
  const { user, updateProfile, changePassword } = useAuth()
  const [form, setForm] = useState(EMPTY_PROFILE)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [msg, setMsg] = useState('')
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState('')

  useEffect(() => {
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      country: user?.country || '',
      state: user?.state || '',
      chapter: user?.chapter || '',
      zone: user?.zone || '',
      event: user?.event || '',
    })
  }, [user?.id, user?.name, user?.email, user?.country, user?.state, user?.chapter, user?.zone, user?.event])

  const stateOptions = STATES[form.country] || []

  const update = (key) => (e) => {
    const value = e.target.value
    setForm((f) => ({
      ...f,
      [key]: value,
      ...(key === 'country' ? { state: '' } : {}),
    }))
    setSaved(false)
  }

  const validate = () => {
    if (!form.name.trim()) return 'Please enter your full name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Please enter a valid email address.'
    if (!form.country) return 'Please select your country.'
    if (stateOptions.length && !form.state) return 'Please select your state.'
    if (!form.chapter.trim()) return 'Please enter your chapter.'
    if (!form.zone.trim()) return 'Please enter your zone.'
    return ''
  }

  const saveProfile = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) {
      setMsg(err)
      return
    }
    setSaving(true)
    setMsg('')
    try {
      await updateProfile({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        country: form.country,
        state: form.state.trim(),
        chapter: form.chapter.trim(),
        zone: form.zone.trim(),
        event: form.event,
      })
      setMsg('Profile saved.')
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    } catch (err2) {
      setMsg(errorMessage(err2))
    } finally {
      setSaving(false)
    }
  }

  const savePassword = async (e) => {
    e.preventDefault()
    if (!passwordForm.current || !passwordForm.next) {
      setPwMsg('Enter your current password and a new password.')
      return
    }
    if (passwordForm.next.length < 6) {
      setPwMsg('New password must be at least 6 characters.')
      return
    }
    if (passwordForm.next !== passwordForm.confirm) {
      setPwMsg('New passwords do not match.')
      return
    }
    setPwSaving(true)
    setPwMsg('')
    try {
      await changePassword({
        currentPassword: passwordForm.current,
        newPassword: passwordForm.next,
      })
      setPasswordForm({ current: '', next: '', confirm: '' })
      setPwMsg('Password changed.')
    } catch (err) {
      setPwMsg(errorMessage(err))
    } finally {
      setPwSaving(false)
    }
  }

  const exportData = async () => {
    try {
      const [bible, bookProgress, books, messages, souls, prayer, settings] = await Promise.all([
        api('/bible/progress'),
        api('/books/progress'),
        api('/books'),
        api('/messages'),
        api('/souls'),
        api('/prayer/sessions'),
        api('/settings'),
      ])
      const data = {
        exportedAt: new Date().toISOString(),
        user,
        bibleProgress: bible.progress,
        bookProgress: bookProgress.progress,
        books: books.books,
        messages: messages.entries,
        souls: souls.souls,
        prayerSessions: prayer.sessions,
        settings,
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `horemow-data-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      setMsg('Data exported successfully.')
    } catch (err) {
      setMsg(errorMessage(err))
    }
  }

  return (
    <AppShell>
      <main>
        <div className="bs-head">
          <div>
            <h1>Settings</h1>
            <p className="sub">Manage your profile, appearance and data.</p>
          </div>
        </div>

        {msg && <p className="bench-hint" style={{ color: 'var(--accent)', marginBottom: 14 }}>{msg}</p>}

        <Section title="Profile" sub="Update the details you registered with. These appear on your dashboard and reports.">
          <form className="profile-form" onSubmit={saveProfile} noValidate>
            <div className="field">
              <label htmlFor="profile-name">Full name <em>*</em></label>
              <input
                id="profile-name"
                className="input"
                type="text"
                placeholder="Your full name"
                value={form.name}
                onChange={update('name')}
              />
            </div>

            <div className="field">
              <label htmlFor="profile-email">Email address <em>*</em></label>
              <input
                id="profile-email"
                className="input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={update('email')}
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label htmlFor="profile-country">Country <em>*</em></label>
              <select id="profile-country" value={form.country} onChange={update('country')}>
                <option value="">Select country</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="profile-state">State / Region{stateOptions.length > 0 && <em> *</em>}</label>
              {stateOptions.length > 0 ? (
                <select id="profile-state" value={form.state} onChange={update('state')}>
                  <option value="">Select state</option>
                  {stateOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              ) : (
                <input
                  id="profile-state"
                  className="input"
                  type="text"
                  placeholder="Enter your state or region"
                  value={form.state}
                  onChange={update('state')}
                  autoComplete="address-level1"
                />
              )}
            </div>

            <div className="field">
              <label htmlFor="profile-chapter">Chapter <em>*</em></label>
              <input
                id="profile-chapter"
                className="input"
                type="text"
                placeholder="e.g. Lagos Central Chapter"
                value={form.chapter}
                onChange={update('chapter')}
              />
            </div>

            <div className="field">
              <label htmlFor="profile-zone">Zone <em>*</em></label>
              <input
                id="profile-zone"
                className="input"
                type="text"
                placeholder="e.g. Ikeja Zone"
                value={form.zone}
                onChange={update('zone')}
              />
            </div>

            <div className="field">
              <label htmlFor="profile-event">Event</label>
              <select id="profile-event" value={form.event} onChange={update('event')}>
                <option value="">Not specified</option>
                {AUDIENCES.map((a) => (
                  <option key={a.key} value={a.key}>{a.label}</option>
                ))}
              </select>
            </div>

            <button className="btn pri" type="submit" disabled={saving}>
              <Icon name="check" /> {saving ? 'Saving…' : saved ? 'Saved' : 'Save changes'}
            </button>
          </form>
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

        <Section title="Password" sub="Change the password you use to sign in.">
          <form className="profile-form" onSubmit={savePassword} noValidate>
            <div className="field">
              <label htmlFor="pw-current">Current password</label>
              <input
                id="pw-current"
                className="input"
                type="password"
                placeholder="Current password"
                value={passwordForm.current}
                onChange={(e) => setPasswordForm((f) => ({ ...f, current: e.target.value }))}
                autoComplete="current-password"
              />
            </div>
            <div className="field">
              <label htmlFor="pw-next">New password</label>
              <input
                id="pw-next"
                className="input"
                type="password"
                placeholder="At least 6 characters"
                value={passwordForm.next}
                onChange={(e) => setPasswordForm((f) => ({ ...f, next: e.target.value }))}
                autoComplete="new-password"
              />
            </div>
            <div className="field">
              <label htmlFor="pw-confirm">Confirm new password</label>
              <input
                id="pw-confirm"
                className="input"
                type="password"
                placeholder="Repeat new password"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm((f) => ({ ...f, confirm: e.target.value }))}
                autoComplete="new-password"
              />
            </div>
            <button className="btn pri" type="submit" disabled={pwSaving}>
              <Icon name="check" /> {pwSaving ? 'Changing…' : 'Change password'}
            </button>
            {pwMsg && <p className="bench-hint" style={{ color: 'var(--accent)', marginTop: 8 }}>{pwMsg}</p>}
          </form>
        </Section>

        <Section title="Data" sub="Your progress is stored on the server. Export a snapshot whenever you need one.">
          <div className="msg-form">
            <button className="btn out" type="button" onClick={exportData}><Icon name="file" /> Export data</button>
          </div>
        </Section>
      </main>
    </AppShell>
  )
}
