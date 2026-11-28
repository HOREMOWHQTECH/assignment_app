import { Schema, model } from 'mongoose'

const tokenDenylistSchema = new Schema(
  {
    jti: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
)

tokenDenylistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const TokenDenylist = model('TokenDenylist', tokenDenylistSchema)
