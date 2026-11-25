import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import { BOOKS } from '../data/books.js'
import { useBookProgress } from '../api/books.js'

export default function BookReader() {
  const { bookId } = useParams()
  const book = BOOKS.find((b) => b.id === bookId)
  const { progress, setPage } = useBookProgress()
  const saved = progress[bookId] || { page: 0, completed: false }

  const [page, setPageState] = useState(saved.page)
  const [dir, setDir] = useState(1)
  const [flipping, setFlipping] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const utterRef = useRef(null)

  const total = book ? book.pages.length : 0
  const text = book ? book.pages[page] : ''

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel()
    }
  }, [])

  useEffect(() => {
    if (!book) return
    setPage(bookId, page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, bookId])

  const stopSpeech = () => {
    window.speechSynthesis?.cancel()
    setSpeaking(false)
  }

  const toggleAudio = () => {
    if (!('speechSynthesis' in window)) return
    if (speaking) {
      stopSpeech()
      return
    }
    const utter = new SpeechSynthesisUtterance(text)
    utter.rate = 1
    utter.onend = () => setSpeaking(false)
    utter.onerror = () => setSpeaking(false)
    utterRef.current = utter
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utter)
    setSpeaking(true)
  }

  const go = (next) => {
    if (flipping || next < 0 || next >= total) return
    stopSpeech()
    setDir(next > page ? 1 : -1)
    setFlipping(true)
    setTimeout(() => {
      setPageState(next)
      setFlipping(false)
    }, 450)
  }

  const words = useMemo(() => text.split(' '), [text])

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

  const pct = Math.round(((page + 1) / total) * 100)

  return (
    <AppShell>
      <main className="reader">
        <div className="reader-top">
          <Link className="btn ghost sm" to="/books"><Icon name="arrow" style={{ transform: 'rotate(180deg)' }} /> Library</Link>
          <div className="reader-title">
            <strong>{book.title}</strong>
            <span>{book.author}</span>
          </div>
          <div className="reader-progress">
            <span>Page {page + 1} of {total}</span>
            <div className="book-bar"><i style={{ width: `${pct}%` }} /></div>
          </div>
        </div>

        <div className="book-stage">
          <div className={`book-page${flipping ? ' flipping' : ''}`} data-dir={dir}>
            <div className="page-face page-front">
              <p className="page-chapter">Page {page + 1}</p>
              <p className="page-text">
                {words.map((w, i) => (
                  <motion.span
                    key={`${page}-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 + i * 0.012, duration: 0.2 }}
                  >
                    {w}{' '}
                  </motion.span>
                ))}
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
                    <p className="page-chapter">Page {page + 1}</p>
                    <p className="page-text">{text}</p>
                  </div>
                  <div className="page-face page-flip-back">
                    <p className="page-chapter">Page {page + (dir === 1 ? 2 : 0)}</p>
                    <p className="page-text">
                      {book.pages[Math.min(Math.max(page + (dir === 1 ? 1 : -1), 0), total - 1)]}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="reader-controls">
          <button className="btn ghost" type="button" onClick={() => go(page - 1)} disabled={page === 0 || flipping}>
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
          <button className="btn ghost" type="button" onClick={() => go(page + 1)} disabled={page === total - 1 || flipping}>
            Next <Icon name="chevR" />
          </button>
        </div>

        {page === total - 1 && (
          <motion.p
            className="reader-done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Icon name="star" /> You finished “{book.title}” — well done!
          </motion.p>
        )}
      </main>
    </AppShell>
  )
}
