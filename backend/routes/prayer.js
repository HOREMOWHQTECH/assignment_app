import { Router } from 'express'
import { protect } from '../auth/index.js'
import { PrayerSession } from '../schema/PrayerSession.js'
import { asyncHandler, badRequest, notFound } from '../lib/errors.js'
import { events } from '../lib/validation.js'

export const prayerRouter = Router()
prayerRouter.use(protect)

function durationSeconds(body) {
  if (body.seconds !== undefined) {
    const seconds = Number(body.seconds)
    if (!Number.isFinite(seconds) || seconds < 1) throw badRequest('Seconds must be at least 1')
    return Math.floor(seconds)
  }

  const minutes = Number(body.minutes)
  if (!Number.isFinite(minutes) || minutes <= 0) throw badRequest('Minutes must be greater than 0')
  return Math.round(minutes * 60)
}

prayerRouter.get(
  '/sessions',
  asyncHandler(async (req, res) => {
    const sessions = await PrayerSession.find({ user: req.user.id }).sort({ date: -1 }).lean()
    res.json({ sessions })
  }),
)

prayerRouter.post(
  '/sessions',
  asyncHandler(async (req, res) => {
    const seconds = durationSeconds(req.body || {})
    const session = await PrayerSession.create({
      user: req.user.id,
      seconds,
      minutes: seconds / 60,
      events: events(req.body.events),
      date: req.body.date ? new Date(req.body.date) : new Date(),
    })
    res.status(201).json({ session })
  }),
)

prayerRouter.delete(
  '/sessions/:id',
  asyncHandler(async (req, res) => {
    const session = await PrayerSession.findOneAndDelete({ _id: req.params.id, user: req.user.id })
    if (!session) throw notFound('Prayer session not found')
    res.json({ ok: true })
  }),
)
