import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import { useAllBooks, useBookProgress, useHighlights } from '../api/books.js'
import { getPdf } from '../api/pdfStore.js'

function renderHighlighted(text, quotes) {
  if (!quotes.length) return text
  const parts = []
  let rest = text
  let key = 0
  const sorted = [...quotes].sort((a, b) => b.length - a.length)
  for (const q of sorted) {
    const idx = rest.indexOf(q)
    if (idx === -1) continue
    if (idx > 0) parts.push(rest.slice(0, idx))
    parts.push(<mark key={key++}>{q}</mark>)
    rest = rest.slice(idx + q.length)
  }
  if (rest) parts.push(rest)
  return parts.length ? parts : text
}

export default function BookReader() {
  const { bookId } = useParams()
  const allBooks = useAllBooks()
  const book = allBooks.find((b) => b.id === bookId)
  const { progress, update, markCompleted } = useBookProgress()
  const { highlights, add } = useHighlights(bookId)
  const saved = progress[bookId] || { chapter: 0, page: 0, completed: false }

  const [chapter, setChapter] = useState(Math.min(saved.chapter, (book?.chapters.length || 1) - 1))
  const [page, setPageState] = useState(saved.page)
  const [dir, setDir] = useState(1)
  const [flipping, setFlipping] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [sel, setSel] = useState(null)
  const [pdfUrl, setPdfUrl] = useState(null)
  const pageRef = useRef(null)

  const ch = book?.chapters[chapter]
  const totalPages = ch?.pages.length || 0
  const text = ch?.pages[page] || ''
  const pageQuotes = highlights.filter((h) => h.chapter === chapter && h.page === page).map((h) => h.quote)

  useEffect(() => () => window.speechSynthesis?.cancel(), [])

  useEffect(() => {
    if (!book?.pdf) return undefined
    let url = null
    getPdf(bookId).then((blob) => {
      if (blob) {
        url = URL.createObjectURL(blob)
        setPdfUrl(url)
      }
    })
    return () => { if (url) URL.revokeObjectURL(url) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book?.pdf, bookId])

  useEffect(() => {
    if (!book) return
    update(bookId, { chapter, page })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter, page, bookId])

  const stopSpeech = () => {
    window.speechSynthesis?.cancel()
    setSpeaking(false)
  }

  const toggleAudio = () => {
    if (!('speechSynthesis' in window)) return
    if (speaking) return stopSpeech()
    const utter = new SpeechSynthesisUtterance(text)
    utter.onend = () => setSpeaking(false)
    utter.onerror = () => setSpeaking(false)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utter)
    setSpeaking(true)
  }

  const go = (d) => {
    if (flipping) return
    stopSpeech()
    setSel(null)
    const nextPage = page + d
    if (nextPage >= 0 && nextPage < totalPages) {
      setDir(d)
      setFlipping(true)
      setTimeout(() => { setPageState(nextPage); setFlipping(false) }, 450)
    } else if (d > 0 && chapter < book.chapters.length - 1) {
      setDir(1)
      setFlipping(true)
      setTimeout(() => { setChapter((c) => c + 1); setPageState(0); setFlipping(false) }, 450)
    } else if (d < 0 && chapter > 0) {
      setDir(-1)
      setFlipping(true)
      setTimeout(() => {
        setChapter((c) => c - 1)
        setPageState(book.chapters[chapter - 1].pages.length - 1)
        setFlipping(false)
      }, 450)
    }
  }

  const onMouseUp = () => {
    const s = window.getSelection()
    const quote = s?.toString().trim()
    if (quote && quote.length > 3 && pageRef.current?.contains(s.anchorNode)) {
      const rect = s.getRangeAt(0).getBoundingClientRect()
      setSel({ quote, x: rect.left + rect.width / 2, y: rect.top })
    } else {
      setSel(null)
    }
  }

  const saveHighlight = () => {
    if (!sel) return
    add({ chapter, page, quote: sel.quote })
    setSel(null)
    window.getSelection()?.removeAllRanges()
  }

  if (!book) {
    return (
      <AppShell>
        <main style={{ padding: 40 }}>
          <h1>Book not found</h1>
          <Link className="btn pri" to="/books">Back to books</Link>
        </main>
      </AppShell>
    )
  }

  if (book.pdf) {
    return (
      <AppShell>
        <main className="reader">
          <div className="reader-top">
            <Link className="btn ghost sm" to="/books"><Icon name="arrow" style={{ transform: 'rotate(180deg)' }} /> Library</Link>
            <div className="reader-title">
              <strong>{book.title}</strong>
              <span>{book.author} · PDF document</span>
            </div>
            {!saved.completed && (
              <button className="btn pri" type="button" onClick={() => markCompleted(bookId, true)}>
                <Icon name="check" /> Mark completed
              </button>
            )}
          </div>
          <div className="book-page" style={{ minHeight: '70vh', padding: 0 }}>
            {pdfUrl ? (
              <iframe src={pdfUrl} title={book.title} style={{ width: '100%', height: '70vh', border: 0, borderRadius: 18, background: 'var(--soft)' }} />
            ) : (
              <p style={{ padding: 32, color: 'var(--muted)', textAlign: 'center' }}>Loading PDF…</p>
            )}
          </div>
          {saved.completed && (
            <p className="reader-done"><Icon name="star" /> You finished “{book.title}” — well done!</p>
          )}
        </main>
      </AppShell>
    )
  }

  const isLast = chapter === book.chapters.length - 1 && page === totalPages - 1
  const pct = Math.round(((chapter + (page + 1) / totalPages) / book.chapters.length) * 100)

  return (
    <AppShell>
      <main className="reader" onMouseUp={onMouseUp}>
        <div className="reader-top">
          <Link className="btn ghost sm" to="/books"><Icon name="arrow" style={{ transform: 'rotate(180deg)' }} /> Library</Link>
          <div className="reader-title">
            <strong>{book.title}</strong>
            <span>{book.author} · {ch?.title}</span>
          </div>
          <div className="reader-progress">
            <span>{ch?.title}, page {page + 1} of {totalPages} · {pct}%</span>
            <div className="book-bar"><i style={{ width: `${pct}%` }} /></div>
          </div>
        </div>

        <div className="chapter-pills">
          {book.chapters.map((c, i) => (
            <button
              key={i}
              type="button"
              className={`chapter-pill${i === chapter ? ' on' : ''}${i < chapter ? ' done' : ''}`}
              onClick={() => { stopSpeech(); setChapter(i); setPageState(0) }}
            >
              {i < chapter ? <Icon name="check" /> : null} Ch. {i + 1}
            </button>
          ))}
        </div>

        <div className="book-stage">
          <div className="book-page" ref={pageRef}>
            <div className="page-face page-front">
              <p className="page-chapter">{ch?.title} — Page {page + 1}</p>
              <p className="page-text">
                {renderHighlighted(text, pageQuotes)}
              </p>
            </div>
            <AnimatePresence>
              {flipping && (
                <motion.div
                  className="page-flip"
                  data-dir={dir}
                  initial={{ rotateY: dir === 1 ? 0 : -180 }}
                  animate={{ rotateY: dir === 1 ? -180 : 0 }}
                  transition={{ duration: 0.45, ease: 'easeInOut' }}
                >
                  <div className="page-face page-flip-front">
                    <p className="page-chapter">{ch?.title} — Page {page + 1}</p>
                    <p className="page-text">{text}</p>
                  </div>
                  <div className="page-face page-flip-back">
                    <p className="page-chapter">Next page</p>
                    <p className="page-text" style={{ color: 'var(--muted)' }}>…</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {sel && (
          <motion.button
            className="highlight-btn"
            type="button"
            style={{ left: sel.x, top: sel.y - 46 }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={saveHighlight}
          >
            <Icon name="star" /> Highlight
          </motion.button>
        )}

        <div className="reader-controls">
          <button className="btn ghost" type="button" onClick={() => go(-1)} disabled={(chapter === 0 && page === 0) || flipping}>
            <Icon name="chevL" /> Previous
          </button>
          <button
            className={`btn ${speaking ? 'pri' : 'ghost'}`}
            type="button"
            onClick={toggleAudio}
            disabled={!('speechSynthesis' in window)}
            title={('speechSynthesis' in window) ? 'Read this page aloud' : 'Audio not supported in this browser'}
          >
            <Icon name={speaking ? 'stop' : 'play'} /> {speaking ? 'Stop audio' : 'Read aloud'}
          </button>
          <button className="btn ghost" type="button" onClick={() => go(1)} disabled={isLast || flipping}>
            Next <Icon name="chevR" />
          </button>
          {!saved.completed && (
            <button className="btn pri" type="button" onClick={() => markCompleted(bookId, true)}>
              <Icon name="check" /> Mark completed
            </button>
          )}
        </div>

        {isLast && (
          <motion.p className="reader-done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Icon name="star" /> You finished “{book.title}” — well done!
          </motion.p>
        )}
      </main>
    </AppShell>
  )
}
