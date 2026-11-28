import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import { AUDIENCES } from '../data/messages.js'
import { usePrayerSessions } from '../api/prayer.js'
import { usePrayerTargets } from '../api/admin.js'

const LABEL = Object.fromEntries(AUDIENCES.map((a) => [a.key, a.label]))
const DAYS = 365

function fmtClock(totalSeconds) {
  const value = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(value / 3600)
  const m = Math.floor((value % 3600) / 60)
  const s = value % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

function fmtDuration(totalSeconds) {
  const value = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(value / 3600)
  const m = Math.floor((value % 3600) / 60)
  const s = value % 60
  if (h) return `${h}h ${m}m ${s}s`
  if (m) return `${m}m ${s}s`
  return `${s}s`
}

function fmtHours(minutes) {
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h === 0) return `${m}m`
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return ''
  }
}

function secondsOf(session) {
  if (Number.isFinite(session.seconds)) return session.seconds
  return Math.round((session.minutes || 0) * 60)
}

export default function PrayerFasting() {
  const { sessions, add, remove } = usePrayerSessions()
  const { targets } = usePrayerTargets()

  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const [saving, setSaving] = useState(false)
  const [timerEvents, setTimerEvents] = useState(['general'])
  const [manual, setManual] = useState({ minutes: '', events: ['general'] })
  const [error, setError] = useState('')

  // Wall-clock anchors avoid the drift caused by incrementing a counter in
  // setInterval, and stay correct when the browser throttles background tabs.
  const accumulatedRef = useRef(0)
  const startedAtRef = useRef(null)

  useEffect(() => {
    const id = setInterval(() => {
      if (startedAtRef.current === null) return
      const elapsed = accumulatedRef.current + (Date.now() - startedAtRef.current)
      setSeconds(Math.floor(elapsed / 1000))
    }, 100)
    return () => clearInterval(id)
  }, [])

  const perEvent = useMemo(() => {
    const map = {}
    for (const a of AUDIENCES) {
      const totalSeconds = sessions
        .filter((s) => (s.events || []).includes(a.key))
        .reduce((n, s) => n + secondsOf(s), 0)
      const minutes = totalSeconds / 60
      const yearlyMin = (targets[a.key] || 0) * DAYS
      map[a.key] = { minutes, yearlyMin, pct: yearlyMin ? Math.min(100, Math.round((minutes / yearlyMin) * 100)) : 0 }
    }
    return map
  }, [sessions, targets])

  const totalSeconds = sessions.reduce((n, s) => n + secondsOf(s), 0)

  const startTimer = () => {
    startedAtRef.current = Date.now()
    setRunning(true)
  }

  const pauseTimer = () => {
    if (startedAtRef.current === null) return 0
    accumulatedRef.current += Date.now() - startedAtRef.current
    startedAtRef.current = null
    const value = Math.floor(accumulatedRef.current / 1000)
    setSeconds(value)
    setRunning(false)
    return value
  }

  const resetTimer = () => {
    accumulatedRef.current = 0
    startedAtRef.current = null
    setSeconds(0)
    setRunning(false)
  }

  const stopTimer = async () => {
    if (saving) return
    const value = Math.floor(
      (accumulatedRef.current + (startedAtRef.current === null ? 0 : Date.now() - startedAtRef.current)) / 1000,
    )
    if (value < 1) return resetTimer()

    setSaving(true)
    try {
      await add({ seconds: value, events: timerEvents })
      resetTimer()
      setTimerEvents(['general'])
    } catch (err) {
      setError(err?.message || 'Could not save prayer time. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const toggleTimerEvent = (key) => {
    setTimerEvents((ev) => (ev.includes(key) ? ev.filter((a) => a !== key) : [...ev, key]))
  }
  const toggleManualEvent = (key) => {
    setManual((f) => ({
      ...f,
      events: f.events.includes(key) ? f.events.filter((a) => a !== key) : [...f.events, key],
    }))
  }

  const submitManual = async (e) => {
    e.preventDefault()
    const minutes = Number(manual.minutes)
    if (!Number.isFinite(minutes) || minutes <= 0) {
      setError('Enter the number of minutes prayed.')
      return
    }
    if (!manual.events.length) {
      setError('Select at least one event.')
      return
    }
    setSaving(true)
    try {
      await add({ seconds: Math.round(minutes * 60), events: manual.events })
      setManual({ minutes: '', events: ['general'] })
      setError('')
    } catch (err) {
      setError(err?.message || 'Could not save prayer time. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell>
      <main>
        <div className="bs-head">
          <div>
            <h1>Prayer & Fasting</h1>
            <p className="sub">Log your prayer time — use the timer or enter minutes manually. Targets are set per event by the admin.</p>
          </div>
          <div className="bs-stats">
            <span className="bs-stat"><Icon name="flame" />{fmtDuration(totalSeconds)} prayed</span>
            <span className="bs-stat"><Icon name="check" />{sessions.length} sessions</span>
          </div>
        </div>

        <div className="bench-grid">
          {AUDIENCES.map((a) => {
            const { minutes, yearlyMin, pct } = perEvent[a.key]
            const done = pct >= 100
            const remaining = Math.max(0, yearlyMin - minutes)
            return (
              <div key={a.key} className={`bench-card${done ? ' done' : ''}`}>
                <div className="bench-top">
                  <span className="bench-label">{a.label}</span>
                  <span className="bench-count">{fmtDuration(minutes * 60)} / {fmtHours(yearlyMin)}</span>
                </div>
                <div className="book-bar"><i style={{ width: `${pct}%` }} /></div>
                <span className="bench-hint">
                  {yearlyMin === 0
                    ? 'No target set for this event.'
                    : done
                      ? 'Year complete!'
                      : `${pct}% done · ${fmtDuration(remaining * 60)} remaining (${Math.round((remaining / yearlyMin) * 100)}%)`}
                </span>
              </div>
            )
          })}
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="prayer-grid">
          <section className="admin-section prayer-timer-card">
            <h2>Prayer timer</h2>
            <p className="sub">Start the timer while you pray — it saves automatically when you stop.</p>
            <div className="timer-display">{fmtClock(seconds)}</div>
            <div className="timer-controls">
              {!running ? (
                <button className="btn pri" type="button" onClick={startTimer} disabled={saving}>
                  <Icon name="play" /> {seconds > 0 ? 'Resume' : 'Start'}
                </button>
              ) : (
                <button className="btn out" type="button" onClick={pauseTimer} disabled={saving}>
                  <Icon name="stop" /> Pause
                </button>
              )}
              <button className="btn pri" type="button" onClick={stopTimer} disabled={seconds === 0 || saving}>
                <Icon name="check" /> {saving ? 'Saving…' : 'Stop & save'}
              </button>
            </div>
            <div className="tag-picker">
              <span className="tag-picker-label">Count toward:</span>
              {AUDIENCES.map((a) => (
                <button key={a.key} type="button" className={`book-tag pick ${a.key}${timerEvents.includes(a.key) ? ' on' : ''}`} onClick={() => toggleTimerEvent(a.key)}>{a.label}</button>
              ))}
            </div>
          </section>

          <section className="admin-section">
            <h2>Log manually</h2>
            <p className="sub">Already prayed? Enter the time and it counts toward your benchmarks.</p>
            <form className="msg-form" onSubmit={submitManual}>
              <input type="number" min="1" step="1" placeholder="Minutes prayed" value={manual.minutes} onChange={(e) => setManual((f) => ({ ...f, minutes: e.target.value }))} />
              <button className="btn pri" type="submit" disabled={saving}><Icon name="plus" /> Add time</button>
            </form>
            <div className="tag-picker">
              <span className="tag-picker-label">Events:</span>
              {AUDIENCES.map((a) => (
                <button key={a.key} type="button" className={`book-tag pick ${a.key}${manual.events.includes(a.key) ? ' on' : ''}`} onClick={() => toggleManualEvent(a.key)}>{a.label}</button>
              ))}
            </div>
          </section>
        </div>

        <div className="msg-list">
          {sessions.map((s, i) => (
            <motion.div
              key={s.id}
              className="msg-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
            >
              <div className="msg-info">
                <strong>{fmtClock(secondsOf(s))} of prayer</strong>
                <span>{fmtDate(s.date)}</span>
                <span className="book-tags">
                  {(s.events || []).map((a) => (
                    <em key={a} className={`book-tag ${a}`}>{LABEL[a]}</em>
                  ))}
                </span>
              </div>
              <button className="btn ghost sm" type="button" onClick={() => remove(s.id)} aria-label="Delete session">
                <Icon name="trash" />
              </button>
            </motion.div>
          ))}
          {sessions.length === 0 && (
            <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '32px 0' }}>
              No prayer time logged yet — start the timer or add time manually.
            </p>
          )}
        </div>
      </main>
    </AppShell>
  )
}
