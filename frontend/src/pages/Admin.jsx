import { useRef, useState } from 'react'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import { AUDIENCES } from '../data/messages.js'
import { useAdminBooks, useAdminBibleBooks, useBenchmarks, useSoulTargets, usePrayerTargets } from '../api/admin.js'
import { useAppSettings } from '../api/settings.js'
import { useAllBooks } from '../api/books.js'
import { useBibleBooks } from '../api/bibleStudy.js'
import { useMessages } from '../api/messages.js'
import { errorMessage } from '../api/client.js'

const AUDIENCE_LABEL = Object.fromEntries(AUDIENCES.map((a) => [a.key, a.label]))

const MODULES = [
  { key: 'bibleStudy', label: 'Bible Study' },
  { key: 'books', label: 'HOREMOW Books' },
  { key: 'messages', label: 'Messages' },
  { key: 'soulWinning', label: 'Soul Winning' },
  { key: 'prayer', label: 'Prayer & Fasting' },
  { key: 'reports', label: 'Official Report' },
]

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
  const { targets, setTarget } = useSoulTargets()
  const { targets: prayerTargets, setTarget: setPrayerTarget } = usePrayerTargets()
  const { settings, setModule } = useAppSettings()

  const [bookForm, setBookForm] = useState({ title: '', author: '', audiences: ['general'], pdf: null, cover: null })
  const [bibleForm, setBibleForm] = useState({ name: '', chapters: 1 })
  const [msg, setMsg] = useState('')
  const pdfInputRef = useRef(null)
  const coverInputRef = useRef(null)

  const toggleAudience = (key) => {
    setBookForm((f) => ({
      ...f,
      audiences: f.audiences.includes(key) ? f.audiences.filter((a) => a !== key) : [...f.audiences, key],
    }))
  }

  const submitBook = async (e) => {
    e.preventDefault()
    if (!bookForm.title.trim() || !bookForm.author.trim() || !bookForm.audiences.length || !bookForm.pdf) return
    try {
      await addBook({
        title: bookForm.title.trim(),
        author: bookForm.author.trim(),
        audiences: bookForm.audiences,
        file: bookForm.pdf,
        cover: bookForm.cover,
      })
      setBookForm({ title: '', author: '', audiences: ['general'], pdf: null, cover: null })
      if (pdfInputRef.current) pdfInputRef.current.value = ''
      if (coverInputRef.current) coverInputRef.current.value = ''
      setMsg('Book added — it now appears in the library.')
    } catch (err) {
      setMsg(errorMessage(err))
    }
  }

  const submitBible = async (e) => {
    e.preventDefault()
    if (!bibleForm.name.trim()) return
    try {
      await addBibleBook(bibleForm.name.trim(), bibleForm.chapters)
      setBibleForm({ name: '', chapters: 1 })
      setMsg('Bible book added — it now appears in the tracker.')
    } catch (err) {
      setMsg(errorMessage(err))
    }
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

        <Section title="App modules" sub="Enable or disable entire sections of the app. Disabled modules are hidden from the sidebar.">
          <div className="admin-list">
            {MODULES.map((m) => (
              <div key={m.key} className="admin-row">
                <span>{m.label}</span>
                <button
                  type="button"
                  className={`book-tag pick ${settings.modules?.[m.key] ? 'on' : ''}`}
                  style={{ cursor: 'pointer', opacity: settings.modules?.[m.key] ? 1 : 0.55 }}
                  onClick={() => setModule(m.key, !settings.modules?.[m.key])}
                >
                  {settings.modules?.[m.key] ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Add a book (PDF)" sub="Upload a PDF and an optional cover image — it appears in the library and opens in the built-in PDF reader.">
          <form className="msg-form" onSubmit={submitBook}>
            <input type="text" placeholder="Book title" value={bookForm.title} onChange={(e) => setBookForm((f) => ({ ...f, title: e.target.value }))} />
            <input type="text" placeholder="Author" value={bookForm.author} onChange={(e) => setBookForm((f) => ({ ...f, author: e.target.value }))} />
            <input
              ref={pdfInputRef}
              type="file"
              accept="application/pdf,.pdf"
              required
              onChange={(e) => setBookForm((f) => ({ ...f, pdf: e.target.files?.[0] || null }))}
              style={{ fontSize: 13 }}
            />
            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
              onChange={(e) => setBookForm((f) => ({ ...f, cover: e.target.files?.[0] || null }))}
              title="Optional cover image"
              style={{ fontSize: 13 }}
            />
            <button className="btn pri" type="submit" disabled={!bookForm.pdf}><Icon name="plus" /> Add book</button>
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

        <Section title="Soul-winning targets" sub="Set how many souls should be won per event.">
          <div className="bench-grid">
            {AUDIENCES.map((a) => (
              <div key={a.key} className="bench-card">
                <div className="bench-top">
                  <span className="bench-label">{a.label}</span>
                  <input
                    className="bench-input"
                    type="number"
                    min="0"
                    value={targets[a.key] || 0}
                    onChange={(e) => setTarget(a.key, e.target.value)}
                    aria-label={`${a.label} soul target`}
                  />
                </div>
                <span className="bench-hint">souls required</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Daily prayer targets" sub="Minutes of prayer required per day for each event (e.g. 60 = 1hr members, 90 = 1hr 30mins leaders). Yearly benchmark = daily × 365.">
          <div className="bench-grid">
            {AUDIENCES.map((a) => (
              <div key={a.key} className="bench-card">
                <div className="bench-top">
                  <span className="bench-label">{a.label}</span>
                  <input
                    className="bench-input"
                    type="number"
                    min="0"
                    value={prayerTargets[a.key] || 0}
                    onChange={(e) => setPrayerTarget(a.key, e.target.value)}
                    aria-label={`${a.label} daily prayer minutes`}
                  />
                </div>
                <span className="bench-hint">minutes per day</span>
              </div>
            ))}
          </div>
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
