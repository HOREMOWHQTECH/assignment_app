const PARA = [
  'Holiness is not a destination but a daily pursuit. In every chapter of this book, the author invites the reader to examine the heart and align it with the mind of Christ.',
  'The foundation of spiritual growth rests on three pillars: consistent prayer, faithful study of the Word, and active fellowship with believers who sharpen iron.',
  'When trials come, they are not meant to destroy but to refine. The fire that tests the gold is the same fire that purifies the believer for greater service.',
  'True leadership begins at the feet of Jesus. A leader who does not serve is merely a manager of people, not a shepherd of souls.',
  'The church is not a building but a body — living stones joined together, each one necessary, each one called to a unique expression of grace.',
  'Discipline is the bridge between intention and transformation. Small daily choices, repeated over time, produce the character that honors God.',
  'Faith without works is dead, yet works without faith are empty. Both must flow from a heart that has been touched by the love of the Father.',
  'In the quiet hours of the morning, before the noise of the day begins, the soul finds its anchor. There, in stillness, clarity is born.',
  'Every believer is a minister. The pulpit is one place of service, but the marketplace, the home, and the neighborhood are equally sacred.',
  'Forgiveness is not weakness but strength refined by the Spirit. To forgive is to release the debt and reclaim the peace that belongs to you.',
]

function makePages(count, seed) {
  const pages = []
  for (let i = 0; i < count; i++) {
    const start = (seed + i * 3) % PARA.length
    pages.push(PARA.slice(start, start + 3).join(' '))
  }
  return pages
}

function makeChapters(chapterCount, pagesPerChapter, seed) {
  return Array.from({ length: chapterCount }, (_, i) => ({
    title: `Chapter ${i + 1}`,
    pages: makePages(pagesPerChapter, seed + i * 7),
  }))
}

// Placeholder cover — backend will provide real cover image URLs later.
function coverDataUri(title, author, hue) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="560" viewBox="0 0 400 560">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="hsl(${hue},45%,38%)"/><stop offset="1" stop-color="hsl(${hue + 30},50%,22%)"/>
  </linearGradient></defs>
  <rect width="400" height="560" fill="url(#g)"/>
  <rect x="28" y="28" width="344" height="504" rx="10" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="2"/>
  <text x="200" y="250" text-anchor="middle" font-family="Georgia,serif" font-size="30" font-weight="bold" fill="#fff">${title}</text>
  <text x="200" y="300" text-anchor="middle" font-family="Georgia,serif" font-size="17" fill="rgba(255,255,255,.85)">${author}</text>
  <text x="200" y="480" text-anchor="middle" font-family="Georgia,serif" font-size="13" letter-spacing="4" fill="rgba(255,255,255,.6)">HOREMOW</text>
</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const RAW = [
  { id: 'b1', title: 'Foundations of Holiness', author: 'Bishop T. Adeyemi', hue: 160, chapters: makeChapters(4, 4, 0) },
  { id: 'b2', title: 'The Disciplined Life', author: 'Rev. C. Okafor', hue: 210, chapters: makeChapters(3, 4, 4) },
  { id: 'b3', title: 'Prayers That Move Mountains', author: 'Elder S. Bello', hue: 45, chapters: makeChapters(4, 4, 8) },
  { id: 'b4', title: 'Walking in Purpose', author: 'Dr. A. Nwosu', hue: 280, chapters: makeChapters(3, 4, 2) },
  { id: 'b5', title: 'The Armor of God', author: 'Pastor F. Eze', hue: 0, chapters: makeChapters(5, 4, 6) },
  { id: 'b6', title: 'Renewing the Mind', author: 'Sister M. Obi', hue: 190, chapters: makeChapters(3, 4, 10) },
  { id: 'b7', title: 'Faith Over Fear', author: 'Deacon K. Musa', hue: 120, chapters: makeChapters(4, 4, 1) },
  { id: 'b8', title: 'The Table of Fellowship', author: 'Rev. J. Adekunle', hue: 30, chapters: makeChapters(3, 4, 5) },
  { id: 'b9', title: 'Roots of Revival', author: 'Bishop P. Osei', hue: 340, chapters: makeChapters(4, 4, 9) },
  { id: 'b10', title: 'Grace for the Journey', author: 'Pastor L. Chukwu', hue: 260, chapters: makeChapters(3, 4, 3) },
]

export const BOOKS = RAW.map((b) => ({
  ...b,
  cover: coverDataUri(b.title, b.author, b.hue),
  pageCount: b.chapters.reduce((n, c) => n + c.pages.length, 0),
}))

export function getBook(id) {
  return BOOKS.find((b) => b.id === id)
}
