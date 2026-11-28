import { Router } from 'express'
import { protect } from '../auth/index.js'
import { BibleBook } from '../schema/BibleBook.js'
import { BibleProgress } from '../schema/BibleProgress.js'
import { asyncHandler, badRequest, notFound } from '../lib/errors.js'
import { serializeBibleBook } from '../lib/serialize.js'

export const bibleRouter = Router()
bibleRouter.use(protect)

function groupProgress(entries = []) {
  const progress = {}
  for (const entry of entries) {
    if (!progress[entry.book]) progress[entry.book] = {}
    progress[entry.book][entry.chapter] = entry.status
  }
  return progress
}

bibleRouter.get(
  '/books',
  asyncHandler(async (_req, res) => {
    const books = await BibleBook.find().sort({ custom: 1, chapters: -1 }).lean()
    res.json({ books: books.map(serializeBibleBook) })
  }),
)

bibleRouter.get(
  '/progress',
  asyncHandler(async (req, res) => {
    const doc = await BibleProgress.findOne({ user: req.user.id }).lean()
    res.json({ progress: groupProgress(doc?.entries) })
  }),
)

const updateProgress = asyncHandler(async (req, res) => {
  const book = String(req.body.book || '').trim()
  const chapter = Number(req.body.chapter)
  const rawStatus = String(req.body.status ?? '').trim()

  if (!book || !Number.isInteger(chapter) || chapter < 1) throw badRequest('book and a valid chapter are required')
  if (!['done', 'progress', '', 'none', 'clear'].includes(rawStatus)) {
    throw badRequest('status must be done, progress, or empty to clear')
  }

  const bookDoc = await BibleBook.findOne({ name: book }).lean()
  if (!bookDoc) throw notFound('Bible book not found')
  if (chapter > bookDoc.chapters) throw badRequest('Chapter is out of range for this book')

  const doc = await BibleProgress.findOne({ user: req.user.id })
    ?? new BibleProgress({ user: req.user.id, entries: [] })

  const index = doc.entries.findIndex((entry) => entry.book === book && entry.chapter === chapter)
  const clearing = ['', 'none', 'clear'].includes(rawStatus)

  if (clearing && index >= 0) doc.entries.splice(index, 1)
  else if (!clearing) {
    if (index >= 0) doc.entries[index].status = rawStatus
    else doc.entries.push({ book, chapter, status: rawStatus })
  }

  await doc.save()
  res.json({ progress: groupProgress(doc.entries) })
})

bibleRouter.post('/progress', updateProgress)
bibleRouter.post('/log', updateProgress)
