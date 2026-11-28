import { Schema, model } from 'mongoose'

const logSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true },
    loggedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

export const Log = model('Log', logSchema)
