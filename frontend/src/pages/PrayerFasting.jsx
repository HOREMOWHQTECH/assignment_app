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
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
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

export default function PrayerFasting() {
  const { sessions, add, remove } = usePrayerSessions()
  const { targets } = usePrayerTargets()

  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const [timerEvents, setTimerEvents] = useState(['general'])
  const [manual, setManual] = useState({ minutes: '', events: ['general'] })
  const [error, setError] = useState('')
  const intervalRef = useRef(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  const perEvent = useMemo(() => {
    const map = {}
    for (const a of AUDIENCES) {
      const minutes = sessions.filter((s) => (s.events || []).includes(a.key)).reduce((n, s) => n + s.minutes, 0)
      const yearlyMin = (targets[a.key] || 0) * DAYS
      map[a.key] = { minutes, yearlyMin, pct: yearlyMin ? Math.min(100, Math.round((minutes / yearlyMin) * 100)) : 0 }
    }
    return map
  }, [sessions, targets])

  const totalMinutes = sessions.reduce((n, s) => n + s.minutes, 0)

  const toggleTimerEvent = (key) => {
    setTimerEvents((ev) => (ev.includes(key) ? ev.filter((a) => a !== key) : [...ev, key]))
  }
  const toggleManualEvent = (key) => {
    setManual((f) => ({
      ...f,
      events: f.events.includes(key) ? f.events.filter((a) => a !== key) : [...f.events, key],
    }))
  }

  const stopTimer = () => {
    setRunning(false)
    const minutes = Math.max(1, Math.round(seconds / 60))
    if (timerEvents.length) add({ minutes, events: timerEvents })
    setSeconds(0)
    setTimerEvents(['general'])
  }

  const submitManual = (e) => {
    e.preventDefault()
    const minutes = parseInt(manual.minutes, 10)
    if (!minutes || minutes <= 0) {
      setError('Enter the number of minutes prayed.')
      return
    }
    if (!manual.events.length) {
      setError('Select at least one event.')
      return
    }
    add({ minutes, events: manual.events })
    setManual({ minutes: '', events: ['general'] })
    setError('')
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
            <span className="bs-stat"><Icon name="flame" />{fmtHours(totalMinutes)} prayed</span>
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
                  <span className="bench-count">{fmtHours(minutes)} / {fmtHours(yearlyMin)}</span>
                </div>
                <div className="book-bar"><i style={{ width: `${pct}%` }} /></div>
                <span className="bench-hint">
                  {done ? 'Year complete!' : `${pct}% done · ${fmtHours(remaining)} remaining (${Math.round((remaining / yearlyMin) * 100)}%)`}
                </span>
              </div>
            )
          })}
        </div>

        <div className="prayer-grid">
          <section className="admin-section prayer-timer-card">
            <h2>Prayer timer</h2>
            <p className="sub">Start the timer while you pray — it saves automatically when you stop.</p>
            <div className="timer-display">{fmtClock(seconds)}</div>
            <div className="timer-controls">
              {!running ? (
                <button className="btn pri" type="button" onClick={() => setRunning(true)}>
                  <Icon name="play" /> {seconds > 0 ? 'Resume' : 'Start'}
                </button>
              ) : (
                <button className="btn out" type="button" onClick={() => setRunning(false)}>
                  <Icon name="stop" /> Pause
                </button>
              )}
              <button className="btn pri" type="button" onClick={stopTimer} disabled={seconds === 0}>
                <Icon name="check" /> Stop & save
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
              <input type="number" min="1" placeholder="Minutes prayed" value={manual.minutes} onChange={(e) => setManual((f) => ({ ...f, minutes: e.target.value }))} />
              <button className="btn pri" type="submit"><Icon name="plus" /> Add time</button>
            </form>
            <div className="tag-picker">
              <span className="tag-picker-label">Events:</span>
              {AUDIENCES.map((a) => (
                <button key={a.key} type="button" className={`book-tag pick ${a.key}${manual.events.includes(a.key) ? ' on' : ''}`} onClick={() => toggleManualEvent(a.key)}>{a.label}</button>
              ))}
            </div>
            {error && <p className="form-error">{error}</p>}
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
                <strong>{fmtHours(s.minutes)} of prayer</strong>
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
