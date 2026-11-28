import { Router } from 'express'
import { protect } from '../auth/index.js'
import { Book } from '../schema/Book.js'
import { BookProgress } from '../schema/BookProgress.js'
import { asyncHandler, badRequest, notFound } from '../lib/errors.js'
import { streamImage, streamPdf } from '../lib/gridfs.js'
import { serializeBook } from '../lib/serialize.js'

export const booksRouter = Router()
booksRouter.use(protect)

async function findBook(id) {
  const book = await Book.findOne({ id })
  if (!book) throw notFound('Book not found')
  return book
}

async function findProgress(req, bookId, create = false) {
  let doc = await BookProgress.findOne({ user: req.user.id, bookId })
  if (!doc && create) {
    doc = new BookProgress({ user: req.user.id, bookId, highlights: [] })
  }
  return doc
}

function progressView(doc) {
  return {
    chapter: doc?.chapter || 0,
    page: doc?.page || 0,
    completed: Boolean(doc?.completed),
    lastRead: doc?.lastRead || null,
  }
}

function highlightView(doc) {
  return (doc?.highlights || []).map(({ chapter, page, quote }) => ({ chapter, page, quote }))
}

booksRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const books = await Book.find().sort({ custom: 1, title: 1 }).lean()
    res.json({ books: books.map(serializeBook) })
  }),
)

booksRouter.get(
  '/progress',
  asyncHandler(async (req, res) => {
    const docs = await BookProgress.find({ user: req.user.id }).lean()
    const progress = {}
    for (const doc of docs) progress[doc.bookId] = progressView(doc)
    res.json({ progress })
  }),
)

booksRouter.get(
  '/:id/file',
  asyncHandler(async (req, res) => {
    const book = await findBook(req.params.id)
    if (!book.pdf || !book.fileId) throw notFound('This book has no uploaded PDF')
    const streamed = await streamPdf(book.fileId.toString(), res)
    if (!streamed) throw notFound('PDF file not found')
  }),
)

booksRouter.get(
  '/:id/cover',
  asyncHandler(async (req, res) => {
    const book = await findBook(req.params.id)
    if (!book.coverFileId) throw notFound('This book has no cover image')
    const streamed = await streamImage(book.coverFileId.toString(), res)
    if (!streamed) throw notFound('Cover image not found')
  }),
)

booksRouter.get(
  '/:id/progress',
  asyncHandler(async (req, res) => {
    await findBook(req.params.id)
    const doc = await findProgress(req, req.params.id)
    res.json(progressView(doc))
  }),
)

booksRouter.patch(
  '/:id/progress',
  asyncHandler(async (req, res) => {
    await findBook(req.params.id)
    const doc = await findProgress(req, req.params.id, true)

    if (req.body.completed !== undefined) doc.completed = Boolean(req.body.completed)

    doc.lastRead = Date.now()
    await doc.save()
    res.json(progressView(doc))
  }),
)

booksRouter.post(
  '/:id/complete',
  asyncHandler(async (req, res) => {
    await findBook(req.params.id)
    const doc = await findProgress(req, req.params.id, true)
    doc.completed = req.body.completed === undefined ? true : Boolean(req.body.completed)
    doc.lastRead = Date.now()
    await doc.save()
    res.json(progressView(doc))
  }),
)

booksRouter.get(
  '/:id/highlights',
  asyncHandler(async (req, res) => {
    await findBook(req.params.id)
    const doc = await findProgress(req, req.params.id)
    res.json({ highlights: highlightView(doc) })
  }),
)

booksRouter.post(
  '/:id/highlights',
  asyncHandler(async (req, res) => {
    await findBook(req.params.id)
    const quote = String(req.body.quote || '').trim()
    if (quote.length <= 3) throw badRequest('quote must be longer than 3 characters')

    let doc = await findProgress(req, req.params.id, true)
    doc.highlights.push({
      chapter: Number(req.body.chapter) || 0,
      page: Number(req.body.page) || 0,
      quote,
      createdAt: new Date(),
    })
    await doc.save()
    res.status(201).json({ highlights: highlightView(doc) })
  }),
)

booksRouter.delete(
  '/:id/highlights/:index',
  asyncHandler(async (req, res) => {
    await findBook(req.params.id)
    const doc = await findProgress(req, req.params.id)
    const index = Number(req.params.index)
    if (!Number.isInteger(index) || index < 0 || index >= (doc?.highlights.length || 0)) {
      throw badRequest('Invalid highlight index')
    }
    doc.highlights.splice(index, 1)
    await doc.save()
    res.json({ highlights: highlightView(doc) })
  }),
)

booksRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const book = await findBook(req.params.id)
    res.json({ book: serializeBook(book) })
  }),
)
