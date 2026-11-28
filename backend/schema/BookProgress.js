import { Schema, model } from 'mongoose'

const highlightSchema = new Schema(
  {
    chapter: { type: Number, required: true },
    page: { type: Number, required: true },
    quote: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
)

const bookProgressSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookId: { type: String, required: true },
    chapter: { type: Number, default: 0 },
    page: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    lastRead: { type: Number, default: Date.now },
    highlights: { type: [highlightSchema], default: [] },
  },
  { timestamps: true },
)

bookProgressSchema.index({ user: 1, bookId: 1 }, { unique: true })

export const BookProgress = model('BookProgress', bookProgressSchema)
