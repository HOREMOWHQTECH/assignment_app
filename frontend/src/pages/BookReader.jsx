import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import { useAllBooks, useBookProgress } from '../api/books.js'
import { apiBlob, errorMessage } from '../api/client.js'

export default function BookReader() {
  const { bookId } = useParams()
  const allBooks = useAllBooks()
  const book = allBooks.find((b) => b.id === bookId)
  const { progress, update, markCompleted } = useBookProgress()
  const saved = progress[bookId] || {}
  const [pdfUrl, setPdfUrl] = useState('')
  const [error, setError] = useState('')

  // PDFs are real files from the API (MongoDB GridFS), never generated text.
  useEffect(() => {
    if (!book?.pdf) return undefined
    let active = true
    let url = null
    setError('')
    apiBlob(`/books/${bookId}/file`)
      .then((blob) => {
        if (!active) return
        url = URL.createObjectURL(blob)
        setPdfUrl(url)
      })
      .catch((err) => {
        if (active) setError(errorMessage(err))
      })
    return () => {
      active = false
      if (url) URL.revokeObjectURL(url)
    }
  }, [bookId, book?.pdf])

  // Opening a book is the only progress signal for a PDF until page tracking exists.
  useEffect(() => {
    if (!book) return
    update(bookId, {}).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, book])

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

  return (
    <AppShell>
      <main className="reader">
        <div className="reader-top">
          <Link className="btn ghost sm" to="/books">
            <Icon name="arrow" style={{ transform: 'rotate(180deg)' }} /> Library
          </Link>
          <div className="reader-title">
            <strong>{book.title}</strong>
            <span>{book.author} · {book.pdf ? 'PDF document' : 'No PDF uploaded'}</span>
          </div>
          {!saved.completed && (
            <button className="btn pri" type="button" onClick={() => markCompleted(bookId, true)}>
              <Icon name="check" /> Mark completed
            </button>
          )}
        </div>

        {error && <p className="form-error">{error}</p>}

        {book.pdf ? (
          <div className="book-page" style={{ minHeight: '70vh', padding: 0 }}>
            {pdfUrl ? (
              <iframe
                src={pdfUrl}
                title={book.title}
                style={{ width: '100%', height: '70vh', border: 0, borderRadius: 18, background: 'var(--soft)' }}
              />
            ) : (
              <p style={{ padding: 32, color: 'var(--muted)', textAlign: 'center' }}>
                {error ? 'Could not load the PDF.' : 'Loading PDF…'}
              </p>
            )}
          </div>
        ) : (
          <div className="book-page" style={{ textAlign: 'center', padding: 48 }}>
            <p style={{ color: 'var(--muted)' }}>This book has no uploaded PDF yet.</p>
          </div>
        )}

        {saved.completed && (
          <p className="reader-done"><Icon name="star" /> You finished “{book.title}” — well done!</p>
        )}
      </main>
    </AppShell>
  )
}
