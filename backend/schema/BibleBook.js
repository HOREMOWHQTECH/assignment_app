import { Schema, model } from 'mongoose'

const bibleBookSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true, trim: true },
    chapters: { type: Number, required: true, min: 1 },
    testament: { type: String, enum: ['ot', 'nt', 'custom'], default: 'custom' },
    custom: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export const BibleBook = model('BibleBook', bibleBookSchema)
