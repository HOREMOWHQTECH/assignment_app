import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import { AUDIENCES } from '../data/messages.js'
import { SOUL_TAGS, SOUL_TAG_LABEL } from '../data/souls.js'
import { useSouls } from '../api/souls.js'
import { useSoulTargets } from '../api/admin.js'

const LABEL = Object.fromEntries(AUDIENCES.map((a) => [a.key, a.label]))

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return ''
  }
}

const emptyForm = { name: '', phone: '', address: '', note: '', tag: 'none', events: ['general'] }

export default function SoulWinning() {
  const { souls, add, remove, update } = useSouls()
  const { targets } = useSoulTargets()
  const [event, setEvent] = useState('all')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')

  const perEvent = useMemo(() => {
    const map = {}
    for (const a of AUDIENCES) {
      map[a.key] = souls.filter((s) => (s.events || []).includes(a.key)).length
    }
    return map
  }, [souls])

  const list = useMemo(
    () => (event === 'all' ? souls : souls.filter((s) => (s.events || []).includes(event))),
    [souls, event],
  )

  const toggleEvent = (key) => {
    setForm((f) => ({
      ...f,
      events: f.events.includes(key) ? f.events.filter((a) => a !== key) : [...f.events, key],
    }))
  }

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Name and phone number are required.')
      return
    }
    if (!form.events.length) {
      setError('Select at least one event.')
      return
    }
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      note: form.note.trim(),
      tag: form.tag,
      events: form.events,
    }
    if (editingId) {
      update(editingId, payload)
      setEditingId(null)
    } else {
      add(payload)
    }
    setForm(emptyForm)
    setError('')
  }

  const startEdit = (s) => {
    setEditingId(s.id)
    setForm({
      name: s.name,
      phone: s.phone,
      address: s.address || '',
      note: s.note || '',
      tag: s.tag,
      events: s.events?.length ? s.events : ['general'],
    })
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  return (
    <AppShell>
      <main>
        <div className="bs-head">
          <div>
            <h1>Soul Winning</h1>
            <p className="sub">Record souls won and track progress toward each event target.</p>
          </div>
          <div className="bs-stats">
            <span className="bs-stat"><Icon name="star" />{souls.length} souls</span>
          </div>
        </div>

        <div className="bench-grid">
          {AUDIENCES.map((a) => {
            const count = perEvent[a.key]
            const target = targets[a.key] || 0
            const pct = target ? Math.min(100, Math.round((count / target) * 100)) : 0
            const done = target > 0 && count >= target
            return (
              <div key={a.key} className={`bench-card${done ? ' done' : ''}`}>
                <div className="bench-top">
                  <span className="bench-label">{a.label}</span>
                  <span className="bench-count">{count}/{target}</span>
                </div>
                <div className="book-bar"><i style={{ width: `${pct}%` }} /></div>
                <span className="bench-hint">{done ? 'Target reached!' : `${Math.max(0, target - count)} to go`}</span>
              </div>
            )
          })}
        </div>

        <form className="msg-form soul-form" onSubmit={submit}>
          <input type="text" placeholder="Full name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <input type="tel" placeholder="Phone number *" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <input type="text" placeholder="Address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
          <select value={form.tag} onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))} aria-label="Status tag">
            {SOUL_TAGS.map((t) => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
          </select>
          <button className="btn pri" type="submit">
            <Icon name={editingId ? 'check' : 'plus'} /> {editingId ? 'Save changes' : 'Add soul'}
          </button>
          {editingId && (
            <button className="btn out" type="button" onClick={cancelEdit}>Cancel</button>
          )}
        </form>
        <div className="tag-picker">
          <span className="tag-picker-label">Events:</span>
          {AUDIENCES.map((a) => (
            <button key={a.key} type="button" className={`book-tag pick ${a.key}${form.events.includes(a.key) ? ' on' : ''}`} onClick={() => toggleEvent(a.key)}>{a.label}</button>
          ))}
        </div>
        <textarea
          className="soul-note"
          placeholder="How was this person converted? (note)"
          value={form.note}
          onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
          rows={2}
        />
        {error && <p className="form-error">{error}</p>}

        <div className="bs-filters">
          <div className="bs-tabs" role="tablist">
            <button type="button" role="tab" aria-selected={event === 'all'} className={event === 'all' ? 'on' : ''} onClick={() => setEvent('all')}>All</button>
            {AUDIENCES.map((a) => (
              <button key={a.key} type="button" role="tab" aria-selected={event === a.key} className={event === a.key ? 'on' : ''} onClick={() => setEvent(a.key)}>{a.label}</button>
            ))}
          </div>
        </div>

        <div className="msg-list">
          {list.map((s, i) => (
            <motion.div
              key={s.id}
              className="msg-card soul-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
            >
              <div className="msg-info">
                <strong>{s.name}</strong>
                <span>{s.phone}{s.address ? ` · ${s.address}` : ''} · {formatDate(s.date)}</span>
                {s.note && <span className="soul-note-text">“{s.note}”</span>}
                <span className="book-tags">
                  {(s.events || []).map((a) => (
                    <em key={a} className={`book-tag ${a}`}>{LABEL[a]}</em>
                  ))}
                  <em className={`book-tag soul-tag-${s.tag}`}>{SOUL_TAG_LABEL[s.tag]}</em>
                </span>
              </div>
              <div className="msg-actions">
                <button className="btn ghost sm" type="button" onClick={() => startEdit(s)} aria-label={`Edit ${s.name}`}>
                  <Icon name="edit" />
                </button>
                <button className="btn ghost sm" type="button" onClick={() => remove(s.id)} aria-label={`Delete ${s.name}`}>
                  <Icon name="trash" />
                </button>
              </div>
            </motion.div>
          ))}
          {list.length === 0 && (
            <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '32px 0' }}>
              No souls recorded yet — add the first one above.
            </p>
          )}
        </div>
      </main>
    </AppShell>
  )
}
