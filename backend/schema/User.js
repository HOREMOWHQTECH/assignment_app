import { Schema, model } from 'mongoose'

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, select: false },
    googleId: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ['member', 'leader', 'admin'], default: 'member' },
    country: { type: String, default: '' },
    state: { type: String, default: '' },
    event: { type: String, default: '' },
    chapter: { type: String, default: '' },
    zone: { type: String, default: '' },
  },
  { timestamps: true },
)

export const User = model('User', userSchema)
