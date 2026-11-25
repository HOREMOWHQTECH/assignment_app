import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import { BIBLE_BOOKS, TOTAL_CHAPTERS, getLevel } from '../data/bible.js'
import { useBibleProgress } from '../api/bibleStudy.js'

const TABS = [
  { key: 'all', label: 'All Books' },
  { key: 'ot', label: 'Old Testament' },
  { key: 'nt', label: 'New Testament' },
]

function BookRow({ book, chapters, onCycle }) {
  const [open, setOpen] = useState(false)
  const done = Object.values(chapters).filter((s) => s === 'done').length
  const pct = Math.round((done / book.chapters) * 100)
  const level = getLevel(done, book.chapters)

  return (
    <div className={`bs-book${open ? ' open' : ''}`}>
      <button
        className="bs-book-head"
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className={`bs-lvl ${level.key}`}>
          <Icon name={level.icon} />
        </span>
        <span>
          <span className="bs-book-name" style={{ display: 'block' }}>{book.name}</span>
          <span className="bs-book-meta">
            {done}/{book.chapters} chapters · {level.label}
          </span>
        </span>
        <span className="bs-book-bar">
          <i style={{ width: `${pct}%` }} />
        </span>
        <Icon name="chevD" className="i bs-chev" />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="bs-chapters">
              {Array.from({ length: book.chapters }, (_, i) => i + 1).map((ch) => {
                const status = chapters[ch]
                return (
                  <button
                    key={ch}
                    className={`bs-ch${status ? ` ${status}` : ''}`}
                    type="button"
                    onClick={() => onCycle(book.name, ch)}
                    title={`Chapter ${ch} — click to cycle: not started → done → in progress`}
                  >
                    {status === 'done' ? <Icon name="check" /> : ch}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function BibleStudy() {
  const { progress, cycleChapter, stats } = useBibleProgress()
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')

  const books = useMemo(() => {
    const q = query.trim().toLowerCase()
    return BIBLE_BOOKS.filter((b) => {
      if (tab !== 'all' && b.testament !== tab) return false
      if (q && !b.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [tab, query])

  const pct = Math.round((stats.done / TOTAL_CHAPTERS) * 100)

  return (
    <AppShell>
      <main>
        <div className="bs-head">
          <div>
            <h1>Bible Study Tracker</h1>
            <p className="sub">Read through all {TOTAL_CHAPTERS} chapters — tap a chapter to mark it done or in progress.</p>
          </div>
          <div className="bs-stats">
            <span className="bs-stat"><Icon name="book" />{stats.done}/{TOTAL_CHAPTERS} chapters</span>
            <span className="bs-stat"><Icon name="check" />{stats.booksComplete}/66 books</span>
            <span className="bs-stat"><Icon name="flame" />{pct}% complete</span>
          </div>
        </div>

        <div className="bs-filters">
          <div className="bs-tabs" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                className={tab === t.key ? 'on' : ''}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <label className="bs-search">
            <Icon name="search" />
            <input
              type="search"
              placeholder="Search books…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search books"
            />
          </label>
        </div>

        <div className="bs-legend">
          <span><i className="bs-dot" style={{ background: 'var(--accent)' }} /> Done</span>
          <span><i className="bs-dot" style={{ background: 'var(--amber)' }} /> In progress</span>
          <span><i className="bs-dot" style={{ background: 'var(--line)' }} /> Not started</span>
        </div>

        <div className="bs-list">
          {books.map((book) => (
            <BookRow
              key={book.name}
              book={book}
              chapters={progress[book.name] || {}}
              onCycle={cycleChapter}
            />
          ))}
          {books.length === 0 && (
            <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '32px 0' }}>
              No books match your search.
            </p>
          )}
        </div>
      </main>
    </AppShell>
  )
}
