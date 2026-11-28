import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import { protect, requireAdmin } from '../auth/index.js'
import { uploadBookFiles } from '../lib/upload.js'
import { CONFIG_DEFAULTS } from '../constants/defaults.js'
import { BibleBook } from '../schema/BibleBook.js'
import { Book } from '../schema/Book.js'
import { BookProgress } from '../schema/BookProgress.js'
import { asyncHandler, badRequest, forbidden, notFound } from '../lib/errors.js'
import { getConfig, setConfig } from '../lib/config.js'
import { deleteFile, uploadImage, uploadPdf } from '../lib/gridfs.js'
import { serializeBibleBook, serializeBook } from '../lib/serialize.js'
import { events, integer, requiredText } from '../lib/validation.js'

export const adminRouter = Router()
adminRouter.use(protect, requireAdmin)

const CONFIG_KEYS = Object.keys(CONFIG_DEFAULTS)

function parseAudiences(value) {
  if (value === undefined) return ['general']
  if (Array.isArray(value)) return events(value)
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) return events(parsed)
    } catch {
      return events(value.split(','))
    }
  }
  return ['general']
}

function runUpload(req, res, next) {
  uploadBookFiles(req, res, (error) => (error ? next(error) : next()))
}

async function createBook({ pdf, cover, title, author, audiences, userId }) {
  const id = `custom-${randomUUID()}`
  const metadata = { bookId: id, uploadedBy: userId }
  const uploadedIds = []

  try {
    const fileId = await uploadPdf(pdf.buffer, pdf.originalname, metadata)
    uploadedIds.push(fileId)

    const coverFileId = cover
      ? await uploadImage(cover.buffer, cover.originalname, cover.mimetype, { ...metadata, kind: 'cover' })
      : undefined
    if (coverFileId) uploadedIds.push(coverFileId)

    return await Book.create({
      id,
      title,
      author,
      audiences,
      custom: true,
      pdf: true,
      fileId,
      coverFileId,
      createdBy: userId,
    })
  } catch (error) {
    await Promise.all(uploadedIds.map((fileId) => deleteFile(fileId.toString())))
    throw error
  }
}

adminRouter.get(
  '/books',
  asyncHandler(async (_req, res) => {
    const books = await Book.find().sort({ custom: 1, title: 1 }).lean()
    res.json({ books: books.map(serializeBook) })
  }),
)

adminRouter.post('/books', runUpload, asyncHandler(async (req, res) => {
  const pdf = req.files?.file?.[0]
  if (!pdf) throw badRequest('A PDF file is required')

  const book = await createBook({
    pdf,
    cover: req.files?.cover?.[0],
    title: requiredText(req.body.title, 'Title'),
    author: requiredText(req.body.author, 'Author'),
    audiences: parseAudiences(req.body.audiences ?? req.body['audiences[]']),
    userId: req.user.id,
  })

  res.status(201).json({ book: serializeBook(book) })
}))

adminRouter.delete(
  '/books/:id',
  asyncHandler(async (req, res) => {
    const book = await Book.findOne({ id: req.params.id })
    if (!book) throw notFound('Book not found')

    await Promise.all([
      book.fileId ? deleteFile(book.fileId.toString()) : Promise.resolve(),
      book.coverFileId ? deleteFile(book.coverFileId.toString()) : Promise.resolve(),
    ])
    await Promise.all([
      Book.deleteOne({ _id: book._id }),
      BookProgress.deleteMany({ bookId: book.id }),
    ])
    res.json({ ok: true })
  }),
)

adminRouter.get(
  '/bible-books',
  asyncHandler(async (_req, res) => {
    const books = await BibleBook.find().sort({ custom: 1, chapters: -1 }).lean()
    res.json({ books: books.map(serializeBibleBook) })
  }),
)

adminRouter.post(
  '/bible-books',
  asyncHandler(async (req, res) => {
    const name = requiredText(req.body.name, 'Book name')
    const chapters = integer(req.body.chapters, 'Chapters', { min: 1 })
    if (await BibleBook.exists({ name })) throw badRequest('This Bible book already exists')

    const book = await BibleBook.create({
      id: `custom-${randomUUID()}`,
      name,
      chapters,
      testament: 'custom',
      custom: true,
    })
    res.status(201).json({ book: serializeBibleBook(book) })
  }),
)

adminRouter.delete(
  '/bible-books/:id',
  asyncHandler(async (req, res) => {
    const book = await BibleBook.findOne({ id: req.params.id })
    if (!book) throw notFound('Bible book not found')
    if (!book.custom) throw forbidden('Built-in Bible books cannot be deleted')
    await BibleBook.deleteOne({ _id: book._id })
    res.json({ ok: true })
  }),
)

adminRouter.get(
  '/:key',
  asyncHandler(async (req, res) => {
    if (!CONFIG_KEYS.includes(req.params.key)) throw notFound('Configuration key not found')
    res.json({ value: await getConfig(req.params.key) })
  }),
)

adminRouter.put(
  '/:key',
  asyncHandler(async (req, res) => {
    if (!CONFIG_KEYS.includes(req.params.key)) throw notFound('Configuration key not found')
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      throw badRequest('A configuration object is required')
    }
    res.json({ value: await setConfig(req.params.key, req.body) })
  }),
)
