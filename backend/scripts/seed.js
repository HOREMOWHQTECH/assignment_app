import { pathToFileURL } from 'node:url'
import { connectDB, disconnectDB } from '../lib/db.js'
import { BIBLE_BOOKS } from '../constants/bible-books.js'
import { CONFIG_DEFAULTS } from '../constants/defaults.js'
import { BibleBook } from '../schema/BibleBook.js'
import { Book } from '../schema/Book.js'
import { BookProgress } from '../schema/BookProgress.js'
import { Setting } from '../schema/Setting.js'
import { User } from '../schema/User.js'

export async function seedDatabase() {
  await connectDB()

  await Book.deleteMany({ custom: { $ne: true } })
  const realBookIds = await Book.distinct('id', { custom: true })
  await BookProgress.deleteMany({ bookId: { $nin: realBookIds } })
  await User.updateMany(
    { event: 'December (General) Conference' },
    { $set: { event: '' } },
  )

  await Promise.all([
    ...BIBLE_BOOKS.map((book) => BibleBook.updateOne({ id: book.id }, { $set: book }, { upsert: true })),
    ...Object.entries(CONFIG_DEFAULTS).map(([key, value]) =>
      Setting.updateOne({ key }, { $setOnInsert: { value } }, { upsert: true }),
    ),
  ])

  return true
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await seedDatabase()
    console.log('Seed complete: Bible books and admin config are ready.')
  } catch (error) {
    console.error('Seed failed:', error)
    process.exitCode = 1
  } finally {
    await disconnectDB()
  }
}
