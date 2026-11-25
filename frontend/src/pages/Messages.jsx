import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import { AUDIENCES } from '../data/messages.js'
import { useMessages } from '../api/messages.js'
import { useBenchmarks } from '../api/admin.js'

const LABEL = Object.fromEntries(AUDIENCES.map((a) => [a.key, a.label]))

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return ''
  }
}

function tagsOf(entry) {
  return entry.audiences || (entry.audience ? [entry.audience] : ['general'])
}

export default function Messages() {
  const { entries, add, remove } = useMessages()
  const { benchmarks } = useBenchmarks()
  const [audience, setAudience] = useState('all')
  const [form, setForm] = useState({ title: '', speaker: '', audiences: ['general'] })
  const [error, setError] = useState('')

  const perAudience = useMemo(() => {
    const map = {}
    for (const a of AUDIENCES) {
      map[a.key] = entries.filter((e) => tagsOf(e).includes(a.key)).length
    }
    return map
  }, [entries])

  const messages = useMemo(
    () => (audience === 'all' ? entries : entries.filter((e) => tagsOf(e).includes(audience))),
    [entries, audience],
  )

  const toggleTag = (key) => {
    setForm((f) => ({
      ...f,
      audiences: f.audiences.includes(key)
        ? f.audiences.filter((a) => a !== key)
        : [...f.audiences, key],
    }))
  }

  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.speaker.trim()) {
      setError('Please enter both the message title and speaker.')
      return
    }
    if (!form.audiences.length) {
      setError('Select at least one event.')
      return
    }
    add({ title: form.title.trim(), speaker: form.speaker.trim(), audiences: form.audiences })
    setForm({ title: '', speaker: '', audiences: ['general'] })
    setError('')
  }

  return (
    <AppShell>
      <main>
        <div className="bs-head">
          <div>
            <h1>Messages</h1>
            <p className="sub">Log the messages you have listened to and track progress toward each benchmark.</p>
          </div>
          <div className="bs-stats">
            <span className="bs-stat"><Icon name="play" />{entries.length} logged</span>
          </div>
        </div>

        <div className="bench-grid">
          {AUDIENCES.map((a) => {
            const count = perAudience[a.key]
            const target = benchmarks[a.key]
            const pct = target ? Math.min(100, Math.round((count / target) * 100)) : 0
            const done = target > 0 && count >= target
            return (
              <div key={a.key} className={`bench-card${done ? ' done' : ''}`}>
                <div className="bench-top">
                  <span className="bench-label">{a.label}</span>
                  <span className="bench-count">{count}/{target}</span>
                </div>
                <div className="book-bar"><i style={{ width: `${pct}%` }} /></div>
                <span className="bench-hint">{done ? 'Benchmark met!' : `${Math.max(0, target - count)} to go`}</span>
              </div>
            )
          })}
        </div>

        <form className="msg-form" onSubmit={submit}>
          <input
            type="text"
            placeholder="Message title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            aria-label="Message title"
          />
          <input
            type="text"
            placeholder="Speaker"
            value={form.speaker}
            onChange={(e) => setForm((f) => ({ ...f, speaker: e.target.value }))}
            aria-label="Speaker"
          />
          <button className="btn pri" type="submit">
            <Icon name="plus" /> Log message
          </button>
        </form>
        <div className="tag-picker">
          <span className="tag-picker-label">Events:</span>
          {AUDIENCES.map((a) => (
            <button
              key={a.key}
              type="button"
              className={`book-tag pick ${a.key}${form.audiences.includes(a.key) ? ' on' : ''}`}
              onClick={() => toggleTag(a.key)}
            >
              {a.label}
            </button>
          ))}
        </div>
        {error && <p className="form-error">{error}</p>}

        <div className="bs-filters">
          <div className="bs-tabs" role="tablist">
            <button type="button" role="tab" aria-selected={audience === 'all'} className={audience === 'all' ? 'on' : ''} onClick={() => setAudience('all')}>All</button>
            {AUDIENCES.map((a) => (
              <button key={a.key} type="button" role="tab" aria-selected={audience === a.key} className={audience === a.key ? 'on' : ''} onClick={() => setAudience(a.key)}>{a.label}</button>
            ))}
          </div>
        </div>

        <div className="msg-list">
          {messages.map((m, i) => (
            <motion.div
              key={m.id}
              className="msg-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
            >
              <div className="msg-info">
                <strong>{m.title}</strong>
                <span>{m.speaker} · {formatDate(m.date)}</span>
                <span className="book-tags">
                  {tagsOf(m).map((a) => (
                    <em key={a} className={`book-tag ${a}`}>{LABEL[a]}</em>
                  ))}
                </span>
              </div>
              <button className="btn ghost sm" type="button" onClick={() => remove(m.id)} aria-label={`Delete ${m.title}`}>
                <Icon name="trash" />
              </button>
            </motion.div>
          ))}
          {messages.length === 0 && (
            <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '32px 0' }}>
              No messages logged yet — add the first one above.
            </p>
          )}
        </div>
      </main>
    </AppShell>
  )
}
