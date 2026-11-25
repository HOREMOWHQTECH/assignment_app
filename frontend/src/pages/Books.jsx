import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import { useBookProgress, bookStats, useAllBooks } from '../api/books.js'

const AUDIENCE_TABS = [
  { key: 'all', label: 'All' },
  { key: 'general', label: 'General' },
  { key: 'women', label: 'Women' },
  { key: 'ministries', label: 'Ministers' },
  { key: 'youth', label: 'Youth' },
]

const AUDIENCE_LABEL = { general: 'General', women: 'Women', ministries: 'Ministers', youth: 'Youth' }

function timeAgo(ts) {
  if (!ts) return null
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function Books() {
  const { progress, markCompleted } = useBookProgress()
  const allBooks = useAllBooks()
  const stats = bookStats(progress, allBooks)
  const [audience, setAudience] = useState('all')

  const books = useMemo(
    () => (audience === 'all' ? allBooks : allBooks.filter((b) => b.audiences.includes(audience))),
    [audience, allBooks],
  )

  return (
    <AppShell>
      <main>
        <div className="bs-head">
          <div>
            <h1>HOREMOW Books</h1>
            <p className="sub">Read, track your progress, and complete each book — {allBooks.length} titles in the library.</p>
          </div>
          <div className="bs-stats">
            <span className="bs-stat"><Icon name="book" />{allBooks.length} books</span>
            <span className="bs-stat"><Icon name="check" />{stats.completed} completed</span>
            <span className="bs-stat"><Icon name="flame" />{stats.pagesRead} pages read</span>
          </div>
        </div>

        <div className="bs-filters">
          <div className="bs-tabs" role="tablist">
            {AUDIENCE_TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={audience === t.key}
                className={audience === t.key ? 'on' : ''}
                onClick={() => setAudience(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="book-grid">
          {books.map((book, i) => {
            const p = progress[book.id] || { chapter: 0, page: 0, completed: false }
            const started = p.completed || p.page > 0 || p.chapter > 0
            const pagesCovered = p.completed
              ? book.pageCount
              : book.chapters.slice(0, p.chapter).reduce((n, c) => n + c.pages.length, 0) + p.page + 1
            const pct = book.pdf ? (p.completed ? 100 : 0) : Math.round((pagesCovered / book.pageCount) * 100)
            return (
              <motion.div
                key={book.id}
                className="book-card"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.35 }}
              >
                <Link className="book-cover" to={`/books/${book.id}`}>
                  <img src={book.cover} alt={`${book.title} cover`} />
                  {p.completed && <span className="book-done-tag"><Icon name="check" /> Completed</span>}
                </Link>
                <div className="book-info">
                  <div className="book-info-top">
                    <div>
                      <strong>{book.title}</strong>
                      <span>{book.author} · {book.pdf ? 'PDF document' : `${book.chapters.length} chapters · ${book.pageCount} pages`}</span>
                      <span className="book-tags">
                        {book.audiences.map((a) => (
                          <em key={a} className={`book-tag ${a}`}>{AUDIENCE_LABEL[a]}</em>
                        ))}
                      </span>
                    </div>
                    <span className="book-pages">{book.pdf ? (p.completed ? 'Completed' : 'PDF') : `${pagesCovered}/${book.pageCount} pages`}</span>
                  </div>
                  <div className="book-bar"><i style={{ width: `${pct}%` }} /></div>
                  <div className="book-actions">
                    <Link className="btn pri sm" to={`/books/${book.id}`}>
                      <Icon name="book" /> {p.completed ? 'Read again' : started ? 'Continue' : 'Read'}
                    </Link>
                    {!p.completed && (
                      <button
                        className="btn ghost sm"
                        type="button"
                        onClick={() => markCompleted(book.id, true)}
                        title="Mark as completed (e.g. finished the hard copy)"
                      >
                        <Icon name="check" /> Done
                      </button>
                    )}
                  </div>
                  <div className="book-foot">
                    <span className="book-status">
                      {p.completed ? 'Completed' : started ? 'In progress' : 'Not started'}
                    </span>
                    {p.lastRead && <span className="book-lastread">Last read {timeAgo(p.lastRead)}</span>}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </main>
    </AppShell>
  )
}
