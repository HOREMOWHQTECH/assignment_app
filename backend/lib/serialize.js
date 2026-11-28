export function serializeBook(book) {
  if (!book) return null
  const data = typeof book.toObject === 'function' ? book.toObject() : book
  return {
    id: data.id,
    title: data.title,
    author: data.author,
    audiences: data.audiences || [],
    custom: Boolean(data.custom),
    pdf: Boolean(data.pdf),
    fileUrl: data.pdf ? `/books/${data.id}/file` : undefined,
    coverUrl: data.coverFileId ? `/books/${data.id}/cover` : undefined,
    createdAt: data.createdAt,
  }
}

export function serializeBibleBook(book) {
  if (!book) return null
  const data = typeof book.toObject === 'function' ? book.toObject() : book
  return {
    id: data.id,
    name: data.name,
    chapters: data.chapters,
    testament: data.testament,
    custom: Boolean(data.custom),
  }
}
