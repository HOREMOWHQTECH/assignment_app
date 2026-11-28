import { Schema, model } from 'mongoose'

const prayerSessionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    seconds: { type: Number, min: 0 },
    minutes: { type: Number, required: true, min: 0 },
    events: { type: [String], default: ['general'] },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

export const PrayerSession = model('PrayerSession', prayerSessionSchema)
