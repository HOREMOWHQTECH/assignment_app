import { Schema, model } from 'mongoose'

const bibleEntrySchema = new Schema(
  {
    book: { type: String, required: true },
    chapter: { type: Number, required: true },
    status: { type: String, enum: ['done', 'progress'], required: true },
  },
  { _id: false },
)

const bibleProgressSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    entries: { type: [bibleEntrySchema], default: [] },
  },
  { timestamps: true },
)

bibleProgressSchema.index({ user: 1, 'entries.book': 1, 'entries.chapter': 1 })

export const BibleProgress = model('BibleProgress', bibleProgressSchema)
