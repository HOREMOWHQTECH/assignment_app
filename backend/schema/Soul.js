import { Schema, model } from 'mongoose'

const soulSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, default: '' },
    note: { type: String, default: '' },
    tag: { type: String, enum: ['standing', 'conference', 'none'], default: 'none' },
    events: { type: [String], default: ['general'] },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

export const Soul = model('Soul', soulSchema)
