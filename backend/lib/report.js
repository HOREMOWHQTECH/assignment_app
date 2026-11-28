import { EVENT_KEYS } from '../constants/defaults.js'
import { Log } from '../schema/Log.js'
import { BibleBook } from '../schema/BibleBook.js'
import { BibleProgress } from '../schema/BibleProgress.js'
import { Book } from '../schema/Book.js'
import { BookProgress } from '../schema/BookProgress.js'
import { Message } from '../schema/Message.js'
import { PrayerSession } from '../schema/PrayerSession.js'
import { Soul } from '../schema/Soul.js'
import { getConfig } from './config.js'

const DAYS = 365
const LABELS = { general: 'General', women: 'Women', ministries: 'Ministers', youth: 'Youth' }

const pct = (part, total) => (total > 0 ? Math.min(100, Math.round((part / total) * 100)) : 0)

function grade(progress) {
  if (progress >= 90) return 'Excellent'
  if (progress >= 75) return 'Great'
  if (progress >= 50) return 'Good'
  if (progress >= 25) return 'Fair'
  return 'Keep going'
}

function tagsOf(entry) {
  if (Array.isArray(entry.audiences) && entry.audiences.length) return entry.audiences
  return entry.audience ? [entry.audience] : []
}

function matchesKey(list, key, filterKey) {
  return list.includes(key) && (!filterKey || list.includes(filterKey))
}

function secondsOf(entry) {
  if (Number.isFinite(entry.seconds)) return entry.seconds
  return Math.round((entry.minutes || 0) * 60)
}

function countByEvent(entries, key, filterKey, getValue = () => 1) {
  return entries
    .filter((entry) => matchesKey(tagsOf(entry), key, filterKey))
    .reduce((sum, entry) => sum + getValue(entry), 0)
}

export async function computeStreak(userId) {
  const logs = await Log.find({ user: userId }).sort({ loggedAt: -1 }).select('loggedAt').lean()
  if (!logs.length) return 0

  const days = new Set(logs.map((log) => new Date(log.loggedAt).toISOString().slice(0, 10)))
  const cursor = new Date()
  cursor.setUTCHours(0, 0, 0, 0)
  if (!days.has(cursor.toISOString().slice(0, 10))) cursor.setUTCDate(cursor.getUTCDate() - 1)

  let streak = 0
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }
  return streak
}

export async function computeReport(userId, filterKey = null) {
  const [bibleBooks, books, bibleDoc, bookDocs, messages, souls, sessions, benchmarks, soulTargets, prayerTargets] =
    await Promise.all([
      BibleBook.find().lean(),
      Book.find().lean(),
      BibleProgress.findOne({ user: userId }).lean(),
      BookProgress.find({ user: userId }).lean(),
      Message.find({ user: userId }).lean(),
      Soul.find({ user: userId }).lean(),
      PrayerSession.find({ user: userId }).lean(),
      getConfig('benchmarks'),
      getConfig('soul-targets'),
      getConfig('prayer-targets'),
    ])

  const bibleMap = {}
  for (const entry of bibleDoc?.entries || []) {
    if (!bibleMap[entry.book]) bibleMap[entry.book] = {}
    bibleMap[entry.book][entry.chapter] = entry.status
  }

  let done = 0
  let booksComplete = 0
  for (const book of bibleBooks) {
    const statuses = Object.values(bibleMap[book.name] || {})
    const doneCount = statuses.filter((status) => status === 'done').length
    done += doneCount
    if (doneCount === book.chapters) booksComplete += 1
  }
  const totalChapters = bibleBooks.reduce((sum, book) => sum + book.chapters, 0)

  const realBookIds = new Set(books.map((book) => book.id))
  const completed = bookDocs.filter((doc) => realBookIds.has(doc.bookId) && doc.completed).length

  let msgLogged = 0
  let msgTarget = 0
  const messageRows = EVENT_KEYS.map((key) => {
    const logged = countByEvent(messages, key, filterKey)
    const target = benchmarks?.[key] || 0
    msgLogged += logged
    msgTarget += target
    return { key, label: LABELS[key], logged, target, p: pct(logged, target) }
  })

  let soulLogged = 0
  let soulTarget = 0
  const soulRows = EVENT_KEYS.map((key) => {
    const logged = countByEvent(souls, key, filterKey)
    const target = soulTargets?.[key] || 0
    soulLogged += logged
    soulTarget += target
    return { key, label: LABELS[key], logged, target, p: pct(logged, target) }
  })

  let prayLogged = 0
  let prayTarget = 0
  const prayerRows = EVENT_KEYS.map((key) => {
    const minutes = countByEvent(sessions, key, filterKey, (entry) => secondsOf(entry) / 60)
    const target = (prayerTargets?.[key] || 0) * DAYS
    prayLogged += minutes
    prayTarget += target
    return { key, label: LABELS[key], logged: minutes, target, p: pct(minutes, target) }
  })

  const categories = [
    {
      name: 'Bible Study',
      detail: `${done}/${totalChapters} chapters · ${booksComplete}/${bibleBooks.length} books`,
      pct: pct(done, totalChapters),
    },
    {
      name: 'Books',
      detail: `${completed}/${books.length} books completed`,
      pct: pct(completed, books.length),
    },
    {
      name: 'Messages',
      detail: `${msgLogged}/${msgTarget} logged`,
      pct: pct(msgLogged, msgTarget),
      rows: messageRows,
    },
    {
      name: 'Soul Winning',
      detail: `${soulLogged}/${soulTarget} souls`,
      pct: pct(soulLogged, soulTarget),
      rows: soulRows,
    },
    {
      name: 'Prayer & Fasting',
      detail: `${Math.round(prayLogged / 60)}h / ${Math.round(prayTarget / 60)}h prayed`,
      pct: pct(prayLogged, prayTarget),
      rows: prayerRows,
    },
  ]

  const overall = Math.round(categories.reduce((sum, category) => sum + category.pct, 0) / categories.length)

  return {
    categories,
    overall,
    grade: grade(overall),
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    generatedAt: new Date().toISOString(),
  }
}
