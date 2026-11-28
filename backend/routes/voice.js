import { Router } from 'express'
import { protect } from '../auth/index.js'
import { asyncHandler, badRequest } from '../lib/errors.js'

export const voiceRouter = Router()
voiceRouter.use(protect)

const ROUTES = [
  { keys: ['bible'], path: '/bible-study', label: 'Bible Study' },
  { keys: ['book'], path: '/books', label: 'HOREMOW Books' },
  { keys: ['message'], path: '/messages', label: 'Messages' },
  { keys: ['soul'], path: '/soul-winning', label: 'Soul Winning' },
  { keys: ['prayer', 'fasting'], path: '/prayer-fasting', label: 'Prayer & Fasting' },
  { keys: ['report'], path: '/reports', label: 'Official Report' },
  { keys: ['setting'], path: '/settings', label: 'Settings' },
  { keys: ['admin'], path: '/admin', label: 'Admin' },
  { keys: ['dashboard', 'home', 'main'], path: '/', label: 'Dashboard' },
]

const ANSWERS = [
  {
    keys: ['help', 'what can you do'],
    reply: 'I can take you to any page — just say "go to Bible study", "open books", "show my report", or "prayer timer".',
  },
  {
    keys: ['progress', 'score'],
    reply: 'Your full progress report is on the Reports page — say "go to report" to open it.',
  },
  { keys: ['streak'], reply: 'Keep logging daily — your streak grows every day you pray, read, and win souls.' },
  { keys: ['hello', 'hi', 'hey'], reply: 'Hello! I am your HOREMOW voice assistant. Where would you like to go?' },
  { keys: ['thank'], reply: "You're welcome! Keep up the great work." },
]

voiceRouter.post(
  '/chat',
  asyncHandler(async (req, res) => {
    const message = String(req.body.message || '').trim()
    if (!message) throw badRequest('message is required')

    const text = message.toLowerCase()
    const route = ROUTES.find((item) => item.keys.some((key) => text.includes(key)))
    if (route) {
      return res.json({
        reply: `Opening ${route.label}.`,
        action: { type: 'navigate', path: route.path },
      })
    }

    const answer = ANSWERS.find((item) => item.keys.some((key) => text.includes(key)))
    res.json({ reply: answer?.reply || "I didn't catch that. Try \"go to books\" or \"help\"." })
  }),
)
