export const BIBLE_BOOKS = [
  // Old Testament
  { name: 'Genesis', chapters: 50, testament: 'ot' },
  { name: 'Exodus', chapters: 40, testament: 'ot' },
  { name: 'Leviticus', chapters: 27, testament: 'ot' },
  { name: 'Numbers', chapters: 36, testament: 'ot' },
  { name: 'Deuteronomy', chapters: 34, testament: 'ot' },
  { name: 'Joshua', chapters: 24, testament: 'ot' },
  { name: 'Judges', chapters: 21, testament: 'ot' },
  { name: 'Ruth', chapters: 4, testament: 'ot' },
  { name: '1 Samuel', chapters: 31, testament: 'ot' },
  { name: '2 Samuel', chapters: 24, testament: 'ot' },
  { name: '1 Kings', chapters: 22, testament: 'ot' },
  { name: '2 Kings', chapters: 25, testament: 'ot' },
  { name: '1 Chronicles', chapters: 29, testament: 'ot' },
  { name: '2 Chronicles', chapters: 36, testament: 'ot' },
  { name: 'Ezra', chapters: 10, testament: 'ot' },
  { name: 'Nehemiah', chapters: 13, testament: 'ot' },
  { name: 'Esther', chapters: 10, testament: 'ot' },
  { name: 'Job', chapters: 42, testament: 'ot' },
  { name: 'Psalms', chapters: 150, testament: 'ot' },
  { name: 'Proverbs', chapters: 31, testament: 'ot' },
  { name: 'Ecclesiastes', chapters: 12, testament: 'ot' },
  { name: 'Song of Solomon', chapters: 8, testament: 'ot' },
  { name: 'Isaiah', chapters: 66, testament: 'ot' },
  { name: 'Jeremiah', chapters: 52, testament: 'ot' },
  { name: 'Lamentations', chapters: 5, testament: 'ot' },
  { name: 'Ezekiel', chapters: 48, testament: 'ot' },
  { name: 'Daniel', chapters: 12, testament: 'ot' },
  { name: 'Hosea', chapters: 14, testament: 'ot' },
  { name: 'Joel', chapters: 3, testament: 'ot' },
  { name: 'Amos', chapters: 9, testament: 'ot' },
  { name: 'Obadiah', chapters: 1, testament: 'ot' },
  { name: 'Jonah', chapters: 3, testament: 'ot' },
  { name: 'Micah', chapters: 7, testament: 'ot' },
  { name: 'Nahum', chapters: 3, testament: 'ot' },
  { name: 'Habakkuk', chapters: 3, testament: 'ot' },
  { name: 'Zephaniah', chapters: 3, testament: 'ot' },
  { name: 'Haggai', chapters: 2, testament: 'ot' },
  { name: 'Zechariah', chapters: 14, testament: 'ot' },
  { name: 'Malachi', chapters: 4, testament: 'ot' },
  // New Testament
  { name: 'Matthew', chapters: 28, testament: 'nt' },
  { name: 'Mark', chapters: 16, testament: 'nt' },
  { name: 'Luke', chapters: 24, testament: 'nt' },
  { name: 'John', chapters: 21, testament: 'nt' },
  { name: 'Acts', chapters: 28, testament: 'nt' },
  { name: 'Romans', chapters: 16, testament: 'nt' },
  { name: '1 Corinthians', chapters: 16, testament: 'nt' },
  { name: '2 Corinthians', chapters: 13, testament: 'nt' },
  { name: 'Galatians', chapters: 6, testament: 'nt' },
  { name: 'Ephesians', chapters: 6, testament: 'nt' },
  { name: 'Philippians', chapters: 4, testament: 'nt' },
  { name: 'Colossians', chapters: 4, testament: 'nt' },
  { name: '1 Thessalonians', chapters: 5, testament: 'nt' },
  { name: '2 Thessalonians', chapters: 3, testament: 'nt' },
  { name: '1 Timothy', chapters: 6, testament: 'nt' },
  { name: '2 Timothy', chapters: 4, testament: 'nt' },
  { name: 'Titus', chapters: 3, testament: 'nt' },
  { name: 'Philemon', chapters: 1, testament: 'nt' },
  { name: 'Hebrews', chapters: 13, testament: 'nt' },
  { name: 'James', chapters: 5, testament: 'nt' },
  { name: '1 Peter', chapters: 5, testament: 'nt' },
  { name: '2 Peter', chapters: 3, testament: 'nt' },
  { name: '1 John', chapters: 5, testament: 'nt' },
  { name: '2 John', chapters: 1, testament: 'nt' },
  { name: '3 John', chapters: 1, testament: 'nt' },
  { name: 'Jude', chapters: 1, testament: 'nt' },
  { name: 'Revelation', chapters: 22, testament: 'nt' },
]

export const TOTAL_CHAPTERS = BIBLE_BOOKS.reduce((sum, b) => sum + b.chapters, 0)

export function getLevel(done, total) {
  if (done === 0) return { key: 'none', label: 'Not Started', icon: 'book' }
  const pct = done / total
  if (pct >= 1) return { key: 'platinum', label: 'Platinum', icon: 'star' }
  if (pct >= 0.67) return { key: 'gold', label: 'Gold', icon: 'flame' }
  if (pct >= 0.34) return { key: 'silver', label: 'Silver', icon: 'shield' }
  return { key: 'bronze', label: 'Bronze', icon: 'book' }
}

// Factory for admin-added bible books.
export function createBibleBook(name, chapters) {
  return { id: `custom-${crypto.randomUUID()}`, name, chapters: Math.max(1, parseInt(chapters, 10) || 1), testament: 'custom', custom: true }
}
