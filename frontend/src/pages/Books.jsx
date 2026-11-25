import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import { BOOKS } from '../data/books.js'
import { useBookProgress } from '../api/books.js'

export default function Books() {
  const { progress } = useBookProgress()

  return (
    <AppShell>
      <main>
        <div className="bs-head">
          <div>
            <h1>HOREMOW Books</h1>
            <p className="sub">Read, track your progress, and complete each book — {BOOKS.length} titles in the library.</p>
          </div>
          <div className="bs-stats">
            <span className="bs-stat"><Icon name="book" />{BOOKS.length} books</span>
            <span className="bs-stat"><Icon name="check" />{Object.values(progress).filter((p) => p.completed).length} completed</span>
          </div>
        </div>

        <div className="book-grid">
          {BOOKS.map((book, i) => {
            const p = progress[book.id] || { page: 0, completed: false }
            const pct = Math.round(((p.page + 1) / book.pages.length) * 100)
            const started = p.page > 0 || p.completed
            return (
              <motion.div
                key={book.id}
                className="book-card"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.35 }}
              >
                <Link className="book-cover" to={`/books/${book.id}`}>
                  <span className="book-cover-title">{book.title}</span>
                  <span className="book-cover-author">{book.author}</span>
                  {p.completed && <span className="book-done-tag"><Icon name="check" /> Completed</span>}
                </Link>
                <div className="book-info">
                  <div className="book-info-top">
                    <div>
                      <strong>{book.title}</strong>
                      <span>{book.author} · {book.pages.length} pages</span>
                    </div>
                    <span className="book-pages">{p.page + 1}/{book.pages.length}</span>
                  </div>
                  <div className="book-bar"><i style={{ width: `${pct}%` }} /></div>
                  <div className="book-actions">
                    <Link className="btn pri sm" to={`/books/${book.id}`}>
                      <Icon name="book" /> {started ? 'Continue' : 'Read'}
                    </Link>
                    <span className="book-status">{p.completed ? 'Completed' : started ? 'In progress' : 'Not started'}</span>
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
