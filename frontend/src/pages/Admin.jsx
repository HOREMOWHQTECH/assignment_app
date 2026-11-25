import { useState } from 'react'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import { AUDIENCES } from '../data/messages.js'
import { useAdminBooks, useAdminBibleBooks, useBenchmarks } from '../api/admin.js'
import { useAllBooks } from '../api/books.js'
import { useBibleBooks } from '../api/bibleStudy.js'
import { useMessages } from '../api/messages.js'

const AUDIENCE_LABEL = Object.fromEntries(AUDIENCES.map((a) => [a.key, a.label]))

function Section({ title, sub, children }) {
  return (
    <section className="admin-section">
      <h2>{title}</h2>
      {sub && <p className="sub">{sub}</p>}
      {children}
    </section>
  )
}

export default function Admin() {
  const allBooks = useAllBooks()
  const bibleBooks = useBibleBooks()
  const { entries } = useMessages()
  const { books: customBooks, addBook, removeBook } = useAdminBooks()
  const { books: customBible, addBook: addBibleBook, removeBook: removeBibleBook } = useAdminBibleBooks()
  const { benchmarks, setBenchmark } = useBenchmarks()

  const [bookForm, setBookForm] = useState({ title: '', author: '', audiences: ['general'], chapters: 3, pagesPerChapter: 4 })
  const [bibleForm, setBibleForm] = useState({ name: '', chapters: 1 })
  const [msg, setMsg] = useState('')

  const toggleAudience = (key) => {
    setBookForm((f) => ({
      ...f,
      audiences: f.audiences.includes(key) ? f.audiences.filter((a) => a !== key) : [...f.audiences, key],
    }))
  }

  const submitBook = (e) => {
    e.preventDefault()
    if (!bookForm.title.trim() || !bookForm.author.trim() || !bookForm.audiences.length) return
    addBook({
      title: bookForm.title.trim(),
      author: bookForm.author.trim(),
      audiences: bookForm.audiences,
      chapters: bookForm.chapters,
      pagesPerChapter: bookForm.pagesPerChapter,
    })
    setBookForm({ title: '', author: '', audiences: ['general'], chapters: 3, pagesPerChapter: 4 })
    setMsg('Book added — it now appears in the library.')
  }

  const submitBible = (e) => {
    e.preventDefault()
    if (!bibleForm.name.trim()) return
    addBibleBook(bibleForm.name.trim(), bibleForm.chapters)
    setBibleForm({ name: '', chapters: 1 })
    setMsg('Bible book added — it now appears in the tracker.')
  }

  return (
    <AppShell>
      <main>
        <div className="bs-head">
          <div>
            <h1>Admin</h1>
            <p className="sub">Control the content and benchmarks across the app.</p>
          </div>
          <div className="bs-stats">
            <span className="bs-stat"><Icon name="book" />{allBooks.length} books</span>
            <span className="bs-stat"><Icon name="check" />{bibleBooks.length} bible books</span>
            <span className="bs-stat"><Icon name="play" />{entries.length} messages</span>
          </div>
        </div>

        {msg && <p className="form-error" style={{ color: 'var(--accent)' }}>{msg}</p>}

        <Section title="Add a book" sub="Creates a new title in the HOREMOW library with auto-generated chapters and cover.">
          <form className="msg-form" onSubmit={submitBook}>
            <input type="text" placeholder="Book title" value={bookForm.title} onChange={(e) => setBookForm((f) => ({ ...f, title: e.target.value }))} />
            <input type="text" placeholder="Author" value={bookForm.author} onChange={(e) => setBookForm((f) => ({ ...f, author: e.target.value }))} />
            <input type="number" min="1" max="20" placeholder="Chapters" value={bookForm.chapters} onChange={(e) => setBookForm((f) => ({ ...f, chapters: e.target.value }))} style={{ maxWidth: 110 }} />
            <input type="number" min="1" max="10" placeholder="Pages/ch" value={bookForm.pagesPerChapter} onChange={(e) => setBookForm((f) => ({ ...f, pagesPerChapter: e.target.value }))} style={{ maxWidth: 110 }} />
            <button className="btn pri" type="submit"><Icon name="plus" /> Add book</button>
          </form>
          <div className="tag-picker">
            <span className="tag-picker-label">Audiences:</span>
            {AUDIENCES.map((a) => (
              <button key={a.key} type="button" className={`book-tag pick ${a.key}${bookForm.audiences.includes(a.key) ? ' on' : ''}`} onClick={() => toggleAudience(a.key)}>{a.label}</button>
            ))}
          </div>
          {customBooks.length > 0 && (
            <div className="admin-list">
              {customBooks.map((b) => (
                <div key={b.id} className="admin-row">
                  <span><strong>{b.title}</strong> — {b.author} ({b.audiences.map((a) => AUDIENCE_LABEL[a]).join(', ')})</span>
                  <button className="btn ghost sm" type="button" onClick={() => removeBook(b.id)}><Icon name="trash" /></button>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Add a Bible book" sub="Adds a book to the Bible Study tracker with the given number of chapters.">
          <form className="msg-form" onSubmit={submitBible}>
            <input type="text" placeholder="Book name (e.g. Psalm 151)" value={bibleForm.name} onChange={(e) => setBibleForm((f) => ({ ...f, name: e.target.value }))} />
            <input type="number" min="1" placeholder="Chapters" value={bibleForm.chapters} onChange={(e) => setBibleForm((f) => ({ ...f, chapters: e.target.value }))} style={{ maxWidth: 110 }} />
            <button className="btn pri" type="submit"><Icon name="plus" /> Add book</button>
          </form>
          {customBible.length > 0 && (
            <div className="admin-list">
              {customBible.map((b) => (
                <div key={b.id} className="admin-row">
                  <span><strong>{b.name}</strong> — {b.chapters} chapters</span>
                  <button className="btn ghost sm" type="button" onClick={() => removeBibleBook(b.id)}><Icon name="trash" /></button>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Message benchmarks" sub="Set how many messages users should log per event.">
          <div className="bench-grid">
            {AUDIENCES.map((a) => (
              <div key={a.key} className="bench-card">
                <div className="bench-top">
                  <span className="bench-label">{a.label}</span>
                  <input
                    className="bench-input"
                    type="number"
                    min="0"
                    value={benchmarks[a.key]}
                    onChange={(e) => setBenchmark(a.key, e.target.value)}
                    aria-label={`${a.label} benchmark`}
                  />
                </div>
                <span className="bench-hint">messages required</span>
              </div>
            ))}
          </div>
        </Section>
      </main>
    </AppShell>
  )
}
