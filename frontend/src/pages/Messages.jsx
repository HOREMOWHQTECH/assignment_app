import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import { AUDIENCES, BENCHMARKS, MESSAGES } from '../data/messages.js'
import { useMessages } from '../api/messages.js'

const LABEL = Object.fromEntries(AUDIENCES.map((a) => [a.key, a.label]))

export default function Messages() {
  const { listened, toggle } = useMessages()
  const [audience, setAudience] = useState('all')

  const perAudience = useMemo(() => {
    const map = {}
    for (const a of AUDIENCES) {
      const count = MESSAGES.filter((m) => m.audience === a.key && listened.includes(m.id)).length
      map[a.key] = { count, target: BENCHMARKS[a.key] }
    }
    return map
  }, [listened])

  const messages = useMemo(
    () => (audience === 'all' ? MESSAGES : MESSAGES.filter((m) => m.audience === audience)),
    [audience],
  )

  const totalListened = listened.length

  return (
    <AppShell>
      <main>
        <div className="bs-head">
          <div>
            <h1>Messages</h1>
            <p className="sub">Listen to messages from our ministers and track your progress toward each benchmark.</p>
          </div>
          <div className="bs-stats">
            <span className="bs-stat"><Icon name="play" />{totalListened} listened</span>
            <span className="bs-stat"><Icon name="check" />{MESSAGES.length} available</span>
          </div>
        </div>

        <div className="bench-grid">
          {AUDIENCES.map((a) => {
            const { count, target } = perAudience[a.key]
            const pct = Math.min(100, Math.round((count / target) * 100))
            const done = count >= target
            return (
              <div key={a.key} className={`bench-card${done ? ' done' : ''}`}>
                <div className="bench-top">
                  <span className="bench-label">{a.label}</span>
                  <span className="bench-count">{count}/{target}</span>
                </div>
                <div className="book-bar"><i style={{ width: `${pct}%` }} /></div>
                <span className="bench-hint">{done ? 'Benchmark met!' : `${target - count} to go`}</span>
              </div>
            )
          })}
        </div>

        <div className="bs-filters">
          <div className="bs-tabs" role="tablist">
            <button type="button" role="tab" aria-selected={audience === 'all'} className={audience === 'all' ? 'on' : ''} onClick={() => setAudience('all')}>All</button>
            {AUDIENCES.map((a) => (
              <button key={a.key} type="button" role="tab" aria-selected={audience === a.key} className={audience === a.key ? 'on' : ''} onClick={() => setAudience(a.key)}>{a.label}</button>
            ))}
          </div>
        </div>

        <div className="msg-list">
          {messages.map((m, i) => {
            const isListened = listened.includes(m.id)
            return (
              <motion.div
                key={m.id}
                className={`msg-card${isListened ? ' listened' : ''}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
              >
                <button className="msg-play" type="button" aria-label={`Play ${m.title}`}>
                  <Icon name="play" />
                </button>
                <div className="msg-info">
                  <strong>{m.title}</strong>
                  <span>{m.speaker} · {m.duration}</span>
                  <em className={`book-tag ${m.audience}`}>{LABEL[m.audience]}</em>
                </div>
                <button
                  className={`btn sm ${isListened ? 'ghost' : 'pri'}`}
                  type="button"
                  onClick={() => toggle(m.id)}
                >
                  <Icon name={isListened ? 'check' : 'play'} /> {isListened ? 'Listened' : 'Mark listened'}
                </button>
              </motion.div>
            )
          })}
        </div>
      </main>
    </AppShell>
  )
}
