import { Schema, model } from 'mongoose'

const messageSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    speaker: { type: String, required: true, trim: true },
    audiences: { type: [String], default: ['general'] },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

export const Message = model('Message', messageSchema)
