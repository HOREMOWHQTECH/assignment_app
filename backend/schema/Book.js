import { Schema, model } from 'mongoose'

const bookSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    audiences: { type: [String], default: ['general'] },
    custom: { type: Boolean, default: false },
    pdf: { type: Boolean, default: false },
    fileId: { type: Schema.Types.ObjectId },
    coverFileId: { type: Schema.Types.ObjectId },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

export const Book = model('Book', bookSchema)
